import * as storage from "@pulumi/azure-native/storage";
import { ComponentResource, ComponentResourceOptions, Input, Output } from "@pulumi/pulumi";
import * as pulumi from "@pulumi/pulumi";

export interface StorageInfraArgs {
    resourceGroupName: Input<string>;
};

export class StorageInfra extends ComponentResource {
    public readonly storageAccountName: Output<string>;
    public readonly storageContainerName: Output<string>;
    public readonly storageKey: Output<string>;

    // Must have a constructor that defines the parameters and namespace - "custom:x:Storage" in this case.
    constructor(name: string, args: StorageInfraArgs, opts?: ComponentResourceOptions) {
        super("custom:x:StorageInfra", name, args, opts);

        // Declare the children resources (i.e. storageAccount) be sure to include a resource option of "parent:this".

        // Storage Account name must be lowercase and cannot have any dash characters
        const storageAccount = new storage.StorageAccount(`${name.toLowerCase()}sa`, {
            resourceGroupName: args.resourceGroupName,
            kind: storage.Kind.StorageV2,
            sku: {
                name: storage.SkuName.Standard_LRS,
            },
        }, {parent: this});

        const storageContainer = new storage.BlobContainer(`${name}-container`, {
            resourceGroupName: args.resourceGroupName,
            accountName: storageAccount.name,
            publicAccess: storage.PublicAccess.None,
        }, {parent: this});

        const storageAccountKeys = pulumi.all([args.resourceGroupName, storageAccount.name]).apply(([resourceGroupName, accountName]) =>
            storage.listStorageAccountKeys({ resourceGroupName, accountName }));
        
        // Specify returned properties
        this.storageAccountName = storageAccount.name;
        this.storageContainerName = storageContainer.name;
        this.storageKey = pulumi.secret(storageAccountKeys.keys[0].value);

        // End with this. It is used for display purposes.
        this.registerOutputs();
    };
};
