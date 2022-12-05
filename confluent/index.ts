import * as pulumi from "@pulumi/pulumi";
import * as confluent from "@pulumi/confluentcloud";

const env = new confluent.Environment("environment", {
  displayName: "pulumi-confluent-workshop",
});

const cloud = "AWS";
const region = "us-east-2";

const schemaRegistryRegion = confluent.getSchemaRegistryRegionOutput({
  cloud,
  region,
  package: "ESSENTIALS",
});

new confluent.SchemaRegistryCluster("essentials", {
  package: schemaRegistryRegion.package,
  environment: {
    id: env.id,
  },
  region: {
    id: schemaRegistryRegion.id,
  }
});

const cluster = new confluent.KafkaCluster("cluster", {
  displayName: "inventory",
  availability: "SINGLE_ZONE",
  cloud,
  region,
  environment: {
    id: env.id,
  },
  standard: {}
});

const serviceAccount = new confluent.ServiceAccount("app-manager", {
  description: "Service account to manage 'inventory' Kafka cluster",
}, {
  deleteBeforeReplace: true,
});

const roleBinding = new confluent.RoleBinding("app-manager-kafka-cluster-admin", {
  principal: pulumi.interpolate`User:${serviceAccount.id}`,
  roleName: "CloudClusterAdmin",
  crnPattern: cluster.rbacCrn,
});

const managerApiKey = new confluent.ApiKey("app-manager-kafka-api-key", {
  displayName: "app-manager-kafka-api-key",
  description: "Kafka API Key that is owned by 'app-manager' service account",
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

// Swap the ACL above for this RBAC resource to demonstrate a moving part:

// new confluent.RoleBinding("producer-write-rolebinding", {
//   principal: pulumi.interpolate`User:${producerAccount.id}`,
//   roleName: "DeveloperWrite",
//   crnPattern: pulumi.interpolate`${cluster.rbacCrn}/kafka=${cluster.id}/topic=${topic.topicName}`
// });

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

// Swap the ACLs above for these to demonstrate a moving part in Pulumi:

// new confluent.RoleBinding("consumer-read-topic-rolebinding", {
//   principal: pulumi.interpolate`User:${consumerAccount.id}`,
//   roleName: "DeveloperRead",
//   crnPattern: pulumi.interpolate`${cluster.rbacCrn}/kafka=${cluster.id}/topic=${topic.topicName}`
// });

// new confluent.RoleBinding("consumer-read-group-rolebinding", {
//   principal: pulumi.interpolate`User:${consumerAccount.id}`,
//   roleName: "DeveloperRead",
//   // The existing value of crn_pattern's suffix (group=confluent_cli_consumer_*)
//   // are set up to match Confluent CLI's default consumer group ID
//   // ("confluent_cli_consumer_<uuid>").
//   // https://docs.confluent.io/confluent-cli/current/command-reference/kafka/topic/confluent_kafka_topic_consume.html
//   // Update it to match your target consumer group ID.
//   crnPattern: pulumi.interpolate`${cluster.rbacCrn}/kafka=${cluster.id}/group=confluent_cli_consumer_*`
// });

export const ordersTopicName = topic.topicName;
export const environmentId = env.id;
export const clusterId = cluster.id;

export const producerApiKeyId = producerApiKey.id;
export const producerApiKeySecret = producerApiKey.secret;

export const consumerApiKeyId = consumerApiKey.id;
export const consumerApiKeySecret = consumerApiKey.secret;
