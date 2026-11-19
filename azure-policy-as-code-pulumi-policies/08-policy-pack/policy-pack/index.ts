import * as azure from "@pulumi/azure-native";
import { PolicyPack, validateResourceOfType } from "@pulumi/policy";
import { checkNoPublicBlob } from "./rule";

new PolicyPack("azure-storage-policy-pack", {
    policies: [{
        name: "storage-no-public-blob",
        description: "Blocks storage accounts that allow public blob access before Pulumi calls Azure.",
        enforcementLevel: "mandatory",
        validateResource: validateResourceOfType(azure.storage.StorageAccount, checkNoPublicBlob),
    }],
});
