import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

/**
 * Capacity type for Karpenter nodes
 */
export type CapacityType = "spot" | "on-demand";

/**
 * Consolidation policy for node disruption
 */
export type ConsolidationPolicy = "WhenEmpty" | "WhenEmptyOrUnderutilized";

/**
 * Taint effect for node taints
 */
export type TaintEffect = "NoSchedule" | "PreferNoSchedule" | "NoExecute";

/**
 * Node taint configuration
 */
export interface NodeTaint {
    /**
     * The taint key
     */
    key: string;
    /**
     * The taint value
     */
    value?: string;
    /**
     * The taint effect
     */
    effect: TaintEffect;
}

/**
 * Custom requirement for node selection
 */
export interface NodeRequirement {
    /**
     * The requirement key (e.g., "topology.kubernetes.io/zone")
     */
    key: string;
    /**
     * The operator (In, NotIn, Exists, DoesNotExist, Gt, Lt)
     */
    operator: "In" | "NotIn" | "Exists" | "DoesNotExist" | "Gt" | "Lt";
    /**
     * The values for the requirement
     */
    values?: string[];
}

/**
 * Resource limits for the NodePool
 */
export interface ResourceLimits {
    /**
     * Maximum CPU cores across all nodes in this pool
     */
    cpu?: number | string;
    /**
     * Maximum memory across all nodes in this pool (e.g., "100Gi")
     */
    memory?: string;
}

/**
 * Disruption configuration for the NodePool
 */
export interface DisruptionConfig {
    /**
     * Policy for consolidating nodes (WhenEmpty or WhenEmptyOrUnderutilized)
     */
    consolidationPolicy?: ConsolidationPolicy;
    /**
     * Time to wait before consolidating (e.g., "1m", "30s")
     */
    consolidateAfter?: string;
}

/**
 * Arguments for creating a KarpenterNodePool component
 */
export interface KarpenterNodePoolArgs {
    /**
     * The name of the NodePool in Kubernetes
     */
    poolName?: pulumi.Input<string>;

    /**
     * Capacity types for the nodes (spot, on-demand, or both)
     * @default ["on-demand"]
     */
    capacityTypes?: CapacityType[];

    /**
     * Instance types to use (e.g., ["g4dn.xlarge", "g5.xlarge"])
     * Required: You must specify at least one instance type
     */
    instanceTypes: string[];

    /**
     * NodeClass reference name
     * @default "default"
     */
    nodeClassName?: string;

    /**
     * Labels to apply to nodes
     */
    labels?: Record<string, string>;

    /**
     * Taints to apply to nodes
     */
    taints?: NodeTaint[];

    /**
     * Additional requirements for node selection
     */
    requirements?: NodeRequirement[];

    /**
     * Resource limits for the NodePool
     */
    limits?: ResourceLimits;

    /**
     * Disruption configuration
     */
    disruption?: DisruptionConfig;

    /**
     * Availability zones to use
     */
    availabilityZones?: string[];

    /**
     * Instance categories (e.g., ["g", "p"] for GPU instances)
     */
    instanceCategories?: string[];

    /**
     * Minimum instance generation (for Gt operator)
     */
    instanceGeneration?: string;

    /**
     * CPU architecture
     * @default "amd64"
     */
    architecture?: string;
}

/**
 * Internal spec shape for the Karpenter NodePool CRD
 */
interface NodePoolSpec {
    template: {
        metadata?: { labels: Record<string, string> };
        spec: {
            nodeClassRef: { group: string; kind: string; name: string };
            requirements: NodeRequirement[];
            taints?: { key: string; value?: string; effect: string }[];
        };
    };
    limits?: { cpu?: number | string; memory?: string };
    disruption?: { consolidationPolicy?: string; consolidateAfter?: string };
}

export class KarpenterNodePoolComponent extends pulumi.ComponentResource {
    /**
     * The Kubernetes NodePool resource
     */
    private readonly nodePool: k8s.apiextensions.CustomResource;

    /**
     * The name of the NodePool
     */
    public readonly nodePoolName: pulumi.Output<string>;

    constructor(name: string, args: KarpenterNodePoolArgs, opts?: pulumi.ComponentResourceOptions) {
        super("karpenter:index:KarpenterNodePoolComponent", name, args, opts);

        const poolName = args.poolName || name;

        // Build requirements array
        const requirements: NodeRequirement[] = [];

        // Capacity type requirement
        requirements.push({
            key: "karpenter.sh/capacity-type",
            operator: "In",
            values: args.capacityTypes || ["on-demand"],
        });

        // Instance type requirement (required)
        requirements.push({
            key: "node.kubernetes.io/instance-type",
            operator: "In",
            values: args.instanceTypes,
        });

        // Availability zones (optional)
        if (args.availabilityZones && args.availabilityZones.length > 0) {
            requirements.push({
                key: "topology.kubernetes.io/zone",
                operator: "In",
                values: args.availabilityZones,
            });
        }

        // Instance categories (optional, for GPU instances use ["g", "p"])
        if (args.instanceCategories && args.instanceCategories.length > 0) {
            requirements.push({
                key: "eks.amazonaws.com/instance-category",
                operator: "In",
                values: args.instanceCategories,
            });
        }

        // Instance generation (optional)
        if (args.instanceGeneration) {
            requirements.push({
                key: "eks.amazonaws.com/instance-generation",
                operator: "Gt",
                values: [args.instanceGeneration],
            });
        }

        // Architecture requirement
        if (args.architecture) {
            requirements.push({
                key: "kubernetes.io/arch",
                operator: "In",
                values: [args.architecture],
            });
        }

        // Add custom requirements
        if (args.requirements) {
            for (const req of args.requirements) {
                requirements.push({
                    key: req.key,
                    operator: req.operator,
                    values: req.values,
                });
            }
        }

        // Build taints array
        const taints = args.taints?.map(t => ({
            key: t.key,
            value: t.value,
            effect: t.effect,
        }));

        // Build the spec
        // Using standard Karpenter (not EKS Auto Mode) with EC2NodeClass
        const spec: NodePoolSpec = {
            template: {
                spec: {
                    nodeClassRef: {
                        group: "karpenter.k8s.aws",
                        kind: "EC2NodeClass",
                        name: args.nodeClassName || "default",
                    },
                    requirements,
                },
            },
        };

        // Add labels if provided
        if (args.labels && Object.keys(args.labels).length > 0) {
            spec.template.metadata = {
                labels: args.labels,
            };
        }

        // Add taints if provided
        if (taints && taints.length > 0) {
            spec.template.spec.taints = taints;
        }

        // Add limits if provided
        if (args.limits) {
            spec.limits = {};
            if (args.limits.cpu !== undefined) {
                spec.limits.cpu = args.limits.cpu;
            }
            if (args.limits.memory !== undefined) {
                spec.limits.memory = args.limits.memory;
            }
        }

        // Add disruption config if provided
        if (args.disruption) {
            spec.disruption = {};
            if (args.disruption.consolidationPolicy) {
                spec.disruption.consolidationPolicy = args.disruption.consolidationPolicy;
            }
            if (args.disruption.consolidateAfter) {
                spec.disruption.consolidateAfter = args.disruption.consolidateAfter;
            }
        }

        this.nodePool = new k8s.apiextensions.CustomResource(`${name}-nodepool`, {
            apiVersion: "karpenter.sh/v1",
            kind: "NodePool",
            metadata: {
                name: poolName,
            },
            spec,
        }, { parent: this });

        this.nodePoolName = this.nodePool.metadata.name;

        this.registerOutputs({
            nodePoolName: this.nodePoolName,
        });
    }
}
