import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

const config = new pulumi.Config();
const clusterStackRefName = config.get("clusterStackRef") || "<org>/storage-caching-cluster/dev";
const storageClassStackRefName = config.get("storageClassStackRef") || "<org>/storage-caching-storage-class/dev";
const clusterStackRef = new pulumi.StackReference(clusterStackRefName);
const storageClassStackRef = new pulumi.StackReference(storageClassStackRefName);
const kubeconfigContext = clusterStackRef.getOutput("kubeconfigContext");
const workshopNamespaceName = clusterStackRef.getOutput("workshopNamespaceName");
const storageClassName = storageClassStackRef.getOutput("storageClassName");

const renderYamlToDirectory = config.get("renderYamlToDirectory");
const provider = renderYamlToDirectory
    ? new k8s.Provider("k8s", { renderYamlToDirectory })
    : new k8s.Provider("k8s", { context: kubeconfigContext });

// 1Gi is deliberately small: the brief's risk section calls for a dataset
// sized for a fast rebuild during the live failover drill in
// 05-failover-drill, not a realistic production size.
const pvc = new k8s.core.v1.PersistentVolumeClaim("workshop-data", {
    metadata: {
        name: "workshop-data",
        namespace: workshopNamespaceName,
    },
    spec: {
        accessModes: ["ReadWriteOnce"],
        storageClassName: storageClassName,
        resources: {
            requests: { storage: "1Gi" },
        },
    },
}, { provider });

// A single-replica Deployment (not a bare Pod) so that when
// 05-failover-drill cordons and drains its node, the Deployment controller
// reschedules the pod onto one of the other two workers automatically --
// that reschedule, and the record surviving it, is the whole point of the
// drill. The container appends one timestamped line to the PVC every 5
// seconds; a busybox shell loop is enough, no application image needed.
const writer = new k8s.apps.v1.Deployment("record-writer", {
    metadata: {
        name: "record-writer",
        namespace: workshopNamespaceName,
    },
    spec: {
        replicas: 1,
        selector: { matchLabels: { app: "record-writer" } },
        template: {
            metadata: { labels: { app: "record-writer" } },
            spec: {
                containers: [
                    {
                        name: "writer",
                        image: "busybox:1.36",
                        command: ["sh", "-c",
                            "while true; do echo \"$(date -u +%Y-%m-%dT%H:%M:%SZ) on $(hostname)\" >> /data/records.log; sleep 5; done"],
                        volumeMounts: [{ name: "data", mountPath: "/data" }],
                        resources: {
                            requests: { cpu: "10m", memory: "16Mi" },
                            limits: { cpu: "50m", memory: "32Mi" },
                        },
                    },
                ],
                volumes: [
                    {
                        name: "data",
                        persistentVolumeClaim: { claimName: pvc.metadata.name },
                    },
                ],
            },
        },
    },
}, { provider });

export const pvcName = pvc.metadata.name;
export const deploymentName = writer.metadata.name;
