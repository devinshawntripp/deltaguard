"use client";

import React from "react";
import Link from "next/link";
import ProgressGraph from "@/components/ProgressGraph";

export default function LogViewerSection({ scanId }: { scanId: string }) {
    const [expanded, setExpanded] = React.useState(false);
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Workflow</div>
                <div className="flex items-center gap-2 text-sm">
                    <button onClick={() => setExpanded((e) => !e)} className="underline">
                        {expanded ? "Collapse" : "Expand"}
                    </button>
                    <Link href={`/dashboard/${scanId}/logs`} className="underline">Full logs →</Link>
                </div>
            </div>
            <ProgressGraph
                scanId={scanId}
                eventsPath={`/api/jobs/${scanId}/events`}
                height={expanded ? "viewport" : "compact"}
            />
        </div>
    );
}
