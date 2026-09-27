import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

const config = new pulumi.Config();
const clusterStackRefName = config.get("clusterStackRef") || "<org>/kafka-cluster/dev";
const clusterStackRef = new pulumi.StackReference(clusterStackRefName);
const kubeconfigContext = clusterStackRef.getOutput("kubeconfigContext");
const namespace = clusterStackRef.getOutput("namespace");

const kafkaStackRefName = config.get("kafkaStackRef") || "<org>/kafka-kafka/dev";
const kafkaStackRef = new pulumi.StackReference(kafkaStackRefName);
const clusterName = kafkaStackRef.getOutput("clusterName");
const kafkaVersion = kafkaStackRef.getOutput("kafkaVersion");

const topicStackRefName = config.get("topicStackRef") || "<org>/kafka-topic/dev";
const topicStackRef = new pulumi.StackReference(topicStackRefName);
const topicName = topicStackRef.getOutput("topicName");

const renderYamlToDirectory = config.get("renderYamlToDirectory");
const provider = renderYamlToDirectory
    ? new k8s.Provider("k8s", { renderYamlToDirectory })
    : new k8s.Provider("k8s", { context: kubeconfigContext });

// The client image tag is `<strimzi-operator-version>-kafka-<kafka-version>`
// per Strimzi's own container-image table; it always matches this
// project's own operator version (1.2.0) and whatever Kafka version
// 02-kafka's stack currently reports, so 06-rolling-upgrade never needs to
// touch this file to pick up a new client image alongside the broker
// upgrade.
// https://strimzi.io/docs/operators/latest/deploying, section 6.3 (read 2026-09-27)
const strimziOperatorVersion = "1.2.0";
const clientImage = pulumi.interpolate`quay.io/strimzi/kafka:${strimziOperatorVersion}-kafka-${kafkaVersion}`;
const bootstrapServer = pulumi.interpolate`${clusterName}-kafka-bootstrap.${namespace}.svc:9092`;

// A long-running consumer Deployment (not a Job) so it keeps printing
// messages straight through 05-scale-brokers and 06-rolling-upgrade,
// which is exactly what makes those two steps demonstrable: the audience
// watches this pod's logs continue uninterrupted (bar Strimzi's own
// controlled broker restarts) while the underlying cluster changes shape.
const consumer = new k8s.apps.v1.Deployment("consumer", {
    metadata: { name: "demo-consumer", namespace },
    spec: {
        replicas: 1,
        selector: { matchLabels: { app: "demo-consumer" } },
        template: {
            metadata: { labels: { app: "demo-consumer" } },
            spec: {
                containers: [{
                    name: "consumer",
                    image: clientImage,
                    command: ["bin/kafka-console-consumer.sh"],
                    args: [
                        "--bootstrap-server", bootstrapServer,
                        "--topic", topicName,
                        "--group", "demo-consumer-group",
                        "--property", "print.timestamp=true",
                        "--property", "print.partition=true",
                    ],
                }],
            },
        },
    },
}, { provider });

export { kubeconfigContext, namespace, clusterName, bootstrapServer, topicName, clientImage };

// The producer is deliberately NOT a Pulumi-managed resource: it is a
// one-shot interactive or scripted action a presenter runs live
// (`kubectl exec` into a throwaway pod using this same clientImage, or
// `kubectl run` one), matching the brief's "produced and consumed messages
// through it" promise without turning message-sending into infrastructure
// state that `pulumi destroy` would need to reason about. See README.md
// "Running the demo" for the exact producer command.
