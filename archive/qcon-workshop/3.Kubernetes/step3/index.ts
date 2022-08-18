import * as k8s from "@pulumi/kubernetes";

const namespace = new k8s.core.v1.Namespace("qcon");
const namespaceName = namespace.metadata.apply(meta => meta.namespace);

// Redis Primary
const redisMasterLabels = { app: "redis", tier: "backend", role: "master" };
const redisMasterDeployment = new k8s.apps.v1.Deployment("redis-master-deploy", {
    metadata: {
        namespace: namespaceName,
        labels: redisMasterLabels,
    },
    spec: {
        selector: {
            matchLabels: redisMasterLabels,
        },
        template: {
            metadata: {
                labels: redisMasterLabels,
            },
            spec: {
                containers: [{
                    name: "master",
                    image: "k8s.gcr.io/redis:e2e",
                    resources: { requests: { cpu: "100m", memory: "100Mi" } },
                    ports: [{ containerPort: 6379 }],
                }],
            },
        },
    },
});

const redisMasterService = new k8s.core.v1.Service("redis-master-service", {
    metadata: {
        name: "redis-master",
        namespace: namespaceName,
        labels: redisMasterLabels,
    },
    spec: {
        type: "ClusterIP",
        ports: [{ port: 6379, targetPort: 6379 }],
        selector: redisMasterLabels,
    }
});

export const redisMasterHost = redisMasterService.spec.apply(spec => spec.clusterIP);

// Redis Replica
const redisReplicaLabels = { app: "redis", tier: "backend", role: "slave" };
const redisReplicaDeployment = new k8s.apps.v1.Deployment("redis-replica-deployment", {
    metadata: {
        namespace: namespaceName,
    },
    spec: {
        selector: {
            matchLabels: redisReplicaLabels,
        },
        template: {
            metadata: {
                labels: redisReplicaLabels,
            },
            spec: {
                containers: [{
                    name: "replica",
                    image: "gcr.io/google_samples/gb-redisslave:v1",
                    resources: { requests: { cpu: "100m", memory: "100Mi" } },
                    ports: [{ containerPort: 6379 }] 
                }]
            }
        }
    }
});
const redisReplicaService = new k8s.core.v1.Service("redis-replica-service", {
    metadata: {
        name: "redis-slave",
        namespace: namespaceName,
        labels: redisReplicaLabels,
    },
    spec: {
        type: "ClusterIP",
        ports: [{ port: 6379, targetPort: 6379 }],
        selector: redisReplicaLabels,
    }
});
export const redisReplicaHost = redisReplicaService.spec.apply(spec => spec.clusterIP);

// Frontend
const frontendLabels = { app: "guestbook", tier: "frontend" };
const frontendDeployment = new k8s.apps.v1.Deployment("frontend-deployment", {
    metadata: {
        namespace: namespaceName,
    },
    spec: {
        selector: {
            matchLabels: frontendLabels,
        },
        replicas: 2,
        template: {
            metadata: {
                namespace: namespaceName,
                labels: frontendLabels,
            },
            spec: {
                containers: [{
                    name: "php-redis",
                    image: "gcr.io/google-samples/gb-frontend:v4",
                    resources: {
                        requests: {
                            cpu: "100m",
                            memory: "100Mi"
                        }
                    },
                    ports: [{ containerPort: 80 }],
                }]
            }
        }
    }
});

const frontendService = new k8s.core.v1.Service("frontend-service", {
    metadata: {
        namespace: namespaceName,
        labels: frontendLabels,
    },
    spec: {
        type: "LoadBalancer",
        ports: [{ port: 80 }],
        selector: frontendLabels,
    }, 
});

export const frontendHost = frontendService.status.apply(status => status.loadBalancer.ingress[0].hostname);
