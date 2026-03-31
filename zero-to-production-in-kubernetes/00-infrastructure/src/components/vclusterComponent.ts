import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as dns from "dns";
import {FluxOperatorComponent} from "./fluxOperatorComponent";
import {FluxInstanceComponent} from "./fluxInstanceComponent";
import {FluxGitOpsComponent} from "./fluxGitOpsComponent";

/**
 * Poll DNS until the hostname resolves, with retries.
 * Skipped during `pulumi preview` (dry-run).
 */
async function waitForDns(hostname: string, retries = 30, intervalMs = 10_000): Promise<string> {
    if (pulumi.runtime.isDryRun()) return hostname;
    const resolve4 = dns.promises.resolve4;
    for (let i = 0; i < retries; i++) {
        try {
            await resolve4(hostname);
            return hostname;
        } catch {
            if (i === retries - 1) {
                throw new Error(`DNS resolution for ${hostname} failed after ${retries * intervalMs / 1000}s`);
            }
            await new Promise(r => setTimeout(r, intervalMs));
        }
    }
    return hostname;
}

/**
 * Arguments for configuring Flux GitOps inside a vCluster
 */
export interface VClusterFluxArgs {
    /**
     * The Git repository URL for Flux to watch
     */
    gitRepoUrl: pulumi.Input<string>;

    /**
     * The Git branch to track
     * @default "main"
     */
    gitRepoBranch?: string;

    /**
     * Path within the Git repo for this cluster's manifests
     */
    clusterPath: string;
}

/**
 * Arguments for creating a vCluster component
 */
export interface VClusterComponentArgs {
    /**
     * Name of the vCluster instance
     */
    vclusterName: string;

    /**
     * Node pool type for the vCluster workloads
     */
    pool: "standard" | "gpu";

    /**
     * vCluster Helm chart version
     * @default "0.33.1"
     */
    chartVersion?: string;

    /**
     * Helm chart repository URL
     * @default "https://charts.loft.sh"
     */
    chartRepository?: string;

    /**
     * Optional Flux GitOps configuration to bootstrap inside the vCluster
     */
    flux?: VClusterFluxArgs;
}

export class VClusterComponent extends pulumi.ComponentResource {
    /**
     * The Kubernetes namespace where the vCluster is deployed
     */
    public readonly namespaceName: pulumi.Output<string>;

    /**
     * The name of the Secret containing the vCluster kubeconfig
     */
    public readonly kubeconfigSecretName: pulumi.Output<string>;

    /**
     * The kubeconfig for connecting to the vCluster, with the LoadBalancer endpoint
     */
    public readonly kubeconfig: pulumi.Output<string>;

