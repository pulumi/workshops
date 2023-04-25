// This file is included to demonstrate what the Guestbook app looks like if
// defined completely in Pulumi resources:

import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

// Create only services of type `ClusterIP`
// for clusters that don't support `LoadBalancer` services
const config = new pulumi.Config();
const useLoadBalancer = config.getBoolean("useLoadBalancer");

//
// REDIS LEADER.
//

const redisLeaderLabels = { app: "redis-leader" };
const redisLeaderDeployment = new k8s.apps.v1.Deployment("redis-leader", {
  spec: {
    selector: { matchLabels: redisLeaderLabels },
    template: {
      metadata: { labels: redisLeaderLabels },
      spec: {
        containers: [
          {
            name: "redis-leader",
            image: "redis",
            resources: { requests: { cpu: "100m", memory: "100Mi" } },
            ports: [{ containerPort: 6379 }],
          },
        ],
      },
    },
  },
});
const redisLeaderService = new k8s.core.v1.Service("redis-leader", {
  metadata: {
    name: "redis-leader",
    labels: redisLeaderDeployment.metadata.labels,
  },
  spec: {
    ports: [{ port: 6379, targetPort: 6379 }],
    selector: redisLeaderDeployment.spec.template.metadata.labels,
  },
});

//
// REDIS REPLICA.
//

const redisReplicaLabels = { app: "redis-replica" };
const redisReplicaDeployment = new k8s.apps.v1.Deployment("redis-replica", {
  spec: {
    selector: { matchLabels: redisReplicaLabels },
    template: {
      metadata: { labels: redisReplicaLabels },
      spec: {
        containers: [
          {
            name: "replica",
            image: "pulumi/guestbook-redis-replica",
            resources: { requests: { cpu: "100m", memory: "100Mi" } },
            // If your cluster config does not include a dns service, then to instead access an environment
            // variable to find the leader's host, change `value: "dns"` to read `value: "env"`.
            env: [{ name: "GET_HOSTS_FROM", value: "dns" }],
            ports: [{ containerPort: 6379 }],
          },
        ],
      },
    },
  },
});
const redisReplicaService = new k8s.core.v1.Service("redis-replica", {
  metadata: {
    name: "redis-replica",
    labels: redisReplicaDeployment.metadata.labels
  },
  spec: {
    ports: [{ port: 6379, targetPort: 6379 }],
    selector: redisReplicaDeployment.spec.template.metadata.labels,
  },
});

//
// FRONTEND
//

const frontendLabels = { app: "frontend" };
const frontendDeployment = new k8s.apps.v1.Deployment("frontend", {
  spec: {
    selector: { matchLabels: frontendLabels },
    replicas: 3,
    template: {
      metadata: { labels: frontendLabels },
      spec: {
        containers: [
          {
            name: "frontend",
            image: "pulumi/guestbook-php-redis",
            resources: { requests: { cpu: "100m", memory: "100Mi" } },
            // If your cluster config does not include a dns service, then to instead access an environment
            // variable to find the leader's host, change `value: "dns"` to read `value: "env"`.
            env: [{ name: "GET_HOSTS_FROM", value: "dns" /* value: "env"*/ }],
            ports: [{ containerPort: 80 }],
          },
        ],
      },
    },
  },
});
const frontendService = new k8s.core.v1.Service("frontend", {
  metadata: {
    labels: frontendDeployment.metadata.labels,
    name: "frontend",
  },
  spec: {
    type: useLoadBalancer ? "LoadBalancer" : "ClusterIP",
    ports: [{ port: 80 }],
    selector: frontendDeployment.spec.template.metadata.labels,
  },
});

// Export the frontend IP.
export let frontendIp: pulumi.Output<string>;
if (useLoadBalancer) {
  frontendIp = frontendService.status.loadBalancer.ingress[0].ip;
} else {
  frontendIp = frontendService.spec.clusterIP;
}