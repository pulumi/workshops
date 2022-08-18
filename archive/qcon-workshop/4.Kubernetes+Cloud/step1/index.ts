import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as k8s from "@pulumi/kubernetes";

import { ServiceDeployment } from "./service_deployment"

const namespace = new k8s.core.v1.Namespace("qcon");

/*
// Redis Primary
const redisPrimary = new ServiceDeployment("redis-primary", {
    namespace: namespace,
    ports: [6379],
    image: "k8s.gcr.io/redis:e2e",
    type: "ClusterIP",
});

const redisReplica = new ServiceDeployment("redis-replica", {
    namespace: namespace,
    ports: [6379],
    image: "gcr.io/google_samples/gb-redisslave:v1",
    env: [
        {
            name: "GET_HOSTS_FROM",
            value: "env",
        },
        {
            name: "REDIS_MASTER_SERVICE_HOST",
            value: redisPrimary.host,
        },
    ],
    type: "ClusterIP",
});
*/

const redisCluster = new aws.elasticache.Cluster("redis", {
    applyImmediately: true,
    engine: "redis",
    nodeType: "cache.t2.micro",
    numCacheNodes: 1,
});
const primary = redisCluster.cacheNodes.apply(nodes => nodes[0].address);

const frontend = new ServiceDeployment("frontend", {
    namespace: namespace,
    ports: [80],
    image: "gcr.io/google-samples/gb-frontend:v4",
    env: [
        {
            name: "GET_HOSTS_FROM",
            value: "env",
        },
        {
            name: "REDIS_MASTER_SERVICE_HOST",
            value: primary,
        },
        {
            name: "REDIS_SLAVE_SERVICE_HOST",
            value: primary,
        }
    ],
    type: "LoadBalancer",
});

export const frontendHost = pulumi.concat("http://", frontend.host);
