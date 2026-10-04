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
// One of: none | default-scheduler | gang | fair-share. Switch with 03-jobs/scenario.sh.
const scenario = config.get("scenario") ?? "none";
const valid = ["none", "default-scheduler", "gang", "fair-share"];
if (!valid.includes(scenario)) {
    throw new Error(`scenario must be one of ${valid.join(", ")}, got "${scenario}"`);
}

const ns = new k8s.core.v1.Namespace("demo-ns", { metadata: { name: "demo" } }, { provider });
const namespace = ns.metadata.name;

// A pod that holds one fake GPU. Extended resources need requests equal to limits.
const trainer = (name: string, schedulerName?: string) => ({
    ...(schedulerName ? { schedulerName } : {}),
    restartPolicy: "Never",
    containers: [{
        name,
        image: "busybox:1.37",
        command: ["sleep", "3600"],
        resources: { requests: { [gpuResource]: "1" }, limits: { [gpuResource]: "1" } },
    }],
});

// A Volcano Job: `minAvailable` pods must be placeable together, or none start.
const vcjob = (name: string, queue: string, replicas: number) => new k8s.apiextensions.CustomResource(name, {
    apiVersion: "batch.volcano.sh/v1alpha1",
    kind: "Job",
    metadata: { name, namespace },
    spec: {
        schedulerName: "volcano",
        queue,
        minAvailable: replicas,
        tasks: [{ name: "worker", replicas, template: { spec: trainer("worker") } }],
    },
}, { provider });

if (scenario === "default-scheduler") {
    // Ten pods, one GPU each, default scheduler: it starts as many as fit and leaves the rest Pending.
    new k8s.batch.v1.Job("trainer-default", {
        metadata: { name: "trainer-default", namespace },
        spec: { parallelism: 10, completions: 10, template: { spec: trainer("worker") } },
    }, { provider });
}

if (scenario === "gang") {
    // The same ten pods as a gang: all ten start together or none do.
    vcjob("trainer-gang", "default", 10);
}

if (scenario === "fair-share") {
    // Team A asks for 4 GPUs (its cap), team B for 6 (over its cap of 4), though GPUs are free.
    vcjob("team-a-train", "team-a", 4);
    vcjob("team-b-train", "team-b", 6);
}

export const activeScenario = scenario;
export const demoNamespace = namespace;
