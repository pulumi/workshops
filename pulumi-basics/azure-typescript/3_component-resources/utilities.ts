import * as pulumi from "@pulumi/pulumi";
import * as storage from "@pulumi/azure-native/storage";

export function getSASToken(storageAccountName: pulumi.Input<string>,
    storageContainerName: pulumi.Input<string>,
    blobName: pulumi.Input<string>,
    resourceGroupName: pulumi.Input<string>): pulumi.Output<string> {
const blobSAS = storage.listStorageAccountServiceSASOutput({
accountName: storageAccountName,
protocols: storage.HttpProtocol.Https,
sharedAccessStartTime: "2021-01-01",
sharedAccessExpiryTime: "2030-01-01",
resource: storage.SignedResource.C,
resourceGroupName: resourceGroupName,
permissions: storage.Permissions.R,
canonicalizedResource: pulumi.interpolate `/blob/${storageAccountName}/${storageContainerName}`,
contentType: "application/json",
cacheControl: "max-age=5",
contentDisposition: "inline",
contentEncoding: "deflate",
});
const token = blobSAS.apply(x => x.serviceSasToken);
return pulumi.interpolate `https://${storageAccountName}.blob.core.windows.net/${storageContainerName}/${blobName}?${token}`;
}