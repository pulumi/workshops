import * as k8s from "@pulumi/kubernetes";

const namespace = new k8s.core.v1.Namespace("nginx");
export const namespaceName = namespace.metadata.apply(meta => meta.name);
const labels = { app: "nginx" };
const nginxDeployment = new k8s.apps.v1.Deployment("nginx-deploy", {
    metadata: {
        labels: labels,
        namespace: namespaceName,
    }, spec: {
        selector: {
            matchLabels: labels,
        },
        replicas: 2,
        template: {
            metadata: {
                labels: labels,
                namespace: namespaceName,
            },
            spec: {
                containers: [{
                    name: "nginx",
                    image: "nginx:latest",
                    ports: [{containerPort: 80}]
                }]
            }
        }
    }
});

const nginxService = new k8s.core.v1.Service("nginx-service", {
    metadata: {
        labels: labels,
        namespace: namespaceName,
    },
    spec: {
        selector: labels,
        ports: [{ targetPort: 80, port: 80 }],
        type: "LoadBalancer",
    }
});

export const host = nginxService.status.apply(status => status.loadBalancer.ingress[0].hostname);
