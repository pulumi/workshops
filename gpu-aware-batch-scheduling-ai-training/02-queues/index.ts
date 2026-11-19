import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

const config = new pulumi.Config();
// Offline verification only: render manifests instead of talking to a cluster.
const renderDir = config.get("renderYamlToDirectory");

const infra = new pulumi.StackReference(`${pulumi.getOrganization()}/gpu-batch-cluster/${pulumi.getStack()}`);

const provider = renderDir
    ? new k8s.Provider("k8s", { renderYamlToDirectory: renderDir })
    : new k8s.Provider("k8s", { kubeconfig: infra.requireOutput("kubeconfig") });

const gpuResource = "example.com/gpu";
const teams = ["team-a", "team-b"];

// One Volcano Queue per simulated team. `capability` is the hard ceiling for the queue,
// `weight` its share when the cluster is contended, `reclaimable` lets others borrow idle share.
const queues = teams.map(team => new k8s.apiextensions.CustomResource(team, {
    apiVersion: "scheduling.volcano.sh/v1beta1",
    kind: "Queue",
    metadata: { name: team },
    spec: {
        weight: 1,
        reclaimable: true,
        capability: { [gpuResource]: 4 },
    },
}, { provider }));

export const queueNames = queues.map(q => q.metadata.name);
