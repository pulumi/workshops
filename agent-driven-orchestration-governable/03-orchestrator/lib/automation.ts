import * as path from "path";
import { LocalWorkspace, Stack } from "@pulumi/pulumi/automation";

// Shared Automation API wiring for every action the orchestrator drives.
// One stack, one local (file://) backend, one policy pack — all resolved
// relative to this file so the orchestrator works from any cwd.

export const FLEET_STACK_NAME = "dev";
// Compiled location is bin/lib/automation.js (outDir "bin" plus this file's
// own lib/ subdirectory), three levels below the workshop root.
export const FLEET_WORK_DIR = path.resolve(__dirname, "..", "..", "..", "01-fleet");
export const POLICY_PACK_DIR = path.resolve(__dirname, "..", "..", "..", "02-policy");
export const STATE_DIR = path.resolve(__dirname, "..", "..", "..", ".pulumi-local-state");

// A demo passphrase, not a secret: it only protects a local, throwaway
// backend that never leaves this machine. scripts/setup.sh documents it.
const DEMO_PASSPHRASE = "agent-driven-orchestration-governable-demo";

function passphrase(): string {
    return process.env.PULUMI_CONFIG_PASSPHRASE ?? DEMO_PASSPHRASE;
}

export async function selectFleetStack(): Promise<Stack> {
    return LocalWorkspace.createOrSelectStack(
        { stackName: FLEET_STACK_NAME, workDir: FLEET_WORK_DIR },
        {
            envVars: {
                PULUMI_BACKEND_URL: `file://${STATE_DIR}`,
                PULUMI_CONFIG_PASSPHRASE: passphrase(),
            },
        },
    );
}

export interface FleetOutputs {
    [key: string]: unknown;
    replicaCount?: number;
    configVersion?: string;
    approved?: boolean;
}

/** Reads the fleet's last-known outputs. Empty on the very first run. */
export async function readFleetOutputs(stack: Stack): Promise<FleetOutputs> {
    try {
        const outs = await stack.outputs();
        return {
            replicaCount: outs.replicaCountOut?.value as number | undefined,
            configVersion: outs.configVersion?.value as string | undefined,
            approved: outs.approvedOut?.value as boolean | undefined,
        };
    } catch {
        return {};
    }
}
