import * as k8s from "@pulumi/kubernetes";

const namespace = new k8s.core.v1.Namespace("nginx");
const nginx = new k8s.core.v1.Pod("nginx", {
    metadata: {
        namespace: namespace.metadata.apply(meta => meta.name),
    },
    spec: {
        containers: [{
            name: "nginx",
            image: "nginx:latest",
            ports: [{ containerPort: 80 }],
        }]
    }
})

export const namespaceName = namespace.metadata.apply(meta => meta.name);
export const name = nginx.metadata.apply(meta => meta.name);
