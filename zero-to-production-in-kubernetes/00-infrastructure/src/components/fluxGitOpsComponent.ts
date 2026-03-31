import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

/**
 * Arguments for creating a Flux GitOps component (GitRepository + Kustomization)
 */
export interface FluxGitOpsComponentArgs {
    /**
     * Namespace where the Flux resources are created
     * @default "flux-system"
     */
    namespace?: string;

    /**
     * The Git repository URL for Flux to watch
     */
    repoUrl: pulumi.Input<string>;

    /**
     * The Git branch to track
     * @default "main"
     */
    repoBranch?: string;

    /**
     * Path within the Git repo for this cluster's Kustomization manifests
     */
    clusterPath: string;

    /**
     * Sync interval for the GitRepository source
     * @default "1m"
     */
    interval?: string;
}

export class FluxGitOpsComponent extends pulumi.ComponentResource {
    constructor(name: string, args: FluxGitOpsComponentArgs, opts?: pulumi.ComponentResourceOptions) {
        super("custom:component:FluxGitOps", name, args, opts);

        const nsName = args.namespace ?? "flux-system";
        const repoBranch = args.repoBranch ?? "main";
        const interval = args.interval ?? "1m";

        // Create a GitRepository source pointing at the monorepo
        const gitRepo = new k8s.apiextensions.CustomResource(`${name}-git-repo`, {
            apiVersion: "source.toolkit.fluxcd.io/v1",
            kind: "GitRepository",
            metadata: {
                name: "flux-system",
                namespace: nsName,
            },
            spec: {
                interval,
                ref: {
                    branch: repoBranch,
                },
                url: args.repoUrl,
            },
        }, {parent: this});

        // Create a Kustomization that reconciles manifests from the cluster path
        new k8s.apiextensions.CustomResource(`${name}-kustomization`, {
            apiVersion: "kustomize.toolkit.fluxcd.io/v1",
            kind: "Kustomization",
            metadata: {
                name: "flux-system",
                namespace: nsName,
            },
            spec: {
                interval: "10m",
                retryInterval: "2m",
                timeout: "5m",
                sourceRef: {
                    kind: "GitRepository",
                    name: "flux-system",
                },
                path: `./${args.clusterPath}`,
                prune: true,
                wait: true,
            },
        }, {parent: this, dependsOn: [gitRepo]});

        this.registerOutputs({});
    }
}
