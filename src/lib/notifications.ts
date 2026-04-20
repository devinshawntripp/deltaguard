import { prisma, ensurePlatformSchema } from "@/lib/prisma";
import { proxyFetch } from "@/lib/proxyFetch";
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
    const res = await proxyFetch(webhookUrl, {
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
    const res = await proxyFetch(webhookUrl, {
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
    const res = await proxyFetch(url, { method: "POST", headers, body: payload });
    if (!res.ok) {
        throw new Error(`Webhook failed: ${res.status} ${await res.text()}`);
    }
}

export async function sendEmailNotification(addresses: string[], summary: ScanSummary): Promise<void> {
    const apiKey = process.env.SMTP_PASS; // Brevo uses the SMTP key as API key too
    const smtpFrom = process.env.SMTP_FROM || "info@scanrook.io";

    if (!apiKey) {
        throw new Error(
            "Email notifications are not configured. Set SMTP_PASS (Brevo API key) environment variable.",
        );
    }

    if (!addresses.length) {
        throw new Error("No email addresses configured for this channel.");
    }

    const image = summary.imageRef || "Unknown";
    const dashboardUrl = `${BASE_URL}/dashboard/${summary.jobId}`;

    const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="margin: 0 0 16px; color: #1a1a1a;">ScanRook Scan Complete</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                <tr><td style="padding: 8px 0; color: #666;">Image</td><td style="padding: 8px 0; font-weight: 600;"><code>${image}</code></td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Total Findings</td><td style="padding: 8px 0; font-weight: 600;">${summary.total}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Critical</td><td style="padding: 8px 0; color: ${summary.critical > 0 ? '#dc2626' : '#16a34a'}; font-weight: 600;">${summary.critical}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">High</td><td style="padding: 8px 0; color: ${summary.high > 0 ? '#ea580c' : '#16a34a'}; font-weight: 600;">${summary.high}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Medium</td><td style="padding: 8px 0;">${summary.medium}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Low</td><td style="padding: 8px 0;">${summary.low}</td></tr>
            </table>
            <a href="${dashboardUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500;">View Full Results</a>
            <p style="margin-top: 24px; font-size: 12px; color: #999;">Sent by <a href="https://scanrook.io" style="color: #2563eb;">ScanRook</a></p>
        </div>
    `;

    // Use Brevo's HTTP API (port 443) instead of SMTP (port 587)
    // because the cluster's Squid proxy blocks CONNECT to port 587.
    const res = await proxyFetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "api-key": apiKey,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            sender: { name: "ScanRook", email: smtpFrom },
            to: addresses.map(email => ({ email })),
            subject: `ScanRook: ${summary.total} findings in ${image}`,
            htmlContent: html,
            textContent: `ScanRook Scan Complete\n\nImage: ${image}\nTotal: ${summary.total} (Critical: ${summary.critical}, High: ${summary.high}, Medium: ${summary.medium}, Low: ${summary.low})\n\nView results: ${dashboardUrl}`,
        }),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Brevo API failed (${res.status}): ${body.slice(0, 200)}`);
    }
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
