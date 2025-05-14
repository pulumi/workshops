import * as pulumi from "@pulumi/pulumi";
export declare class TalosCluster extends pulumi.ComponentResource {
    /**
     * Returns true if the given object is an instance of TalosCluster.  This is designed to work even
     * when multiple copies of the Pulumi SDK have been loaded into the same process.
     */
    static isInstance(obj: any): obj is TalosCluster;
    readonly clusterName: pulumi.Output<string>;
    readonly countControlPlane: pulumi.Output<number>;
    readonly countWorker: pulumi.Output<number>;
    readonly kubeconfig: pulumi.Output<string>;
    readonly region: pulumi.Output<string>;
    readonly size: pulumi.Output<string>;
    readonly version: pulumi.Output<string>;
    /**
     * Create a TalosCluster resource with the given unique name, arguments, and options.
     *
     * @param name The _unique_ name of the resource.
     * @param args The arguments to use to populate this resource's properties.
     * @param opts A bag of options that control this resource's behavior.
     */
    constructor(name: string, args: TalosClusterArgs, opts?: pulumi.ComponentResourceOptions);
}
/**
 * The set of arguments for constructing a TalosCluster resource.
 */
export interface TalosClusterArgs {
    clusterName: pulumi.Input<string>;
    countControlPlane: number;
    countWorker: number;
    region: pulumi.Input<string>;
    size: pulumi.Input<string>;
    version: pulumi.Input<string>;
}