    constructor(name: string, args: VClusterComponentArgs, opts?: pulumi.ComponentResourceOptions) {
        super("custom:component:VCluster", name, args, opts);

        const nsName = `vc-${args.vclusterName}`;
        const secretName = `vc-${args.vclusterName}-kubeconfig`;
        const chartVersion = args.chartVersion ?? "0.33.1";
        const chartRepository = args.chartRepository ?? "https://charts.loft.sh";

        // Create dedicated namespace for the vCluster
        const ns = new k8s.core.v1.Namespace(`${name}-ns`, {
            metadata: {name: nsName},
        }, {parent: this});

        // Schedule the vCluster control plane on standard nodes
        const scheduling: Record<string, unknown> = {
            nodeSelector: {
                "workload-type": "vcluster-standard",
            },
        };

        // Build sync configuration based on pool type
        // GPU pools sync real nodes from host; standard pools use virtual nodes
        const sync: Record<string, unknown> = {};

        if (args.pool === "gpu") {
            // GPU vClusters: sync real GPU nodes from host so pods see GPU hardware
            sync.fromHost = {
                nodes: {
                    enabled: true,
                    selector: {
                        labels: {
                            "workload-type": "vcluster-gpu",
                        },
                    },
                },
            };
            sync.toHost = {
                pods: {
                    enforceTolerations: [
                        "nvidia.com/gpu:NoSchedule",
                    ],
                },
            };
        }
        // Standard vClusters: use virtual nodes (default vCluster behavior),
        // pods are synced to host and scheduled on the standard node pool.

        // Install vCluster via Helm with LoadBalancer service for external access
        const release = new k8s.helm.v3.Release(`${name}-release`, {
            name: args.vclusterName,
            namespace: nsName,
            chart: "vcluster",
            version: chartVersion,
            repositoryOpts: {repo: chartRepository},
            timeout: 600,
            values: {
                controlPlane: {
                    statefulSet: {scheduling},
                    service: {
                        spec: {
                            type: "LoadBalancer",
                        },
                        annotations: {
                            "service.beta.kubernetes.io/aws-load-balancer-scheme": "internet-facing",
                        },
                    },
                },
                sync,
                exportKubeConfig: {
                    secret: {
                        name: secretName,
                    },
                },
            },
        }, {parent: this, dependsOn: [ns]});

        // Use SSA to patch the pulumi.com/waitFor annotation onto the kubeconfig
        // secret created by vCluster. The provider blocks until .data.config is
        // populated, preventing race conditions where downstream resources try to
        // use the kubeconfig before the vCluster API server is ready.
        const kubeconfigSecret = new k8s.core.v1.Secret(`${name}-kubeconfig-ready`, {
            metadata: {
                name: secretName,
                namespace: nsName,
                annotations: {
                    "pulumi.com/waitFor": "jsonpath={.data.config}",
                },
            },
        }, {
            parent: this,
            dependsOn: [release],
            ignoreChanges: ["data", "stringData"],
        });

        // SSA-patch the vCluster Service with pulumi.com/waitFor so Pulumi
        // blocks until the LoadBalancer has an external address assigned.
        // Without this, the LB hostname may be empty when we try to build
        // the kubeconfig, causing connection failures.
        const lbService = new k8s.core.v1.Service(`${name}-svc-wait`, {
            metadata: {
                name: args.vclusterName,
                namespace: nsName,
                annotations: {
                    "pulumi.com/waitFor": "jsonpath={.status.loadBalancer.ingress[0].hostname}",
                },
            },
        }, {
            parent: this,
            dependsOn: [release],
            ignoreChanges: ["spec"],
        });

        const lbEndpoint = lbService.status.apply(s => {
            const ingress = s?.loadBalancer?.ingress?.[0];
            return ingress?.hostname ?? ingress?.ip ?? "";
        });

        // Build a corrected kubeconfig that uses the LB external address
        // instead of localhost:8443. Waits for DNS propagation before
        // returning so downstream providers don't hit "no such host".
        this.kubeconfig = pulumi.all([kubeconfigSecret.data, lbEndpoint]).apply(async ([data, endpoint]) => {
            if (!data?.config || !endpoint) return "";
            await waitForDns(endpoint);
            const kc = Buffer.from(data.config, "base64").toString();
            return kc.replace(/server:\s*https:\/\/[^\/\s]+/, `server: https://${endpoint}`);
        });

        // ---------------------------------------------------------------
        // Optional: deploy Flux Operator + Instance + GitOps inside the
        // vCluster, using the corrected kubeconfig.
        // ---------------------------------------------------------------
        if (args.flux) {
            const vcProvider = new k8s.Provider(`${name}-k8s`, {
                kubeconfig: this.kubeconfig,
                enableServerSideApply: true,
            }, {parent: this});

            const vcFluxOp = new FluxOperatorComponent(`${name}-flux-operator`, {
                webEnabled: true,
            }, {provider: vcProvider, parent: this, dependsOn: [kubeconfigSecret]});

            const vcFluxInst = new FluxInstanceComponent(`${name}-flux-instance`, {
            }, {provider: vcProvider, parent: this, dependsOn: [vcFluxOp]});

            new FluxGitOpsComponent(`${name}-gitops`, {
                repoUrl: args.flux.gitRepoUrl,
                repoBranch: args.flux.gitRepoBranch,
                clusterPath: args.flux.clusterPath,
            }, {provider: vcProvider, parent: this, dependsOn: [vcFluxInst]});
        }

        this.namespaceName = pulumi.output(nsName);
        this.kubeconfigSecretName = pulumi.output(secretName);

        this.registerOutputs({
            namespaceName: this.namespaceName,
            kubeconfigSecretName: this.kubeconfigSecretName,
            kubeconfig: this.kubeconfig,
        });
    }
}
