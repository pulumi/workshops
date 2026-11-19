import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { PublicEksCluster } from "./public-cluster";
import { MangoDbExport } from "./mangodb";

// KbindProvider: the provider side of kbind as one component.
//   1. an EKS cluster (PublicEksCluster)
//   2. the kbind backend: Helm release of the backend chart, embedded OIDC, LoadBalancer service
//   3. the exported API (MangoDbExport): CRD, APIServiceExportTemplate, Collection
// Steps 2 and 3 are switched on separately so the demo can show them one at a time.

export interface KbindProviderArgs {
    clusterName: string;
    /** Chart and image pins. Defaults are the workshop pins (0.8.1 / v0.8.1). */
    chartVersion?: string;
    imageRepository?: string;
    imageTag?: string;
    /** Local chart directory (from helm pull --untar). Empty uses the OCI chart. */
    chartPath?: string;
    /** Demo step 3: install the backend. */
    installBackend?: boolean;
    /** Demo step 4: apply the CRD, template and collection. Needs installBackend. */
    exportApi?: boolean;
    /** Phase two of the install: public address of the backend, e.g. http://<lb-hostname>. */
    externalAddress?: string;
    /** "nlb" annotates the service for a Network Load Balancer; "clb" leaves the default. */
    loadBalancerType?: string;
}

export class KbindProvider extends pulumi.ComponentResource {
    public readonly clusterName: pulumi.Output<string>;
    public readonly kubeconfig: pulumi.Output<string>;
    public readonly backendHost: pulumi.Output<string>;
    public readonly backendUrl: pulumi.Output<string>;

    constructor(name: string, args: KbindProviderArgs, opts?: pulumi.ComponentResourceOptions) {
        super("kbind-workshop:index:KbindProvider", name, {}, opts);

        const chartVersion = args.chartVersion ?? "0.8.1";
        const namespace = "kube-bind";
        const releaseName = "backend"; // also the Service name: the chart names it after the release

        const cluster = new PublicEksCluster(`${name}-cluster`, { clusterName: args.clusterName }, { parent: this });

        const provider = new k8s.Provider(`${name}-k8s`, {
            kubeconfig: cluster.kubeconfig,
        }, { parent: this });

        this.clusterName = cluster.clusterName;
        this.kubeconfig = cluster.kubeconfig;
        let backendHost: pulumi.Output<string> = pulumi.output("");

        if (args.installBackend ?? true) {
            const values: Record<string, any> = {
                backend: {
                    // The chart default (ghcr.io/kube-bind/backend, tag without "v") is not pullable.
                    image: {
                        repository: args.imageRepository ?? "ghcr.io/kbind-dev/backend",
                        tag: args.imageTag ?? `v${chartVersion}`,
                    },
                    oidc: { type: "embedded" },
                },
                service: { type: "LoadBalancer", port: 80 },
                examples: { enabled: false },
            };
            if (args.externalAddress) {
                // Phase two: the load balancer hostname is only known after phase one.
                values.backend.externalAddress = args.externalAddress;
                values.backend.oidc.callbackUrl = `${args.externalAddress}/api/callback`;
            }

            const release = new k8s.helm.v3.Release(`${name}-backend`, {
                name: releaseName,
                namespace,
                createNamespace: true,
                chart: args.chartPath || "oci://ghcr.io/kbind-dev/charts/backend",
                // A local chart directory carries its own version; the OCI chart needs the pin.
                version: args.chartPath ? undefined : chartVersion,
                timeout: 600,
                values,
            }, { parent: this, provider });

            let serviceDependsOn: pulumi.Resource[] = [release];
            if ((args.loadBalancerType ?? "nlb") === "nlb") {
                // The chart has no service annotations key, so the annotation goes on as a patch.
                const patch = new k8s.core.v1.ServicePatch(`${name}-backend-nlb`, {
                    metadata: {
                        name: releaseName,
                        namespace,
                        annotations: { "service.beta.kubernetes.io/aws-load-balancer-type": "nlb" },
                    },
                }, { parent: this, provider, dependsOn: [release] });
                serviceDependsOn = [patch];
            }

            const svc = k8s.core.v1.Service.get(`${name}-backend-svc`, `${namespace}/${releaseName}`, {
                parent: this,
                provider,
                dependsOn: serviceDependsOn,
            });
            backendHost = svc.status.apply(s => s?.loadBalancer?.ingress?.[0]?.hostname ?? "");

            if (args.exportApi ?? true) {
                new MangoDbExport(`${name}-mangodb`, { provider, dependsOn: [release] }, { parent: this });
            }
        }

        this.backendHost = backendHost;
        this.backendUrl = backendHost.apply(h => (h ? `http://${h}` : ""));

        this.registerOutputs({
            clusterName: this.clusterName,
            kubeconfig: this.kubeconfig,
            backendHost: this.backendHost,
            backendUrl: this.backendUrl,
        });
    }
}
