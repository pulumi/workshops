import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

// Two Volcano Queues standing in for two teams sharing the cluster: "team-a"
// is larger and higher-weight, "team-b" is smaller and lower-weight.
// 04-fair-share submits one job into each to show the quota difference.
const CLUSTER_NAME = "gpu-batch-demo"; // must match 01-cluster/index.ts

const config = new pulumi.Config();
const renderDir = config.get("renderYamlToDirectory");

const k8sProvider = new k8s.Provider(
    "k8s",
    renderDir
        ? { renderYamlToDirectory: renderDir }
        : { context: `kind-${CLUSTER_NAME}` },
);

function queue(name: string, cpu: string, memory: string, weight: number) {
    return new k8s.apiextensions.CustomResource(
        name,
        {
            apiVersion: "scheduling.volcano.sh/v1beta1",
            kind: "Queue",
            metadata: { name },
            spec: {
                weight,
                reclaimable: true,
                capability: { cpu, memory },
            },
        },
        { provider: k8sProvider },
    );
}

const teamA = queue("team-a", "2", "4Gi", 2);
const teamB = queue("team-b", "1", "2Gi", 1);

export const teamAQueue = teamA.metadata.name;
export const teamBQueue = teamB.metadata.name;
