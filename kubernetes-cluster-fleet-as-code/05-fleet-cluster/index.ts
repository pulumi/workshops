import { fleetClusterProgram } from "./program";

// Entry point for the Pulumi CLI: `pulumi preview`, `pulumi up` in this folder.
// The exports below become the stack outputs.
const outputs = fleetClusterProgram();

export const clusterName = outputs.then(o => o.clusterName);
export const group = outputs.then(o => o.group);
export const fleetMemberId = outputs.then(o => o.fleetMemberId);
export const namespace = outputs.then(o => o.namespace);
