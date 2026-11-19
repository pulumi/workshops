import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

// One Provider per project. Online it talks to the kind cluster through its
// kubeconfig context. Offline (preview without a cluster) set
// `renderYamlToDirectory` and it writes manifests instead. The provider rejects
// both settings together, so exactly one of them is ever passed.
const config = new pulumi.Config();
const renderDir = config.get("renderYamlToDirectory");
const provider = new k8s.Provider(
    "k8s",
    renderDir
        ? { renderYamlToDirectory: renderDir }
        : { context: config.get("kubeContext") ?? "kind-storage-workshop" },
);
const opts: pulumi.CustomResourceOptions = { provider };

const namespace = config.get("namespace") ?? "demo";
const storageClassName = config.get("storageClassName") ?? "longhorn-workshop";

const labels = { app: "record-keeper" };

const pvc = new k8s.core.v1.PersistentVolumeClaim("record-data", {
    metadata: { name: "record-data", namespace },
    spec: {
        accessModes: ["ReadWriteOnce"],
        storageClassName,
        resources: { requests: { storage: "1Gi" } },
    },
}, opts);

const app = new k8s.apps.v1.Deployment("record-keeper", {
    metadata: { name: "record-keeper", namespace, labels },
    spec: {
        replicas: 1,
        // A ReadWriteOnce volume attaches to one node at a time, so the old pod
        // must be gone before the new one starts.
        strategy: { type: "Recreate" },
        selector: { matchLabels: labels },
        template: {
            metadata: { labels },
            spec: {
                containers: [{
                    name: "app",
                    image: "busybox:1.37.0",
                    // The app only holds the volume open. scripts/write-record.sh
                    // and scripts/read-record.sh do the writing and reading.
                    command: ["sh", "-c", "mkdir -p /data && while true; do sleep 3600; done"],
                    volumeMounts: [{ name: "data", mountPath: "/data" }],
                    resources: { requests: { cpu: "10m", memory: "16Mi" } },
                }],
                volumes: [{
                    name: "data",
                    persistentVolumeClaim: { claimName: pvc.metadata.name },
                }],
            },
        },
    },
}, opts);

export const claimName = pvc.metadata.name;
export const deploymentName = app.metadata.name;
