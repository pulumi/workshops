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

// Step 4: a second custom definition. Modify adds the tag governed-by=pulumi
// when it is absent. Modify needs a role the assignment's identity can use.
const tagContributorRoleId = "/providers/Microsoft.Authorization/roleDefinitions/4a9ae827-6dc8-4573-8ac7-8239d42aa03f";

const tagGovernedBy = new azure.authorization.PolicyDefinitionAtManagementGroup("tag-governed-by-pulumi", {
    managementGroupId: governance.name,
    policyDefinitionName: "tag-governed-by-pulumi",
    displayName: "Storage accounts get the governed-by tag",
    policyType: "Custom",
    mode: "Indexed",
    metadata: { category: "Tags" },
    policyRule: {
        if: {
            allOf: [
                { field: "type", equals: "Microsoft.Storage/storageAccounts" },
                { field: "tags['governed-by']", exists: "false" },
            ],
        },
        then: {
            effect: "modify",
            details: {
                roleDefinitionIds: [tagContributorRoleId],
                operations: [{ operation: "add", field: "tags['governed-by']", value: "pulumi" }],
            },
        },
    },
});

// The initiative groups both definitions and surfaces one `effect` parameter.
const baseline = new azure.authorization.PolicySetDefinitionAtManagementGroup("ws-storage-baseline", {
    managementGroupId: governance.name,
    policySetDefinitionName: "ws-storage-baseline",
    displayName: "Workshop storage baseline",
    policyType: "Custom",
    metadata: { category: "Storage" },
    parameters: {
        effect: {
            type: "String",
            allowedValues: ["Audit", "Deny", "Disabled"],
            defaultValue: "Audit",
        },
    },
    policyDefinitions: [
        {
            policyDefinitionId: denyPublicBlob.id,
            policyDefinitionReferenceId: "deny-public-blob",
            parameters: { effect: { value: "[parameters('effect')]" } },
        },
        {
            policyDefinitionId: tagGovernedBy.id,
            policyDefinitionReferenceId: "tag-governed-by",
        },
    ],
});

// Step 5: assign the initiative at management group scope. The managed
// identity is what Modify uses to write tags, so it gets Tag Contributor.
const effect = config.get("effect") ?? "Audit";

const assignment = new azure.authorization.PolicyAssignment("ws-storage-baseline-assignment", {
    scope: governance.id,
    policyAssignmentName: "ws-storage-baseline",
    displayName: "Workshop storage baseline",
    policyDefinitionId: baseline.id,
    parameters: { effect: { value: effect } },
    identity: { type: "SystemAssigned" },
    location,
});

new azure.authorization.RoleAssignment("ws-assignment-tag-contributor", {
    scope: governance.id,
    principalId: assignment.identity.apply(i => i!.principalId),
    principalType: "ServicePrincipal",
    roleDefinitionId: tagContributorRoleId,
});

export const assignmentId = assignment.id;
