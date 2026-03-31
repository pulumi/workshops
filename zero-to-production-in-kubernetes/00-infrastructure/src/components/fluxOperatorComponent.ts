import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

/**
 * Arguments for creating a Flux Operator component
 */
export interface FluxOperatorComponentArgs {
    /**
     * Flux Operator Helm chart version
     * @default "0.45.1"
     */
    chartVersion?: string;

    /**
     * Namespace to deploy the Flux Operator
     * @default "flux-system"
     */
    namespace?: string;

    /**
     * Tolerations for the Flux Operator pods
     */
    tolerations?: object[];

    /**
     * Affinity rules for the Flux Operator pods
     */
    affinity?: object;

    /**
     * Whether to enable the Flux web UI
     * @default true
     */
    webEnabled?: boolean;

    /**
     * Name of the Secret containing web UI configuration
     * @default "flux-web-config"
     */
    webConfigSecretName?: string;
}

export class FluxOperatorComponent extends pulumi.ComponentResource {
    /**
     * The Kubernetes namespace where the Flux Operator is deployed
     */
    public readonly namespaceName: pulumi.Output<string>;

    constructor(name: string, args: FluxOperatorComponentArgs, opts?: pulumi.ComponentResourceOptions) {
        super("custom:component:FluxOperator", name, args, opts);

        const chartVersion = args.chartVersion ?? "0.45.1";
        const nsName = args.namespace ?? "flux-system";
        const webEnabled = args.webEnabled ?? true;
        const webConfigSecretName = args.webConfigSecretName ?? "flux-web-config";

        // Create the flux-system namespace
        const ns = new k8s.core.v1.Namespace(`${name}-ns`, {
            metadata: {name: nsName},
        }, {parent: this});

        // Build Helm values with optional scheduling constraints and web UI
        const values: Record<string, unknown> = {};

        if (args.tolerations) {
            values.tolerations = args.tolerations;
        }
        if (args.affinity) {
            values.affinity = args.affinity;
        }

        values.web = {
            enabled: webEnabled,
            ...(webEnabled && {configSecretName: webConfigSecretName}),
        };

        // Create the web config Secret so the UI can initialise.
        // Without this, the web server shows "Server configuration is not initialized".
        let webConfigDep: pulumi.Resource | undefined;
        if (webEnabled) {
            const webConfigSecret = new k8s.core.v1.Secret(`${name}-web-config`, {
                metadata: {
                    name: webConfigSecretName,
                    namespace: nsName,
                },
                stringData: {
                    "config.yaml": [
                        "apiVersion: web.fluxcd.controlplane.io/v1",
                        "kind: Config",
                        "spec:",
                        "  insecure: true",
                        "  authentication:",
                        "    type: Anonymous",
                        "    sessionDuration: 24h",
                        "    anonymous:",
                        "      username: workshop-user",
                        "      groups:",
                        "        - flux-web-admin",
                    ].join("\n"),
                },
            }, {parent: this, dependsOn: [ns]});
            // Bind the anonymous group to the flux-web-admin ClusterRole so
            // the impersonated user has cluster-wide access in the Web UI.
            new k8s.rbac.v1.ClusterRoleBinding(`${name}-web-admin-binding`, {
                metadata: {
                    name: "flux-web-workshop-admin",
                },
                subjects: [{
                    kind: "Group",
                    name: "flux-web-admin",
                    apiGroup: "rbac.authorization.k8s.io",
                }],
                roleRef: {
                    kind: "ClusterRole",
                    name: "flux-web-admin",
                    apiGroup: "rbac.authorization.k8s.io",
                },
            }, {parent: this, dependsOn: [ns]});

            webConfigDep = webConfigSecret;
        }

        // Install Flux Operator via Helm (OCI registry)
        const helmDeps: pulumi.Resource[] = [ns];
        if (webConfigDep) {
            helmDeps.push(webConfigDep);
        }

        new k8s.helm.v3.Release(`${name}-helm`, {
            name: "flux-operator",
            namespace: nsName,
            chart: "oci://ghcr.io/controlplaneio-fluxcd/charts/flux-operator",
            version: chartVersion,
            waitForJobs: true,
            timeout: 300,
            values,
        }, {parent: this, dependsOn: helmDeps});

        this.namespaceName = pulumi.output(nsName);

        this.registerOutputs({
            namespaceName: this.namespaceName,
        });
    }
}
