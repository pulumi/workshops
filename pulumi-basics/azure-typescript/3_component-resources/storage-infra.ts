import * as storage from "@pulumi/azure-native/storage";
import { ComponentResource, ComponentResourceOptions, Input, Output } from "@pulumi/pulumi";
import * as pulumi from "@pulumi/pulumi";

export interface StorageInfraArgs {
    parameter1: Input<string>;
};

export class StorageInfra extends ComponentResource {
    public readonly output1: Output<string>;
    public readonly output2: Output<string>;
    public readonly output3: Output<string>;

    // Must have a constructor that defines the parameters and namespace - "custom:x:Storage" in this case.
    constructor(name: string, args: StorageInfraArgs, opts?: ComponentResourceOptions) {
        super("custom:x:StorageInfra", name, args, opts);

        /////
        // Declare the children resources (i.e. storageAccount) be sure to include a resource option of "parent:this".
        /////

        // End with this. It is used for display purposes.
        this.registerOutputs();
    };
};
