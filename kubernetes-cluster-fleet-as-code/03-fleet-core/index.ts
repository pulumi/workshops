import * as azure from "@pulumi/azure-native";

// Step 3. The part of the fleet that does not belong to a single cluster: one
// resource group, a hubless Fleet (no hubProfile), and an update strategy with
// two stages. The cluster stacks (05-fleet-cluster) join this fleet; the
// update run (06-update-run) uses this strategy.
//
// Region and Azure credentials come from the ESC environment fleet/azure-base,
// which Pulumi.fleet.yaml attaches to this stack.

const tags = { fleet: "workshop" };

const group = new azure.resources.ResourceGroup("fleet", {
    resourceGroupName: "rg-fleet-workshop",
    tags,
});

// No hubProfile: a hubless fleet. It still supports update runs and costs nothing.
const fleet = new azure.containerservice.Fleet("fleet", {
    fleetName: "fleet-workshop",
    resourceGroupName: group.name,
    tags,
});

// Stage `canary` updates the members in group `canary`, then waits 60 seconds.
// Stage `rest` updates the members in group `rest`. The group names must match
// the `group` each FleetMember is created with (05-fleet-cluster).
const strategy = new azure.containerservice.FleetUpdateStrategy("two-waves", {
    updateStrategyName: "two-waves",
    fleetName: fleet.name,
    resourceGroupName: group.name,
    strategy: {
        stages: [
            { name: "canary", groups: [{ name: "canary" }], afterStageWaitInSeconds: 60 },
            { name: "rest", groups: [{ name: "rest" }] },
        ],
    },
});

export const resourceGroupName = group.name;
export const fleetName = fleet.name;
export const updateStrategyId = strategy.id;
