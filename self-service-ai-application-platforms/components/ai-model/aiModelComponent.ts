import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

export class AIModelComponent extends pulumi.ComponentResource {
    public readonly modelInternalServiceDNS: pulumi.Output<string>;

    constructor(name: string, args: AIModelComponentArgs, opts?: pulumi.ComponentResourceOptions) {
        super("component-ai-model:index:AIModelComponent", name, args, opts);

        const config = modelConfigs[args.size as TShirtSize] || modelConfigs.small;

        const leaderWorkerSet = new k8s.apiextensions.CustomResource(`${name}-vllm-lws`, {
            apiVersion: "leaderworkerset.x-k8s.io/v1",
            kind: "LeaderWorkerSet",
            metadata: {
                name: `${name}-vllm`,
                namespace: args.namespaceName || "lws-system",
            },
            spec: {
                replicas: config.replicas,
                leaderWorkerTemplate: {
                    size: 1 + config.size,
                    restartPolicy: "RecreateGroupOnPodRestart",
                    leaderTemplate: {
                        metadata: {
                            labels: {
                                role: "leader",
                            },
                        },
                        spec: {
                            tolerations: [{
                                key: "nvidia.com/gpu",
                                operator: "Exists",
                                effect: "NoSchedule",
                            }],
                            containers: [{
                                name: "vllm-leader",
                                image: "vllm/vllm-openai:latest",
                                env: [{
                                    name: "VLLM_ATTENTION_BACKEND",
                                    value: "TRITON_ATTN_VLLM_V1",
                                },
                                    {
                                        name: "HUGGING_FACE_HUB_TOKEN",
                                        valueFrom: {
                                            secretKeyRef: {
                                                name: "huggingface-token",
                                                key: "token",
                                            }
                                        }
                                    },
                                    {
                                        name: "PYTORCH_CUDA_ALLOC_CONF",
                                        value: "expandable_segments:True",
                                    }],
                                command: [
                                    "sh",
                                    "-c",
                                    "bash /vllm-workspace/examples/online_serving/multi-node-serving.sh leader --ray_cluster_size=$(LWS_GROUP_SIZE); " +
                                    "python3 -m vllm.entrypoints.openai.api_server --port 8080 --model " + args.modelName + " --tensor-parallel-size " + config.gpuPerNode + " --gpu_memory_utilization 0.90" + (args.notParallel ? " --pipeline-parallel-size 1" : " --pipeline-parallel-size " + config.size),
                                ],
                                resources: {
                                    limits: {
                                        "nvidia.com/gpu": `${config.gpuPerNode}`
                                    },
                                    requests: {
                                        "nvidia.com/gpu": `${config.gpuPerNode}`
                                    }
                                },
                                ports: [{
                                    containerPort: 8080,
                                }],
                                readinessProbe: {
                                    tcpSocket: {
                                        port: 8080,
                                    },
                                    initialDelaySeconds: 15,
                                    periodSeconds: 10,
                                },
                                volumeMounts: [{
                                    mountPath: "/dev/shm",
                                    name: "dshm",
                                }],
                            }],
                            volumes: [{
                                name: "dshm",
                                emptyDir: {
                                    medium: "Memory",
                                    sizeLimit: "15Gi",
                                },
                            }],
                        },
                    },
                    workerTemplate: {
                        spec: {
                            tolerations: [{
                                key: "nvidia.com/gpu",
                                operator: "Exists",
                                effect: "NoSchedule",
                            }],
                            containers: [{
                                name: "vllm-worker",
                                image: "vllm/vllm-openai:latest",
                                command: [
                                    "sh",
                                    "-c",
                                    "bash /vllm-workspace/examples/online_serving/multi-node-serving.sh worker --ray_address=$(LWS_LEADER_ADDRESS)",
                                ],
                                resources: {
                                    limits: {
                                        "nvidia.com/gpu": `${config.gpuPerNode}`
                                    },
                                    requests: {
                                        "nvidia.com/gpu": `${config.gpuPerNode}`
                                    }
                                },
                                env: [{
                                    name: "VLLM_ATTENTION_BACKEND",
                                    value: "TRITON_ATTN_VLLM_V1",
                                }, {
                                    name: "HUGGING_FACE_HUB_TOKEN",
                                    valueFrom: {
                                        secretKeyRef: {
                                            name: "huggingface-token",
                                            key: "token",
                                        }
                                    }
                                }],
                                volumeMounts: [{
                                    mountPath: "/dev/shm",
                                    name: "dshm",
                                }],
                            }],
                            volumes: [{
                                name: "dshm",
                                emptyDir: {
                                    medium: "Memory",
                                    sizeLimit: "15Gi",
                                },
                            }],
                        },
                    },
                },
            },
        }, {parent: this});

        const service = new k8s.core.v1.Service(`${name}-vllm-leader-svc`, {
            metadata: {
                name: `${name}-vllm-leader-svc`,
                namespace: args.namespaceName || "lws-system",
                annotations: {
                    "prometheus.io/scrape": args.monitoringEnabled ? "true" : "false",
                    "prometheus.io/port": "8080",
                }
            },
            spec: {
                ports: [{
                    name: "http",
                    port: 8080,
                    protocol: "TCP",
                    targetPort: 8080,
                }],
                selector: {
                    "leaderworkerset.sigs.k8s.io/name": leaderWorkerSet.metadata.name,
                    role: "leader",
                },
                type: "ClusterIP",
            },
        }, {parent: this});


        this.modelInternalServiceDNS = pulumi.interpolate`${service.metadata.name}.${service.metadata.namespace}.svc.cluster.local:8080`;

        this.registerOutputs({
            modelInternalServiceDNS: this.modelInternalServiceDNS
        });
    }
}

type TShirtSize = "small" | "medium" | "large";

type ModelConfig = {
    small: {
        replicas: number;
        size: number;
        gpuPerNode?: number;
    };
    medium: {
        replicas: number;
        size: number;
        gpuPerNode?: number;
    };
    large: {
        replicas: number;
        size: number;
        gpuPerNode?: number;
    };
};

const modelConfigs: ModelConfig = {
    small: {
        replicas: 1,
        size: 2,
        gpuPerNode: 8
    },
    medium: {
        replicas: 2,
        size: 4,
        gpuPerNode: 8
    },
    large: {
        replicas: 4,
        size: 8,
        gpuPerNode: 8
    }
};

export interface AIModelComponentArgs {

    /**
     * The name of the AI model to deploy (e.g., "gpt-4", "bert-base-uncased").
     */
    modelName: pulumi.Input<string>;

    /**
     * (Optional) The Kubernetes namespace to deploy the AI model into. If not specified, a default namespace will be created.
     */
    namespaceName?: pulumi.Input<string>;
    /**
     * (Optional) The size of the AI model to deploy (e.g., "small", "medium", "large"). If not specified, a default size will be used.
     */
    size?: pulumi.Input<string>; // e.g., "small", "medium", "large"

    /**
     * (Optional) Enable monitoring for the AI model deployment. Defaults to false.
     */
    monitoringEnabled?: pulumi.Input<boolean>;

    /**
     * (Optional) If true, the model will not use parallel processing. Defaults to false.
     */
    notParallel?: pulumi.Input<boolean>;
}


