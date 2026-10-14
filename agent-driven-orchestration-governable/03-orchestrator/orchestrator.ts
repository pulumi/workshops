#!/usr/bin/env node
// The "agent" in this demo: a deterministic Node.js script, not a live LLM
// call (see README and 05-llm-stretch for the optional extension). It drives
// 01-fleet through Automation API, gated every time by 02-policy, and logs
// every attempt — approved or blocked — to the audit log.
//
// Usage:
//   node bin/orchestrator.js scale-up   --replicas 4 [--approve]
//   node bin/orchestrator.js scale-down --replicas 2 [--approve]
//   node bin/orchestrator.js rotate                  [--approve]

import { FleetOutputs, POLICY_PACK_DIR, readFleetOutputs, selectFleetStack } from "./lib/automation";
import { AuditEntry, appendAuditEntry } from "./lib/audit";

type Action = "scale-up" | "scale-down" | "rotate";

interface ParsedArgs {
    action: Action;
    replicas?: number;
    approve: boolean;
}

function parseArgs(argv: string[]): ParsedArgs {
    const action = argv[0];
    if (action !== "scale-up" && action !== "scale-down" && action !== "rotate") {
        throw new Error("Usage: orchestrator <scale-up|scale-down|rotate> [--replicas N] [--approve]");
    }
    let replicas: number | undefined;
    let approve = false;
    for (let i = 1; i < argv.length; i++) {
        if (argv[i] === "--replicas") {
            replicas = Number(argv[++i]);
        } else if (argv[i] === "--approve") {
            approve = true;
        }
    }
    if ((action === "scale-up" || action === "scale-down") && (replicas === undefined || Number.isNaN(replicas))) {
        throw new Error(`${action} needs --replicas N`);
    }
    return { action, replicas, approve };
}

function extractBlockReason(message: string): string {
    const match = message.match(/Blocked: '[^\n]*/);
    if (match) {
        return match[0];
    }
    return message.split("\n").find((line) => line.trim().length > 0) ?? message;
}

async function main(): Promise<void> {
    const args = parseArgs(process.argv.slice(2));
    console.log(`orchestrator: ${args.action} (approve=${args.approve})`);

    const stack = await selectFleetStack();
    const before: FleetOutputs = await readFleetOutputs(stack);

    await stack.setConfig("action", { value: args.action });
    await stack.setConfig("approved", { value: String(args.approve) });

    if (args.action === "rotate") {
        await stack.setConfig("rotateTrigger", { value: new Date().toISOString() });
        if (before.replicaCount !== undefined) {
            await stack.setConfig("replicaCount", { value: String(before.replicaCount) });
        }
    } else {
        await stack.setConfig("replicaCount", { value: String(args.replicas) });
    }

    const timestamp = new Date().toISOString();
    try {
        const upResult = await stack.up({
            policyPacks: [POLICY_PACK_DIR],
            onOutput: (msg: string) => process.stdout.write(msg),
        });
        const after = {
            replicaCount: upResult.outputs.replicaCountOut?.value,
            configVersion: upResult.outputs.configVersion?.value,
            approved: upResult.outputs.approvedOut?.value,
        };
        const entry: AuditEntry = {
            timestamp,
            action: args.action,
            requestedApproval: args.approve,
            result: "approved",
            before,
            after,
            reason: null,
        };
        appendAuditEntry(entry);
        console.log(`APPROVED  ${args.action}  before=${JSON.stringify(before)}  after=${JSON.stringify(after)}`);
        process.exit(0);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const reason = extractBlockReason(message);
        const entry: AuditEntry = {
            timestamp,
            action: args.action,
            requestedApproval: args.approve,
            result: "blocked",
            before,
            after: null,
            reason,
        };
        appendAuditEntry(entry);
        console.error(`BLOCKED  ${args.action}  reason=${reason}`);
        process.exit(1);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
