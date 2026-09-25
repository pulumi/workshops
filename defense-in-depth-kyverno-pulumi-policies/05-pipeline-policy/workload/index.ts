import * as k8s from "@pulumi/kubernetes";

// Step 6's demo target: deliberately missing resources.limits, same
// violation as 04-admission-denied's unsafe-pod.yaml, but this time
// Pulumi-declared. Run `pulumi preview --policy-pack ../policy-pack` here:
// the policy pack blocks the preview before Pulumi ever proposes creating
// this Pod against the cluster.
const provider = new k8s.Provider("kind", {});

const pod = new k8s.core.v1.Pod(
    "unsafe-workload",
    {
        metadata: {
            name: "unsafe-workload",
        },
        spec: {
            containers: [
                {
                    name: "app",
                    image: "nginx:1.27",
                    // No `resources.limits`: exactly what the
                    // require-resource-limits policy pack rejects.
                },
            ],
        },
    },
    { provider },
);

export const podName = pod.metadata.name;
