import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

// Read the kubeconfig context and namespace from the cluster-and-operator
// stack rather than re-declaring them, so this project always targets
// whatever kind cluster 01-cluster actually created.
const config = new pulumi.Config();
const clusterStackRefName = config.get("clusterStackRef") || "<org>/kafka-cluster/dev";
const clusterStackRef = new pulumi.StackReference(clusterStackRefName);
const kubeconfigContext = clusterStackRef.getOutput("kubeconfigContext");
const namespace = clusterStackRef.getOutput("namespace");

// Same provider-construction pattern as every project in this workshop:
// renderYamlToDirectory lets tsc/preview run offline in a sandbox with no
// live cluster; context drives the real kind demo. Never both at once.
const renderYamlToDirectory = config.get("renderYamlToDirectory");
const provider = renderYamlToDirectory
    ? new k8s.Provider("k8s", { renderYamlToDirectory })
    : new k8s.Provider("k8s", { context: kubeconfigContext });

const clusterName = "demo-cluster";

// Kafka version and its matching metadataVersion are config values because
// 06-rolling-upgrade changes both, one at a time, via `pulumi config set`
// against this same stack. Defaults are this build's starting versions.
// https://strimzi.io/docs/operators/latest/deploying (read 2026-09-27)
const kafkaVersion = config.get("kafkaVersion") || "4.2.1";
const metadataVersion = config.get("metadataVersion") || "4.2-IV1";

// Broker replica count is a config value because 05-scale-brokers changes
// it live via `pulumi config set` against this same stack. Controller
// replica count is NOT a config value: Strimzi's own docs state that
// scaling controller nodes in node pools is currently not supported
// (KAFKA-16538), so this workshop never offers that as a live demo step.
// https://strimzi.io/docs/operators/latest/deploying, section 2.1.1 (read 2026-09-27)
const brokerReplicas = config.getNumber("brokerReplicas") || 3;
const controllerReplicas = 3;

// Separate broker and controller node pools rather than one dual-role
// pool -- see AGENTS.md "Deviations" for why. Storage type `jbod` with a
// single `persistent-claim` volume per node; `deleteClaim: true` matches
// this workshop's fully-disposable demo cluster (07-teardown expects no
// PVCs to survive a `pulumi destroy`, and this is checked explicitly there
// rather than assumed).
const controllerPool = new k8s.apiextensions.CustomResource("controller-pool", {
    apiVersion: "kafka.strimzi.io/v1",
    kind: "KafkaNodePool",
    metadata: {
        name: "controller",
        namespace,
        labels: { "strimzi.io/cluster": clusterName },
    },
    others: {
        spec: {
            replicas: controllerReplicas,
            roles: ["controller"],
            storage: {
                type: "jbod",
                volumes: [{
                    id: 0,
                    type: "persistent-claim",
                    size: "5Gi",
                    deleteClaim: true,
                }],
            },
        },
    },
}, { provider });

const brokerPool = new k8s.apiextensions.CustomResource("broker-pool", {
    apiVersion: "kafka.strimzi.io/v1",
    kind: "KafkaNodePool",
    metadata: {
        name: "broker",
        namespace,
        labels: { "strimzi.io/cluster": clusterName },
    },
    others: {
        spec: {
            replicas: brokerReplicas,
            roles: ["broker"],
            storage: {
                type: "jbod",
                volumes: [{
                    id: 0,
                    type: "persistent-claim",
                    size: "5Gi",
                    deleteClaim: true,
                }],
            },
        },
    },
}, { provider });

// The Kafka CR itself. Replication settings match Strimzi's own minimal
// KRaft example (replication factor 3, min.insync.replicas 2) so the
// cluster tolerates one broker being mid-restart during 06-rolling-upgrade
// without refusing writes. A single internal, unencrypted listener is
// enough for this workshop's in-cluster producer/consumer (04-clients);
// TLS and external access are out of scope for a 90-minute demo. No
// `strimzi.io/kraft` or `strimzi.io/node-pools` annotation is set: both
// were transitional feature-gate switches in older Strimzi releases and do
// not appear anywhere in the 1.2.0 docs or CRD bundle -- KRaft mode with
// node pools is simply how a `Kafka` resource works now. Do not carry
// either annotation forward from older documentation or training data.
// https://strimzi.io/docs/operators/latest/deploying (read 2026-09-27)
const kafka = new k8s.apiextensions.CustomResource("kafka", {
    apiVersion: "kafka.strimzi.io/v1",
    kind: "Kafka",
    metadata: {
        name: clusterName,
        namespace,
    },
    others: {
        spec: {
            kafka: {
                version: kafkaVersion,
                metadataVersion: metadataVersion,
                listeners: [{
                    name: "plain",
                    port: 9092,
                    type: "internal",
                    tls: false,
                }],
                config: {
                    "offsets.topic.replication.factor": 3,
                    "transaction.state.log.replication.factor": 3,
                    "transaction.state.log.min.isr": 2,
                    "default.replication.factor": 3,
                    "min.insync.replicas": 2,
                },
            },
            entityOperator: {
                topicOperator: {},
                userOperator: {},
            },
        },
    },
}, { provider, dependsOn: [controllerPool, brokerPool] });

export { kubeconfigContext, namespace, clusterName, brokerReplicas, kafkaVersion, metadataVersion };
export const bootstrapServer = pulumi.interpolate`${clusterName}-kafka-bootstrap.${namespace}.svc:9092`;
