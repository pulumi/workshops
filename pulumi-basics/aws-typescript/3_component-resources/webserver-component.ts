import * as aws from "@pulumi/aws";
import { ComponentResource, ComponentResourceOptions, Input, Output } from "@pulumi/pulumi";

export interface WebserverArgs {
    parameter1: Input<string>;
};

export class Webserver extends ComponentResource {
    public readonly output1: Output<string>;
    public readonly output2: Output<string>;
    public readonly output3: Output<string>;

    // Must have a constructor that defines the parameters and namespace - "custom:x:Webserver" in this case.
    constructor(name: string, args: WebserverArgs, opts?: ComponentResourceOptions) {
        super("custom:x:Webserver", name, args, opts);

        /////
        // Declare the children resources (i.e. security group, instance) be sure to include a resource option of "parent:this".
        /////

        // End with this. It is used for display purposes.
        this.registerOutputs();
    };
};
