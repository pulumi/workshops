import * as fs from "fs";
import * as path from "path";

// A local, append-only JSON audit log every orchestrator action writes to,
// whether the policy pack approved or blocked it. 04-audit/read-audit.ts is
// the reader the presenter walks through in step 7.

// Compiled location is bin/lib/audit.js, three levels below the workshop root.
export const AUDIT_LOG_PATH = path.resolve(__dirname, "..", "..", "..", ".audit", "log.json");

export interface AuditEntry {
    timestamp: string;
    action: "scale-up" | "scale-down" | "rotate";
    requestedApproval: boolean;
    result: "approved" | "blocked";
    before: Record<string, unknown>;
    after: Record<string, unknown> | null;
    reason: string | null;
}

function readLog(): AuditEntry[] {
    if (!fs.existsSync(AUDIT_LOG_PATH)) {
        return [];
    }
    const raw = fs.readFileSync(AUDIT_LOG_PATH, "utf8").trim();
    if (!raw) {
        return [];
    }
    return JSON.parse(raw) as AuditEntry[];
}

export function appendAuditEntry(entry: AuditEntry): void {
    const entries = readLog();
    entries.push(entry);
    fs.mkdirSync(path.dirname(AUDIT_LOG_PATH), { recursive: true });
    fs.writeFileSync(AUDIT_LOG_PATH, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
}

export function readAuditLog(): AuditEntry[] {
    return readLog();
}
