import { prisma, ensurePlatformSchema } from "@/lib/prisma";
import crypto from "node:crypto";

export type NotificationChannel = {
    id: string;
    org_id: string;
    channel_type: "slack" | "discord" | "webhook" | "email";
    name: string;
    config: Record<string, unknown>;
    enabled: boolean;
    created_at: string;
};

export type ScanSummary = {
    jobId: string;
    imageRef?: string;
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
};

const BASE_URL = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://scanrook.io";

function buildMessage(summary: ScanSummary): string {
    const image = summary.imageRef || "Unknown";
    return `*ScanRook Scan Complete*\n*Image:* \`${image}\`\n*Critical:* ${summary.critical} | *High:* ${summary.high} | *Medium:* ${summary.medium} | *Low:* ${summary.low}\n*Total:* ${summary.total} findings\n<${BASE_URL}/dashboard/${summary.jobId}|View Results>`;
}

function buildSlackPayload(summary: ScanSummary) {
    return {
        text: "ScanRook scan completed",
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: buildMessage(summary),
                },
            },
        ],
    };
}

function buildDiscordPayload(summary: ScanSummary) {
    const image = summary.imageRef || "Unknown";
    return {
        content: `**ScanRook Scan Complete**\n**Image:** \`${image}\`\n**Critical:** ${summary.critical} | **High:** ${summary.high} | **Medium:** ${summary.medium} | **Low:** ${summary.low}\n**Total:** ${summary.total} findings\n[View Results](${BASE_URL}/dashboard/${summary.jobId})`,
    };
}

function buildWebhookPayload(summary: ScanSummary) {
    return {
        event: "scan.completed",
        job_id: summary.jobId,
        image_ref: summary.imageRef || null,
        findings: {
            critical: summary.critical,
            high: summary.high,
            medium: summary.medium,
            low: summary.low,
            total: summary.total,
        },
        dashboard_url: `${BASE_URL}/dashboard/${summary.jobId}`,
        timestamp: new Date().toISOString(),
    };
}

export async function sendSlackNotification(webhookUrl: string, summary: ScanSummary): Promise<void> {
    const payload = buildSlackPayload(summary);
    const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        throw new Error(`Slack webhook failed: ${res.status} ${await res.text()}`);
    }
}

export async function sendDiscordNotification(webhookUrl: string, summary: ScanSummary): Promise<void> {
    const payload = buildDiscordPayload(summary);
    const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        throw new Error(`Discord webhook failed: ${res.status} ${await res.text()}`);
    }
}

export async function sendWebhookNotification(
    url: string,
    secret: string | undefined,
    summary: ScanSummary,
): Promise<void> {
    const payload = JSON.stringify(buildWebhookPayload(summary));
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (secret) {
        const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
        headers["X-Scanrook-Signature"] = signature;
    }
    const res = await fetch(url, { method: "POST", headers, body: payload });
    if (!res.ok) {
        throw new Error(`Webhook failed: ${res.status} ${await res.text()}`);
    }
}

export async function sendEmailNotification(addresses: string[], summary: ScanSummary): Promise<void> {
    // Placeholder — email requires SMTP configuration
    console.log(
        `[notifications] Would send email to ${addresses.join(", ")} for job ${summary.jobId}: ${summary.total} findings`,
    );
}

async function sendToChannel(channel: NotificationChannel, summary: ScanSummary): Promise<void> {
    const cfg = channel.config as Record<string, any>;
    switch (channel.channel_type) {
        case "slack":
            await sendSlackNotification(cfg.webhook_url, summary);
            break;
        case "discord":
            await sendDiscordNotification(cfg.webhook_url, summary);
            break;
        case "webhook":
            await sendWebhookNotification(cfg.url, cfg.secret, summary);
            break;
        case "email":
            await sendEmailNotification(cfg.addresses || [], summary);
            break;
        default:
            console.warn(`[notifications] Unknown channel type: ${channel.channel_type}`);
    }
}

export async function sendScanNotification(orgId: string, summary: ScanSummary): Promise<{
    sent: number;
    errors: string[];
}> {
    await ensurePlatformSchema();
    let sent = 0;
    const errors: string[] = [];

    const channels = await prisma.$queryRaw<NotificationChannel[]>`
        SELECT id, org_id, channel_type, name, config, enabled, created_at::text
        FROM notification_channels
        WHERE org_id = ${orgId}::uuid AND enabled = true
    `;

    for (const channel of channels) {
        try {
            await sendToChannel(channel, summary);
            sent++;
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            errors.push(`${channel.channel_type}/${channel.name}: ${msg}`);
            console.error(`[notifications] Failed to send to ${channel.channel_type}/${channel.name}: ${msg}`);
        }
    }

    return { sent, errors };
}

export async function sendTestNotification(channel: NotificationChannel): Promise<void> {
    const testSummary: ScanSummary = {
        jobId: "00000000-0000-0000-0000-000000000000",
        imageRef: "test/image:latest",
        critical: 1,
        high: 3,
        medium: 7,
        low: 12,
        total: 23,
    };
    await sendToChannel(channel, testSummary);
}
