import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";

const config = new pulumi.Config();
const location = config.get("location") ?? "westeurope";

// The subscription that moves under the management group. It is the same id
// the azure-native provider uses (`pulumi config set azure-native:subscriptionId ...`).
const subscriptionId = new pulumi.Config("azure-native").require("subscriptionId");

// Step 2: a management group with the workshop subscription as its child.
const governance = new azure.management.ManagementGroup("ws-governance", {
    groupId: "ws-governance",
    displayName: "Workshop governance",
});

// For this resource type the Pulumi resource name is the subscription id.
new azure.management.ManagementGroupSubscription(subscriptionId, {
    groupId: governance.name,
});

const rg = new azure.resources.ResourceGroup("rg-policy-ws", {
    resourceGroupName: "rg-policy-ws",
    location,
});

export const managementGroupId = governance.id;
export const resourceGroupName = rg.name;
