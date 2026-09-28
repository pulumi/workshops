import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

const config = new pulumi.Config();
const clusterStackRefName = config.get("clusterStackRef") || "<org>/storage-caching-cluster/dev";
const dragonflyStackRefName = config.get("dragonflyStackRef") || "<org>/storage-caching-dragonfly/dev";
const clusterStackRef = new pulumi.StackReference(clusterStackRefName);
const dragonflyStackRef = new pulumi.StackReference(dragonflyStackRefName);
const kubeconfigContext = clusterStackRef.getOutput("kubeconfigContext");
const workshopNamespaceName = clusterStackRef.getOutput("workshopNamespaceName");
const dragonflyServiceName = dragonflyStackRef.getOutput("serviceName");

const renderYamlToDirectory = config.get("renderYamlToDirectory");
const provider = renderYamlToDirectory
    ? new k8s.Provider("k8s", { renderYamlToDirectory })
    : new k8s.Provider("k8s", { context: kubeconfigContext });

// redis-cli, PING then a handful of SET/GET round-trips, confirmed
// Redis-protocol compatible against Dragonfly out of the box:
// https://www.dragonflydb.io/docs/getting-started/docker (read 2026-09-28).
// `redis:7-alpine` is used purely for its bundled redis-cli binary; it
// never runs as a server here.
const script = pulumi.interpolate`set -e
HOST=${dragonflyServiceName}
echo "PING:"
redis-cli -h "$HOST" ping
for i in 1 2 3 4 5; do
  redis-cli -h "$HOST" set "workshop:key:$i" "value-$i" >/dev/null
done
echo "Round-trip:"
for i in 1 2 3 4 5; do
  redis-cli -h "$HOST" get "workshop:key:$i"
done
`;

const cacheClientJob = new k8s.batch.v1.Job("cache-client", {
    metadata: {
        name: "cache-client",
        namespace: workshopNamespaceName,
    },
    spec: {
        backoffLimit: 2,
        template: {
            spec: {
                restartPolicy: "Never",
                containers: [
                    {
                        name: "redis-cli",
                        image: "redis:7-alpine",
                        command: ["sh", "-c", script],
                    },
                ],
            },
        },
    },
}, { provider });

export const jobName = cacheClientJob.metadata.name;
