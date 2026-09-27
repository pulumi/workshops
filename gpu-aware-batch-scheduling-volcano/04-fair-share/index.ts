import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

// Two vcjobs submitted at once, one per team queue created in 02-queues.
// team-a's job fits inside its queue's capability and runs immediately;
// team-b's job asks for more than its queue allows and stays queued, showing
// Volcano enforcing each queue's share rather than a first-come-first-served
// run. This project assumes 02-queues has already been deployed.
const CLUSTER_NAME = "gpu-batch-demo"; // must match 01-cluster/index.ts

const config = new pulumi.Config();
const renderDir = config.get("renderYamlToDirectory");

const k8sProvider = new k8s.Provider(
    "k8s",
    renderDir
        ? { renderYamlToDirectory: renderDir }
        : { context: `kind-${CLUSTER_NAME}` },
);

function job(name: string, queue: string, replicas: number, minAvailable: number) {
    return new k8s.apiextensions.CustomResource(
        name,
        {
            apiVersion: "batch.volcano.sh/v1alpha1",
            kind: "Job",
            metadata: { name },
            spec: {
                minAvailable,
                schedulerName: "volcano",
                queue,
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
        { provider: k8sProvider },
    );
}

// team-a queue capability (02-queues): cpu "2" -- 2 replicas x 1 cpu fits.
const underQuota = job("under-quota", "team-a", 2, 2);
// team-b queue capability (02-queues): cpu "1" -- 2 replicas x 1 cpu does not fit.
const overQuota = job("over-quota", "team-b", 2, 2);

export const underQuotaJob = underQuota.metadata.name;
export const overQuotaJob = overQuota.metadata.name;
