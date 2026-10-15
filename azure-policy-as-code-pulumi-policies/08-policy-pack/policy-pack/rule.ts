import * as azure from "@pulumi/azure-native";
import { ReportViolation, ResourceValidationArgs } from "@pulumi/policy";
/**
 * Rejects a storage account that does not turn public blob access off.
 * Exported so the unit tests can call it directly.
 */
export function checkNoPublicBlob(
    account: azure.storage.StorageAccountArgs,
    _args: ResourceValidationArgs,
    reportViolation: ReportViolation,
): void {
    if (account.allowBlobPublicAccess !== false) {
        reportViolation(
            "Storage accounts must set allowBlobPublicAccess to false. " +
            "The workshop Azure Policy initiative flags the same setting at runtime.",
        );
    }
}

