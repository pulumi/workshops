import * as pulumi from "@pulumi/pulumi";
import * as confluent from "@pulumi/confluentcloud";


// Create a Confluent environment which is a container for the other Confluent resources
const env = new confluent.Environment("environment", {
    displayName: "pulumi-confluent-blog",
});

// Create a standard Kafka cluster with multi-zone availability and us-west-2
const cluster = new confluent.KafkaCluster("cluster", {
    displayName: "inventory",
    availability: "SINGLE_ZONE",
    cloud: "AWS",
    region: "us-west-2",
    environment: {
        id: env.id,
    },
    standard: {}
});

// Create the admin-level service account used to create Kafka topic and producer and consumer accounts. 
// This app manager account is similar to the "DBA" account in relational databases or the root account in Linux
const serviceAccount = new confluent.ServiceAccount("app-manager", {
    description: "Service account to manage 'inventory' Kafka cluster",
});

const roleBinding = new confluent.RoleBinding("app-manager-kafka-cluster-admin", {
    principal: pulumi.interpolate`User:${serviceAccount.id}`,
    roleName: "CloudClusterAdmin",
    crnPattern: cluster.rbacCrn,
});

const managerApiKey = new confluent.ApiKey("app-manager-kafka-api-key", {
    displayName: "app-manager-kafka-api-key",
    description: "Kafka API Key that is owned by 'app-manager' service account JOSH KODROFF",
    owner: {
        id: serviceAccount.id,
        kind: serviceAccount.kind,
        apiVersion: serviceAccount.apiVersion,
    },
    managedResource: {
        id: cluster.id,
        apiVersion: cluster.apiVersion,
        kind: cluster.kind,
        environment: {
            id: env.id,
        },
    }
}, {
    dependsOn: roleBinding
});


// Create Kafka topic using the cluster admin service account credentials created above
const topic = new confluent.KafkaTopic("orders", {
    kafkaCluster: {
        id: cluster.id,
    },
    topicName: "orders",
    restEndpoint: cluster.restEndpoint,
    credentials: {
        key: managerApiKey.id,
        secret: managerApiKey.secret,
    },
});


//  Create a consumer service account and give that account permissions to write to the topic
const producerAccount = new confluent.ServiceAccount("producer", {
    description: "Service account to produce to 'orders' topic of 'inventory' Kafka cluster",
});

const producerApiKey = new confluent.ApiKey("producer-api-key", {
    owner: {
        id: producerAccount.id,
        kind: producerAccount.kind,
        apiVersion: producerAccount.apiVersion,
    },
    managedResource: {
        id: cluster.id,
        apiVersion: cluster.apiVersion,
        kind: cluster.kind,
        environment: {
            id: env.id,
        },
    },
});

new confluent.KafkaAcl("app-producer-write", {
    kafkaCluster: {
        id: cluster.id,
    },
    resourceType: "TOPIC",
    resourceName: topic.topicName,
    patternType: "LITERAL",
    principal: pulumi.interpolate`User:${producerAccount.id}`,
    host: "*",
    operation: "WRITE",
    permission: "ALLOW",
    restEndpoint: cluster.restEndpoint,
    credentials: {
        key: managerApiKey.id,
        secret: managerApiKey.secret,
    }
});

// Create consumer account which will read messages from Kafka topic
const consumerAccount = new confluent.ServiceAccount("consumer", {
    description: "Service account to consume from 'orders' topic of 'inventory' Kafka cluster",
});

const consumerApiKey = new confluent.ApiKey("consumer-api-key", {
    owner: {
        id: consumerAccount.id,
        kind: consumerAccount.kind,
        apiVersion: consumerAccount.apiVersion,
    },
    managedResource: {
        id: cluster.id,
        apiVersion: cluster.apiVersion,
        kind: cluster.kind,
        environment: {
            id: env.id,
        },
    },
});

new confluent.KafkaAcl("consumer-read-topic-acl", {
    kafkaCluster: {
        id: cluster.id,
    },
    resourceType: "TOPIC",
    resourceName: topic.topicName,
    patternType: "LITERAL",
    principal: pulumi.interpolate`User:${consumerAccount.id}`,
    host: "*",
    operation: "READ",
    permission: "ALLOW",
    restEndpoint: cluster.restEndpoint,
    credentials: {
        key: managerApiKey.id,
        secret: managerApiKey.secret,
    }
});

new confluent.KafkaAcl("consumer-read-group-acl", {
    kafkaCluster: {
        id: cluster.id,
    },
    resourceType: "GROUP",
    resourceName: "confluent_cli_consumer_",
    patternType: "PREFIXED",
    principal: pulumi.interpolate`User:${consumerAccount.id}`,
    host: "*",
    operation: "READ",
    permission: "ALLOW",
    restEndpoint: cluster.restEndpoint,
    credentials: {
        key: managerApiKey.id,
        secret: managerApiKey.secret,
    }
});

// Export statements
export const ordersTopicName = topic.topicName;
export const environmentId = env.id;
export const clusterId = cluster.id;

export const producerApiKeyId = producerApiKey.id;
export const producerApiKeySecret = producerApiKey.secret;

export const consumerApiKeyId = consumerApiKey.id;
export const consumerApiKeySecret = consumerApiKey.secret;