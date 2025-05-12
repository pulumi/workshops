import * as pulumi from "@pulumi/pulumi";
export declare class Module extends pulumi.ComponentResource {
    /**
     * Returns true if the given object is an instance of Module.  This is designed to work even
     * when multiple copies of the Pulumi SDK have been loaded into the same process.
     */
    static isInstance(obj: any): obj is Module;
    /**
     * my pet animal
     */
    readonly pet: pulumi.Output<string | undefined>;
    readonly random_priority: pulumi.Output<string | undefined>;
    readonly random_seed: pulumi.Output<string | undefined>;
    /**
     * Create a Module resource with the given unique name, arguments, and options.
     *
     * @param name The _unique_ name of the resource.
     * @param args The arguments to use to populate this resource's properties.
     * @param opts A bag of options that control this resource's behavior.
     */
    constructor(name: string, args?: ModuleArgs, opts?: pulumi.ComponentResourceOptions);
}
/**
 * The set of arguments for constructing a Module resource.
 */
export interface ModuleArgs {
    /**
     * keeper key
     */
    keeper_key?: pulumi.Input<string>;
    maxlen?: pulumi.Input<number>;
    randseed?: pulumi.Input<string>;
}
