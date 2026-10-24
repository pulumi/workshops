import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

// The exported API: the mangodb example.
//
// The brief points at deploy/examples in the kbind repo, but the v0.8.1 tag has no
// mangodb file there (it has cowboys and sheriffs). mangodb exists at v0.8.1 only as
// the chart template templates/example.yaml, rendered when examples.enabled=true.
// This file carries the same CRD and APIServiceExportTemplate as Pulumi resources,
// copied from that template, and adds one Collection that groups the template.
// The chart is installed with examples.enabled=false so nothing is applied twice.

export interface MangoDbExportArgs {
    provider: k8s.Provider;
    /** Resources the kbind CRDs must exist before (the Helm release). */
    dependsOn: pulumi.Resource[];
}

export class MangoDbExport extends pulumi.ComponentResource {
    public readonly templateName: pulumi.Output<string>;
    public readonly collectionName: pulumi.Output<string>;

    constructor(name: string, args: MangoDbExportArgs, opts?: pulumi.ComponentResourceOptions) {
        super("kbind-workshop:index:MangoDbExport", name, {}, opts);

        const crd = new k8s.apiextensions.v1.CustomResourceDefinition(`${name}-crd`, {
            metadata: {
                name: "mangodbs.mangodb.com",
                labels: { "kube-bind.io/exported": "true" },
            },
            spec: {
                group: "mangodb.com",
                names: { kind: "MangoDB", listKind: "MangoDBList", plural: "mangodbs", singular: "mangodb" },
                scope: "Namespaced",
                versions: [{
                    name: "v1alpha1",
                    served: true,
                    storage: true,
                    schema: {
                        openAPIV3Schema: {
                            type: "object",
                            required: ["spec"],
                            properties: {
                                spec: {
                                    type: "object",
                                    properties: {
                                        tier: { type: "string", enum: ["Dedicated", "Shared"], default: "Shared" },
                                    },
                                },
                                status: {
                                    type: "object",
                                    properties: { phase: { type: "string" } },
                                },
                            },
                        },
                    },
                    subresources: { status: {} },
                }],
            },
        }, { parent: this, provider: args.provider });

        const template = new k8s.apiextensions.CustomResource(`${name}-template`, {
            apiVersion: "kube-bind.io/v1alpha2",
            kind: "APIServiceExportTemplate",
            metadata: { name: "mangodb" },
            spec: {
                scope: "Namespaced",
                resources: [{ group: "mangodb.com", versions: ["v1alpha1"], resource: "mangodbs" }],
                permissionClaims: [{
                    group: "",
                    resource: "secrets",
                    selector: {
                        labelSelector: { matchLabels: { app: "mangodb" } },
                        namedResources: [{ name: "mangodb-credentials", namespace: "mangodb-namespace" }],
                    },
                }],
                namespaces: [{ name: "mangodb-namespace" }],
            },
        }, { parent: this, provider: args.provider, dependsOn: [crd, ...args.dependsOn] });

        // Not part of the chart template: the Collection that groups the template.
        // v0.8.1 ships a Collection example for cowboys and sheriffs only. Whether the
        // backend accepts this one is unverified (see README, Open points).
        const collection = new k8s.apiextensions.CustomResource(`${name}-collection`, {
            apiVersion: "kube-bind.io/v1alpha2",
            kind: "Collection",
            metadata: { name: "mangodb" },
            spec: { templates: [{ name: "mangodb" }] },
        }, { parent: this, provider: args.provider, dependsOn: [template] });

        this.templateName = template.metadata.name;
        this.collectionName = collection.metadata.name;
        this.registerOutputs({ templateName: this.templateName, collectionName: this.collectionName });
    }
}
