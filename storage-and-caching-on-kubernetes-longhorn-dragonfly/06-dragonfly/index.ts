import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

const config = new pulumi.Config();
const clusterStackRefName = config.get("clusterStackRef") || "<org>/storage-caching-cluster/dev";
const clusterStackRef = new pulumi.StackReference(clusterStackRefName);
const kubeconfigContext = clusterStackRef.getOutput("kubeconfigContext");
const workshopNamespaceName = clusterStackRef.getOutput("workshopNamespaceName");

const renderYamlToDirectory = config.get("renderYamlToDirectory");
const provider = renderYamlToDirectory
    ? new k8s.Provider("k8s", { renderYamlToDirectory })
    : new k8s.Provider("k8s", { context: kubeconfigContext });

// docker.dragonflydb.io/dragonflydb/dragonfly:v2.0.0 -- the latest stable
// release as of 2026-09-28 (github.com/dragonflydb/dragonfly releases,
// read 2026-09-28). Docker Hub's dragonflydb/dragonfly tags lag badly
// (stuck at v1.27.1 as of the same read), so this pulls from Dragonfly's
// own registry, the address every official doc example uses.
// https://www.dragonflydb.io/docs/getting-started/docker (read 2026-09-28)
const image = "docker.dragonflydb.io/dragonflydb/dragonfly:v2.0.0";

// Dragonfly's own docs do not publish a plain Deployment+Service manifest
// for Kubernetes -- the two officially documented Kubernetes paths are the
// Helm/OCI chart and the Dragonfly Operator, both heavier than this
// workshop needs for an 90-minute session with no persistence and no
// failover requirement on the cache side (only the storage side drills
// failover, in 05). A plain Deployment is standard Kubernetes practice
// derived from Dragonfly's own `docker run` examples (same image, same
// port, no volume mount), not a doc-published YAML -- flagged as an open
// question in the pull request.
// https://www.dragonflydb.io/docs/getting-started/kubernetes (read 2026-09-28)
const dragonflyLabels = { app: "dragonfly" };
const dragonfly = new k8s.apps.v1.Deployment("dragonfly", {
    metadata: {
        name: "dragonfly",
        namespace: workshopNamespaceName,
    },
    spec: {
        replicas: 1,
        selector: { matchLabels: dragonflyLabels },
        template: {
            metadata: { labels: dragonflyLabels },
            spec: {
                containers: [
                    {
                        name: "dragonfly",
                        image,
                        ports: [{ containerPort: 6379, name: "redis" }],
                        // `--ulimit memlock=-1` is the one flag every
                        // official Dragonfly example sets on `docker run`,
                        // so Dragonfly can lock memory pages. Kubernetes'
                        // PodSpec has no ulimits field; `IPC_LOCK` is the
                        // closest in-cluster equivalent capability, added
                        // here as a best-effort translation, not a
                        // doc-confirmed Kubernetes deployment step --
                        // flagged as an open question in the pull request.
                        securityContext: {
                            capabilities: { add: ["IPC_LOCK"] },
                        },
                        // No explicit --maxmemory flag: no official
                        // getting-started example passes one, and
                        // Dragonfly auto-sizes to available container
                        // memory by default. The container's own resource
                        // limit below is the documented lever instead.
                        resources: {
                            requests: { cpu: "100m", memory: "128Mi" },
                            limits: { cpu: "500m", memory: "256Mi" },
                        },
                        // No volumeMounts: cache-only, no persistence, by
                        // omission -- matching every official example,
                        // which passes no snapshot/dbfilename flags either.
                    },
                ],
            },
        },
    },
}, { provider });

const dragonflyService = new k8s.core.v1.Service("dragonfly", {
    metadata: {
        name: "dragonfly",
        namespace: workshopNamespaceName,
    },
    spec: {
        type: "ClusterIP",
        selector: dragonflyLabels,
        ports: [{ port: 6379, targetPort: 6379, name: "redis" }],
    },
}, { provider });

export const deploymentName = dragonfly.metadata.name;
export const serviceName = dragonflyService.metadata.name;
