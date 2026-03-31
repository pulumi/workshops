import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

/**
 * Arguments for creating a Flux Instance component (FluxInstance CRD)
 */
export interface FluxInstanceComponentArgs {
    /**
     * Namespace where the FluxInstance CRD is created
     * @default "flux-system"
     */
    namespace?: string;

    /**
     * Flux distribution version
     * @default "2.x"
     */
    fluxVersion?: string;

    /**
     * Flux components to install
     * @default ["source-controller", "kustomize-controller", "helm-controller", "notification-controller"]
     */
    components?: string[];
}

export class FluxInstanceComponent extends pulumi.ComponentResource {
    constructor(name: string, args: FluxInstanceComponentArgs, opts?: pulumi.ComponentResourceOptions) {
        super("custom:component:FluxInstance", name, args, opts);

        const nsName = args.namespace ?? "flux-system";
        const fluxVersion = args.fluxVersion ?? "2.x";
        const components = args.components ?? [
            "source-controller",
            "kustomize-controller",
            "helm-controller",
            "notification-controller",
        ];

        // Create the FluxInstance CRD that tells the Flux Operator which
        // controllers to run and which distribution registry to pull from
        new k8s.apiextensions.CustomResource(`${name}-cr`, {
            apiVersion: "fluxcd.controlplane.io/v1",
            kind: "FluxInstance",
            metadata: {
                name: "flux",
                namespace: nsName,
            },
            spec: {
                distribution: {
                    version: fluxVersion,
                    registry: "ghcr.io/fluxcd",
                },
                components,
                cluster: {
                    type: "kubernetes",
                    multitenant: false,
                    domain: "cluster.local",
                },
            },
        }, {parent: this});

        this.registerOutputs({});
    }
}
