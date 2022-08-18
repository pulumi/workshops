import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

import { ServiceDeployment } from "./service_deployment"

const namespace = new k8s.core.v1.Namespace("qcon");

// Redis Primary
const redisPrimary = new ServiceDeployment("redis-primary", {
    name: "redis-master",
    namespace: namespace,
    ports: [6379],
    image: "k8s.gcr.io/redis:e2e",
    type: "ClusterIP",
});

const redisReplica = new ServiceDeployment("redis-replica", {
    name: "redis-slave",
    namespace: namespace,
    ports: [6379],
    image: "gcr.io/google_samples/gb-redisslave:v1",
    type: "ClusterIP",
});

const frontend = new ServiceDeployment("frontend", {
    name: "frontend",
    namespace: namespace,
    ports: [80],
    image: "gcr.io/google-samples/gb-frontend:v4",
    type: "LoadBalancer",
});

export const frontendHost = pulumi.concat("http://", frontend.host);
