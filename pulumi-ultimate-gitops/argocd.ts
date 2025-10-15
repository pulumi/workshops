import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
import {jsonStringify} from "@pulumi/pulumi";

export interface InitialRepository {
    url?: string;
    branch?: string;
    path?: string;
}

export interface ArgoCDArgs {
    initialObjects?: pulumi.asset.FileAsset
    namespace?: pulumi.Input<string>;
    version?: pulumi.Input<string> | "8.6.3"
    name?: pulumi.Input<string> | "argocd"
}

export class ArgoCD extends pulumi.ComponentResource {
    readonly namespace: pulumi.Input<string>;

    constructor(name: string,
                args: ArgoCDArgs,
                opts: pulumi.ComponentResourceOptions = {}) {
        super("pkg:index:ArgoCD", name, {}, opts);

        const argocd = new k8s.helm.v3.Release("argocd", {
            chart: "argo-cd",
            version: args.version,
            name: args.name,
            repositoryOpts: {
                repo: "https://argoproj.github.io/argo-helm",
            },
            createNamespace: true,
            namespace: args.namespace || "argocd",
            values: {
                configs: {
                    secret: {
                        argocdServerAdminPassword: "$2a$10$RjjTokiJSaTQt8jAMOUTK.O0VIZ3.0AEs3/JxtaFKGZir93yFPEOG",
                        argocdServerAdminPasswordMtime: "2023-11-13T09:23:16Z"
                    },
                    params: {
                        "server\.insecure": true,
                    }
                },
                server: {}
            }
        }, {
            parent: this,
            ignoreChanges: ["checksum", "version", "values"],
        });


        const argocdApps = new k8s.helm.v3.Release("argocd-apps", {
            chart: "argocd-apps",
            repositoryOpts: argocd.repositoryOpts,
            namespace: argocd.namespace,
            createNamespace: false,
            valueYamlFiles: [
                args.initialObjects || new pulumi.asset.FileAsset(""),
            ],
        }, {
            parent: this,
            dependsOn: argocd,
            ignoreChanges: ["checksum"],
        });

        const inCluster = new k8s.core.v1.Secret("in-cluster", {
            metadata: {
                name: "in-cluster",
                namespace: argocd.namespace,
                labels: {
                    "argocd.argoproj.io/secret-type": "cluster",
                }
            },
            type: "Opaque",
            stringData: {
                "name": "in-cluster",
                "server": "https://kubernetes.default.svc",
                "config": jsonStringify({
                    "tlsClientConfig": {
                        "insecure": false,
                    }
                })
            }
        }, {
            parent: this,
            dependsOn: argocd,
        });

        this.namespace = argocd.namespace;
        this.registerOutputs({
            namespace: this.namespace
        });
    }
}
