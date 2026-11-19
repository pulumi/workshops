import * as pulumi from "@pulumi/pulumi";
import { PublicEksCluster } from "./public-cluster";

// KbindConsumer: the consumer side of kbind as one component.
// A consumer cluster is a plain EKS cluster of the same shape as the provider's.
// Nothing provider-specific is installed by Pulumi: kubectl bind (06-bind) adds
// the konnector and the CRD. The component carries the settings that tie the
// cluster to its provider and prints the commands for binding.

export interface KbindConsumerArgs {
    clusterName: string;
    /** Name of this consumer, from its ESC environment. */
    consumerName: pulumi.Input<string>;
    /** Provider backend URL, read from the provider stack's output through ESC. */
    providerUrl: pulumi.Input<string>;
}

export class KbindConsumer extends pulumi.ComponentResource {
    public readonly clusterName: pulumi.Output<string>;
    public readonly kubeconfig: pulumi.Output<string>;
    public readonly providerUrl: pulumi.Output<string>;
    public readonly bindCommands: pulumi.Output<string>;

    constructor(name: string, args: KbindConsumerArgs, opts?: pulumi.ComponentResourceOptions) {
        super("kbind-workshop:index:KbindConsumer", name, {}, opts);

        const cluster = new PublicEksCluster(`${name}-cluster`, { clusterName: args.clusterName }, { parent: this });

        this.clusterName = cluster.clusterName;
        this.kubeconfig = cluster.kubeconfig;
        this.providerUrl = pulumi.output(args.providerUrl);
        this.bindCommands = pulumi.interpolate`kubectl bind login ${args.providerUrl} && kubectl bind --konnector-image ghcr.io/kbind-dev/konnector:v0.8.1  # consumer ${args.consumerName}`;

        this.registerOutputs({
            clusterName: this.clusterName,
            kubeconfig: this.kubeconfig,
            providerUrl: this.providerUrl,
            bindCommands: this.bindCommands,
        });
    }
}
