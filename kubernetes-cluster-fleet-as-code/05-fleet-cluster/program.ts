import * as pulumi from "@pulumi/pulumi";
import { FleetCluster } from "./fleetCluster";

// The program every cluster stack runs. index.ts runs it from the Pulumi CLI,
// rollout.ts runs it as an inline program through the Automation API.
//
// Config comes from the ESC environment attached to the stack:
//   azure-native:location          fleet/azure-base
//   fleet-cluster:vmSize           fleet/azure-base
//   fleet-cluster:group            fleet/<cluster>
//   fleet-cluster:kubernetesVersion fleet/<cluster>
// The fleet itself comes from the fleet-core stack.
export async function fleetClusterProgram(): Promise<{ [key: string]: pulumi.Output<string> }> {
    const config = new pulumi.Config();
    const group = config.require("group");
    const kubernetesVersion = config.require("kubernetesVersion");
    const vmSize = config.require("vmSize");

    const core = new pulumi.StackReference(`${pulumi.getOrganization()}/fleet-core/fleet`);

    const cluster = new FleetCluster(pulumi.getStack(), {
        resourceGroupName: core.requireOutput("resourceGroupName").apply(String),
        fleetName: core.requireOutput("fleetName").apply(String),
        group,
        kubernetesVersion,
        vmSize,
    });

    return {
        clusterName: cluster.clusterName,
        group: cluster.group,
        fleetMemberId: cluster.fleetMemberId,
        namespace: cluster.namespace,
    };
}
