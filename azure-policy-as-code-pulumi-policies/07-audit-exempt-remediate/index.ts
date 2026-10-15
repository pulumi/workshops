import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";
import { AzureStorageBaseline } from "./azure-storage-baseline";

const config = new pulumi.Config();
const location = config.get("location") ?? "westeurope";
const scopeMode = config.get("scopeMode") ?? "managementGroup";
const subscriptionId = new pulumi.Config("azure-native").require("subscriptionId");
// Step 7 flips these two: `effect` to Deny, `deploySecondAccount` to true.
const effect = config.get("effect") ?? "Audit";
const deploySecondAccount = config.getBoolean("deploySecondAccount") ?? false;
const exemptionExpiresOn = config.get("exemptionExpiresOn") ?? "2026-12-31T00:00:00Z";

const rg = new azure.resources.ResourceGroup("rg-policy-ws", {
    resourceGroupName: "rg-policy-ws",
    location,
});

let managementGroupId: pulumi.Output<string> | undefined;
if (scopeMode === "managementGroup") {
    const governance = new azure.management.ManagementGroup("ws-governance", {
        groupId: "ws-governance",
        displayName: "Workshop governance",
    });
    new azure.management.ManagementGroupSubscription(subscriptionId, { groupId: governance.name });
    managementGroupId = governance.name;
}

// The violation: public blob access is on, so the baseline flags it.
const legacy = new azure.storage.StorageAccount("legacy", {
    resourceGroupName: rg.name,
    location,
    kind: "StorageV2",
    sku: { name: "Standard_LRS" },
    allowBlobPublicAccess: true,
});

const baseline = new AzureStorageBaseline("baseline", {
    ...(managementGroupId ? { managementGroupId } : { subscriptionId }),
    effect,
    location,
    // The waiver covers only the legacy account and expires on its own.
    exemptScopes: [legacy.id],
    exemptionExpiresOn,
});

// Remediation applies the Modify definition (governed-by tag) to existing accounts.
const remediationName = "tag-governed-by";
const referenceId = "tag-governed-by";
if (managementGroupId) {
    new azure.policyinsights.RemediationAtManagementGroup("remediate-tags", {
        remediationName,
        managementGroupId,
        managementGroupsNamespace: "Microsoft.Management",
        policyAssignmentId: baseline.assignmentId,
        policyDefinitionReferenceId: referenceId,
    });
} else {
    new azure.policyinsights.RemediationAtSubscription("remediate-tags", {
        remediationName,
        policyAssignmentId: baseline.assignmentId,
        policyDefinitionReferenceId: referenceId,
    });
}

// With effect=Deny this account is rejected by Azure at deployment time.
if (deploySecondAccount) {
    new azure.storage.StorageAccount("second", {
        resourceGroupName: rg.name,
        location,
        kind: "StorageV2",
        sku: { name: "Standard_LRS" },
        allowBlobPublicAccess: true,
    });
}

export const resourceGroupName = rg.name;
export const legacyAccountName = legacy.name;
export const assignmentId = baseline.assignmentId;
