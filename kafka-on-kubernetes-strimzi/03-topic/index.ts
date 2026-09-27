import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

// Read cluster and Kafka-cluster-name outputs from the two upstream stacks
// rather than re-declaring them.
const config = new pulumi.Config();
const clusterStackRefName = config.get("clusterStackRef") || "<org>/kafka-cluster/dev";
const clusterStackRef = new pulumi.StackReference(clusterStackRefName);
const kubeconfigContext = clusterStackRef.getOutput("kubeconfigContext");
const namespace = clusterStackRef.getOutput("namespace");

const kafkaStackRefName = config.get("kafkaStackRef") || "<org>/kafka-kafka/dev";
const kafkaStackRef = new pulumi.StackReference(kafkaStackRefName);
const clusterName = kafkaStackRef.getOutput("clusterName");

const renderYamlToDirectory = config.get("renderYamlToDirectory");
const provider = renderYamlToDirectory
    ? new k8s.Provider("k8s", { renderYamlToDirectory })
    : new k8s.Provider("k8s", { context: kubeconfigContext });

// demo-events: 3 partitions, replication factor 3, matching the brief. The
// Topic Operator (deployed as part of the Kafka resource's entityOperator
// in 02-kafka) reconciles this KafkaTopic against the live cluster; Pulumi
// only ever manages the desired-state custom resource, never talks to the
// Kafka protocol directly.
// https://strimzi.io/docs/operators/latest/deploying (read 2026-09-27)
const topic = new k8s.apiextensions.CustomResource("demo-events-topic", {
    apiVersion: "kafka.strimzi.io/v1",
    kind: "KafkaTopic",
    metadata: {
        name: "demo-events",
        namespace,
        labels: { "strimzi.io/cluster": clusterName },
    },
    others: {
        spec: {
            partitions: 3,
            replicas: 3,
            config: {
                "retention.ms": 604800000,
                "min.insync.replicas": 2,
            },
        },
    },
}, { provider });

export { kubeconfigContext, namespace, clusterName };
export const topicName = pulumi.output("demo-events");
