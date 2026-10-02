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

// Pinned tag. The Dragonfly Helm docs name v1.40.0 as the latest version
// (https://www.dragonflydb.io/docs/getting-started/kubernetes); the tag was
// checked to exist on ghcr.io.
const image = "ghcr.io/dragonflydb/dragonfly:v1.40.0";
const labels = { app: "dragonfly" };

const dragonfly = new k8s.apps.v1.Deployment("dragonfly", {
    metadata: { name: "dragonfly", namespace, labels },
    spec: {
        replicas: 1,
        selector: { matchLabels: labels },
        template: {
            metadata: { labels },
            spec: {
                containers: [{
                    name: "dragonfly",
                    image,
                    // Small limits so it fits next to Longhorn on a laptop.
                    args: ["--proactor_threads=2", "--maxmemory=256mb"],
                    ports: [{ name: "redis", containerPort: 6379 }],
                    readinessProbe: { tcpSocket: { port: "redis" }, periodSeconds: 5 },
                    resources: {
                        requests: { cpu: "100m", memory: "300Mi" },
                        limits: { memory: "512Mi" },
                    },
                }],
            },
        },
    },
}, opts);

const service = new k8s.core.v1.Service("dragonfly", {
    metadata: { name: "dragonfly", namespace, labels },
    spec: {
        selector: labels,
        ports: [{ name: "redis", port: 6379, targetPort: "redis" }],
    },
}, { ...opts, dependsOn: [dragonfly] });

export const serviceName = service.metadata.name;
export const imageTag = image;
