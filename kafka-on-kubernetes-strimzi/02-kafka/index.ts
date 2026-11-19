import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

const config = new pulumi.Config();
// Demo knobs: step 5 changes brokerReplicas, step 6 changes kafkaVersion.
const brokerReplicas = config.getNumber("brokerReplicas") ?? 3;
const controllerReplicas = config.getNumber("controllerReplicas") ?? 3;
// Both versions are listed as supported in Strimzi 1.2.0's kafka-versions.yaml (read 2026-10-04).
const kafkaVersion = config.get("kafkaVersion") ?? "4.2.1";
// Held at the starting metadata version so the upgrade stays a pure binary roll.
const metadataVersion = config.get("metadataVersion") ?? "4.2-IV1";
const clusterStack = config.get("clusterStack") ??
    `${pulumi.getOrganization()}/kafka-workshop-cluster/${pulumi.getStack()}`;
const renderDir = config.get("renderYamlToDirectory");

const infra = new pulumi.StackReference("cluster", { name: clusterStack });
const namespace = infra.requireOutput("kafkaNamespace");

const provider = renderDir
    ? new k8s.Provider("k8s", { renderYamlToDirectory: renderDir })
    : new k8s.Provider("k8s", { kubeconfig: infra.requireOutput("kubeconfig") });

const clusterName = "workshop";
const labels = { "strimzi.io/cluster": clusterName };
const api = "kafka.strimzi.io/v1";
const storageClass = "standard"; // kind's bundled local-path provisioner

// KRaft only: separate controller and broker pools, no ZooKeeper.
// Strimzi v1 resources need no strimzi.io/node-pools or strimzi.io/kraft annotations.
const controllers = new k8s.apiextensions.CustomResource("controllers", {
    apiVersion: api,
    kind: "KafkaNodePool",
    metadata: { name: "controller", namespace, labels },
    spec: {
        replicas: controllerReplicas,
        roles: ["controller"],
        storage: { type: "jbod", volumes: [{
            id: 0, type: "persistent-claim", size: "2Gi",
            class: storageClass, deleteClaim: true, kraftMetadata: "shared",
        }] },
        resources: { requests: { memory: "512Mi", cpu: "200m" }, limits: { memory: "768Mi" } },
    },
}, { provider });

const brokers = new k8s.apiextensions.CustomResource("brokers", {
    apiVersion: api,
    kind: "KafkaNodePool",
    metadata: { name: "broker", namespace, labels },
    spec: {
        replicas: brokerReplicas,
        roles: ["broker"],
        storage: { type: "jbod", volumes: [{
            id: 0, type: "persistent-claim", size: "5Gi",
            class: storageClass, deleteClaim: true, kraftMetadata: "shared",
        }] },
        resources: { requests: { memory: "1Gi", cpu: "250m" }, limits: { memory: "1536Mi" } },
    },
}, { provider });

const kafka = new k8s.apiextensions.CustomResource("kafka", {
    apiVersion: api,
    kind: "Kafka",
    metadata: {
        name: clusterName,
        namespace,
        // The provider waits until the operator reports the cluster Ready.
        annotations: { "pulumi.com/waitFor": "condition=Ready" },
    },
    spec: {
        kafka: {
            version: kafkaVersion,
            metadataVersion,
            listeners: [{ name: "plain", port: 9092, type: "internal", tls: false }],
            config: {
                "offsets.topic.replication.factor": 3,
                "transaction.state.log.replication.factor": 3,
                "transaction.state.log.min.isr": 2,
                "default.replication.factor": 3,
                "min.insync.replicas": 2,
            },
        },
        // Cruise Control powers the KafkaRebalance in 05-day2/scale.sh.
        cruiseControl: {},
        entityOperator: { topicOperator: {}, userOperator: {} },
    },
}, { provider, dependsOn: [controllers, brokers] });

export const kafkaName = clusterName;
export const bootstrapServers = pulumi.interpolate`${clusterName}-kafka-bootstrap.${namespace}.svc:9092`;
export const version = kafkaVersion;
export const brokerCount = brokerReplicas;
export const kafkaUrn = kafka.urn;
