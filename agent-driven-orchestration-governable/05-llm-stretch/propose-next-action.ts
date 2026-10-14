#!/usr/bin/env node
// Stretch goal (brief §4 step 8): replace the orchestrator's own decision of
// "what to do next" with a single call to an LLM API. Explicitly out of the
// graded demo path — the presenter shows this, does not necessarily run it
// live. It never runs the proposed action itself: whatever it proposes
// still has to go through 03-orchestrator, so it is still gated by the same
// unmodified policy pack. No API key is required to run this script; absent
// one, it prints a deterministic proposal instead of a live model call and
// says so plainly.
//
// This script deliberately does not import 03-orchestrator's lib/: each
// project compiles to its own outDir (see tsconfig `outDir: "bin"`), so a
// cross-project require would resolve against the wrong compiled path at
// runtime. It re-implements the small amount of stack-reading and
// audit-log-reading it needs instead — consistent with every numbered
// folder here being self-contained.

import * as fs from "fs";
import * as path from "path";
import { LocalWorkspace } from "@pulumi/pulumi/automation";

const FLEET_STACK_NAME = "dev";
// Compiled location is bin/propose-next-action.js, two levels below the
// workshop root (see 03-orchestrator/lib/automation.ts for the same fix).
const FLEET_WORK_DIR = path.resolve(__dirname, "..", "..", "01-fleet");
const STATE_DIR = path.resolve(__dirname, "..", "..", ".pulumi-local-state");
const AUDIT_LOG_PATH = path.resolve(__dirname, "..", "..", ".audit", "log.json");
const DEMO_PASSPHRASE = "agent-driven-orchestration-governable-demo";

interface FleetOutputs {
    replicaCount?: number;
    configVersion?: string;
}

interface AuditEntry {
    action: string;
    result: "approved" | "blocked";
}

async function readFleetOutputs(): Promise<FleetOutputs> {
    try {
        const stack = await LocalWorkspace.createOrSelectStack(
            { stackName: FLEET_STACK_NAME, workDir: FLEET_WORK_DIR },
            {
                envVars: {
                    PULUMI_BACKEND_URL: `file://${STATE_DIR}`,
                    PULUMI_CONFIG_PASSPHRASE: process.env.PULUMI_CONFIG_PASSPHRASE ?? DEMO_PASSPHRASE,
                },
            },
        );
        const outs = await stack.outputs();
        return {
            replicaCount: outs.replicaCountOut?.value as number | undefined,
            configVersion: outs.configVersion?.value as string | undefined,
        };
    } catch {
        return {};
    }
}

function readAuditLog(): AuditEntry[] {
    if (!fs.existsSync(AUDIT_LOG_PATH)) {
        return [];
    }
    const raw = fs.readFileSync(AUDIT_LOG_PATH, "utf8").trim();
    return raw ? (JSON.parse(raw) as AuditEntry[]) : [];
}

interface Proposal {
    action: "scale-up" | "scale-down" | "rotate";
    replicas?: number;
    rationale: string;
}

function deterministicProposal(replicaCount: number | undefined, lastAction: string | undefined): Proposal {
    // No live model call: a simple, explainable rule standing in for one, so
    // this script has something concrete to print without an API key.
    if (replicaCount === undefined) {
        return { action: "scale-up", replicas: 2, rationale: "No fleet exists yet; propose the baseline size." };
    }
    if (lastAction === "rotate") {
        return {
            action: "scale-down",
            replicas: Math.max(1, replicaCount - 2),
            rationale: "Config just rotated; propose returning to a lower baseline once it settles.",
        };
    }
    return {
        action: "rotate",
        rationale: "No recent rotation in the audit log; propose rotating configVersion next.",
    };
}

async function llmProposal(replicaCount: number | undefined, lastAction: string | undefined): Promise<Proposal> {
    const apiKey = process.env.OPENAI_API_KEY;
    const prompt =
        `Current worker fleet replicaCount is ${replicaCount ?? "unknown"}. ` +
        `The last orchestrator action was "${lastAction ?? "none"}". ` +
        "Propose exactly one next action as JSON: " +
        '{"action": "scale-up"|"scale-down"|"rotate", "replicas": number (omit for rotate), "rationale": string}.';

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        }),
    });
    if (!response.ok) {
        throw new Error(`OpenAI API returned ${response.status}`);
    }
    const body = (await response.json()) as { choices: { message: { content: string } }[] };
    return JSON.parse(body.choices[0].message.content) as Proposal;
}

async function main(): Promise<void> {
    const outputs = await readFleetOutputs();
    const auditLog = readAuditLog();
    const lastAction = auditLog.length > 0 ? auditLog[auditLog.length - 1].action : undefined;

    let proposal: Proposal;
    if (process.env.OPENAI_API_KEY) {
        console.log("Calling the LLM API for a proposal (OPENAI_API_KEY is set)...");
        proposal = await llmProposal(outputs.replicaCount, lastAction);
    } else {
        console.log("[DRY RUN] OPENAI_API_KEY not set — no live model call made, using a deterministic stand-in.");
        proposal = deterministicProposal(outputs.replicaCount, lastAction);
    }

    console.log(
        `\nProposed next action: ${proposal.action}${proposal.replicas ? ` --replicas ${proposal.replicas}` : ""}`,
    );
    console.log(`Rationale: ${proposal.rationale}`);
    const orchestratorScript = path.resolve(__dirname, "..", "..", "03-orchestrator", "bin", "orchestrator.js");
    const replicasFlag = proposal.replicas ? ` --replicas ${proposal.replicas}` : "";
    console.log(
        "\nThis proposal is not applied automatically. To run it — still gated by the same policy pack — a " +
            `human reviews it and runs:\n  node ${orchestratorScript} ${proposal.action}${replicasFlag} --approve`,
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
