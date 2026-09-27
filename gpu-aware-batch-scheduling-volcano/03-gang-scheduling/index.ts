import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

// A gang-scheduled Volcano Job whose minAvailable asks for more than its own
// queue's capability allows. The default Kubernetes scheduler would start
// whatever pods currently fit and leave the rest Pending; Volcano's gang
// scheduling holds the whole job Pending until all `minAvailable` pods can
// start together, so you never see a partially started job. This project
// creates its own small queue so it stays independent of 02-queues.
const CLUSTER_NAME = "gpu-batch-demo"; // must match 01-cluster/index.ts

const config = new pulumi.Config();
const renderDir = config.get("renderYamlToDirectory");

const k8sProvider = new k8s.Provider(
    "k8s",
    renderDir
        ? { renderYamlToDirectory: renderDir }
        : { context: `kind-${CLUSTER_NAME}` },
);

const queue = new k8s.apiextensions.CustomResource(
    "gang-demo-queue",
    {
        apiVersion: "scheduling.volcano.sh/v1beta1",
        kind: "Queue",
        metadata: { name: "gang-demo" },
        spec: { weight: 1, reclaimable: true, capability: { cpu: "2", memory: "4Gi" } },
    },
    { provider: k8sProvider },
);

// 4 replicas x 1 cpu each = 4, more than the queue's 2-cpu capability, so
// minAvailable=4 can never be satisfied and the job stays Pending as a whole.
const replicas = 4;
const minAvailable = replicas;

const job = new k8s.apiextensions.CustomResource(
    "gang-demo-job",
    {
        apiVersion: "batch.volcano.sh/v1alpha1",
        kind: "Job",
        metadata: { name: "gang-demo" },
        spec: {
            minAvailable,
            schedulerName: "volcano",
            queue: "gang-demo",
            tasks: [
                {
                    name: "worker",
                    replicas,
                    template: {
                        spec: {
                            containers: [
                                {
                                    name: "worker",
                                    image: "busybox:1.37",
                                    command: ["sleep", "3600"],
                                    resources: { requests: { cpu: "1" } },
                                },
                            ],
                            restartPolicy: "Never",
                        },
                    },
                },
            ],
        },
    },
    { provider: k8sProvider, dependsOn: [queue] },
);

export const queueName = queue.metadata.name;
export const jobName = job.metadata.name;
