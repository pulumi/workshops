import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

const config = new pulumi.Config();
const org = pulumi.getOrganization();
const stack = pulumi.getStack();
const clusterStack = config.get("clusterStack") ?? `${org}/kafka-workshop-cluster/${stack}`;
const kafkaStack = config.get("kafkaStack") ?? `${org}/kafka-workshop-kafka/${stack}`;
const renderDir = config.get("renderYamlToDirectory");
// Same release as the operator; the image carries the Kafka CLI tools.
const clientImage = config.get("clientImage") ?? "quay.io/strimzi/kafka:1.2.0-kafka-4.2.1";

const infra = new pulumi.StackReference("cluster", { name: clusterStack });
const kafka = new pulumi.StackReference("kafka", { name: kafkaStack });
const namespace = infra.requireOutput("kafkaNamespace");
const kafkaName = kafka.requireOutput("kafkaName");
const bootstrap = kafka.requireOutput("bootstrapServers");

const provider = renderDir
    ? new k8s.Provider("k8s", { renderYamlToDirectory: renderDir })
    : new k8s.Provider("k8s", { kubeconfig: infra.requireOutput("kubeconfig") });

// The topic is a custom resource; the Topic Operator in the entity operator reconciles it.
const topic = new k8s.apiextensions.CustomResource("demo-events", {
    apiVersion: "kafka.strimzi.io/v1",
    kind: "KafkaTopic",
    metadata: {
        name: "demo-events",
        namespace,
        labels: { "strimzi.io/cluster": kafkaName },
        annotations: { "pulumi.com/waitFor": "condition=Ready" },
    },
    spec: { partitions: 3, replicas: 3 },
}, { provider });

// A long-lived client pod: the produce/consume scripts exec into it.
const client = new k8s.core.v1.Pod("kafka-client", {
    metadata: { name: "kafka-client", namespace },
    spec: {
        containers: [{
            name: "client",
            image: clientImage,
            command: ["sleep", "infinity"],
            resources: { requests: { memory: "256Mi", cpu: "100m" } },
        }],
    },
}, { provider });

export const topicName = "demo-events";
export const clientPod = client.metadata.name;
export const bootstrapServers = bootstrap;
export const topicUrn = topic.urn;
