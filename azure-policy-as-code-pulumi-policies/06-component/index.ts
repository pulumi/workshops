import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";
import { AzureStorageBaseline } from "./azure-storage-baseline";

const config = new pulumi.Config();
const location = config.get("location") ?? "westeurope";
// Set `scopeMode` to "subscription" when your tenant gives you no management group rights.
const scopeMode = config.get("scopeMode") ?? "managementGroup";
const subscriptionId = new pulumi.Config("azure-native").require("subscriptionId");

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

// Step 6: steps 3 to 5 as one component. Aliases keep the resources in place,
// so `pulumi preview` shows no replacement.
const baseline = new AzureStorageBaseline("baseline", {
    ...(managementGroupId ? { managementGroupId } : { subscriptionId }),
    effect: config.get("effect") ?? "Audit",
    location,
});

export const resourceGroupName = rg.name;
export const assignmentId = baseline.assignmentId;
export const scope = baseline.scope;
