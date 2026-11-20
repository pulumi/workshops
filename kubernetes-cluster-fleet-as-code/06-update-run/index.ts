import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";

// Step 7. The upgrade as a resource: an UpdateRun that applies the two-waves
// strategy from fleet-core and moves every member to the target version.
// Creating the resource does not start the run; start.sh does (see README.md).
const config = new pulumi.Config();
const kubernetesVersion = config.require("kubernetesVersion");

const core = new pulumi.StackReference(`${pulumi.getOrganization()}/fleet-core/fleet`);

const run = new azure.containerservice.UpdateRun("upgrade", {
    updateRunName: `upgrade-${kubernetesVersion.replace(/\./g, "-")}`,
    fleetName: core.requireOutput("fleetName").apply(String),
    resourceGroupName: core.requireOutput("resourceGroupName").apply(String),
    updateStrategyId: core.requireOutput("updateStrategyId").apply(String),
    managedClusterUpdate: {
        upgrade: {
            type: azure.containerservice.ManagedClusterUpgradeType.Full,
            kubernetesVersion,
        },
    },
});

export const updateRunName = run.name;
export const fleetName = core.requireOutput("fleetName");
export const resourceGroupName = core.requireOutput("resourceGroupName");
