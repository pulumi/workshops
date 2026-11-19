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

// Step 3: a custom definition at management group scope. It mirrors the
// built-in "Storage accounts should prevent public blob access" definition
// (4fa4b6c0-31ca-4c0d-b10d-24b96f62a751) and takes its effect as a parameter.
const denyPublicBlob = new azure.authorization.PolicyDefinitionAtManagementGroup("deny-public-blob-access", {
    managementGroupId: governance.name,
    policyDefinitionName: "deny-public-blob-access",
    displayName: "Storage accounts must not allow public blob access",
    policyType: "Custom",
    mode: "Indexed",
    metadata: { category: "Storage" },
    parameters: {
        effect: {
            type: "String",
            metadata: { displayName: "Effect" },
            allowedValues: ["Audit", "Deny", "Disabled"],
            defaultValue: "Audit",
        },
    },
    policyRule: {
        if: {
            allOf: [
                { field: "type", equals: "Microsoft.Storage/storageAccounts" },
                { not: { field: "Microsoft.Storage/storageAccounts/allowBlobPublicAccess", equals: "false" } },
            ],
        },
        then: { effect: "[parameters('effect')]" },
    },
});
export const denyPublicBlobId = denyPublicBlob.id;
