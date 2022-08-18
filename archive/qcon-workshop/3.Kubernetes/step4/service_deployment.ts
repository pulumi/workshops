import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as k8stypes from "@pulumi/kubernetes/types/input";

export class ServiceDeployment extends pulumi.ComponentResource {
    public readonly service: k8s.core.v1.Service;
    public readonly deployment: k8s.apps.v1.Deployment;
    public readonly host: pulumi.Output<string>;

    constructor(name: string, args: ServiceDeploymentArgs, opts?: pulumi.ComponentResourceOptions) {
        super("qcon:index:ServiceDeployment", name, args, opts);
        const childOpts = { ...opts, parent: this };
        const namespaceName = args.namespace.metadata.apply(meta => meta.name);
        const labels = { app: name };
        const container: k8stypes.core.v1.Container = {
            name: name,
            image: args.image,
            resources: {
                requests: {
                    cpu: "100m",
                    memory: "100Mi",
                },
            },
            ports: args.ports.map(p => ({ containerPort: p })),
        }
        this.deployment = new k8s.apps.v1.Deployment(`${name}-deployment`, {
            metadata: {
                namespace: namespaceName,
            },
            spec: {
                selector: {
                    matchLabels: labels,
                },
                template: {
                    metadata: {
                        namespace: namespaceName,
                        labels: labels,
                    },
                    spec: {
                        containers: [container],
                    }
                }
            }
        }, childOpts);
        this.service = new k8s.core.v1.Service(`${name}-svc`, {
            metadata: {
                name: args.name,
                namespace: namespaceName,
                labels: labels,
            },
            spec: {
                type: args.type,
                ports: args.ports.map(p => ({ port: p, targetPort: p})),
                selector: labels,
            }
        }, childOpts);
        if (args.type === "ClusterIP") {
            this.host = this.service.spec.apply(spec => spec.clusterIP);
        } else {
            this.host = this.service.status.apply(status => status.loadBalancer.ingress[0].hostname);
        }
        this.registerOutputs({});
    }
}

export interface EnvironmentVariable {
    name: string;
    value: pulumi.Input<string>;
}

export interface ServiceDeploymentArgs {
    name: string;
    namespace: k8s.core.v1.Namespace;
    ports: number[];
    image: string;
    env?: k8stypes.core.v1.EnvVar[];
    type: "ClusterIP" | "LoadBalancer";
}
