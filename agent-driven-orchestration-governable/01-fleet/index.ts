import * as pulumi from "@pulumi/pulumi";
import { WorkerFleet } from "./workerFleet";

// Target program for the demo. Every value the orchestrator drives
// (replicaCount, rotateTrigger, approved) comes from stack config, and the
// orchestrator sets that config through Automation API's inline config path
// rather than by hand-editing Pulumi.<stack>.yaml — see 03-orchestrator.

const config = new pulumi.Config();
const replicaCount = config.getNumber("replicaCount") ?? 2;
const rotateTrigger = config.get("rotateTrigger") ?? "initial";
const approved = config.getBoolean("approved") ?? false;
const action = config.get("action") ?? "baseline";

const fleet = new WorkerFleet("agent-fleet", {
    replicaCount,
    rotateTrigger,
    approved,
    action,
});

export const replicaCountOut = fleet.replicaCount;
export const configVersion = fleet.configVersion;
export const approvedOut = fleet.approved;
export const workerIds = fleet.workerIds;
