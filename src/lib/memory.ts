export type MemoryPackage = {
    id: string;
    createdAt: string;
    updatedAt: string;
    originalName: string;
    storedPath: string;
    mediaType: string;
    sizeBytes: number;
    sha256: string;
    packageType: "BINARY" | "CONTAINER";
    status: "UPLOADED" | "SCANNING" | "COMPLETED" | "FAILED";
};

export type MemoryScan = {
    id: string;
    createdAt: string;
    updatedAt: string;
    packageId: string;
    scanType: "BIN" | "CONTAINER" | "LICENSE" | "VULN" | "REDHAT";
    status: "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED";
    startedAt?: string;
    finishedAt?: string;
    output?: any;
    rawOutput?: string;
    error?: string;
};

type MemoryDb = {
    packages: MemoryPackage[];
    scans: MemoryScan[];
};

declare global {
    // eslint-disable-next-line no-var
    var __memoryDb: MemoryDb | undefined;
}

export const memoryDb: MemoryDb = global.__memoryDb ?? { packages: [], scans: [] };
if (process.env.NODE_ENV !== "production") global.__memoryDb = memoryDb;



