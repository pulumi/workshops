#!/usr/bin/env node
// The audit trail the presenter opens and walks through in step 7: every
// attempted action, whether it was approved or blocked, and why. Reads the
// same log file 03-orchestrator writes to; this script only ever reads it.

import * as fs from "fs";
import * as path from "path";

// Compiled location is bin/read-audit.js, two levels below the workshop root.
const AUDIT_LOG_PATH = path.resolve(__dirname, "..", "..", ".audit", "log.json");

interface AuditEntry {
    timestamp: string;
    action: string;
    requestedApproval: boolean;
    result: "approved" | "blocked";
    before: Record<string, unknown>;
    after: Record<string, unknown> | null;
    reason: string | null;
}

function loadEntries(): AuditEntry[] {
    if (!fs.existsSync(AUDIT_LOG_PATH)) {
        return [];
    }
    const raw = fs.readFileSync(AUDIT_LOG_PATH, "utf8").trim();
    return raw ? (JSON.parse(raw) as AuditEntry[]) : [];
}

function main(): void {
    const entries = loadEntries();
    if (entries.length === 0) {
        console.log("No audit entries yet. Run 03-orchestrator at least once first.");
        return;
    }
    console.log(`${entries.length} attempted action(s) in ${AUDIT_LOG_PATH}:\n`);
    entries.forEach((entry, i) => {
        const outcome = entry.result === "approved" ? "APPROVED" : "BLOCKED ";
        console.log(`${String(i + 1).padStart(2, "0")}. [${entry.timestamp}] ${outcome} ${entry.action}`);
        console.log(`    requested approval: ${entry.requestedApproval}`);
        console.log(`    before: ${JSON.stringify(entry.before)}`);
        if (entry.result === "approved") {
            console.log(`    after:  ${JSON.stringify(entry.after)}`);
        } else {
            console.log(`    reason: ${entry.reason}`);
        }
        console.log("");
    });
    const approved = entries.filter((e) => e.result === "approved").length;
    const blocked = entries.length - approved;
    console.log(`Summary: ${approved} approved, ${blocked} blocked.`);
}

main();
