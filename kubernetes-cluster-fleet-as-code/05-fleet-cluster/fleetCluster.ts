import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";
import * as k8s from "@pulumi/kubernetes";

export interface FleetClusterArgs {
    /** Resource group of the fleet; the cluster is created in the same group. */
    resourceGroupName: pulumi.Input<string>;
    /** Name of the fleet to join. */
    fleetName: pulumi.Input<string>;
    /** Update group of the fleet member. Must match a group in the update strategy stages. */
    group: pulumi.Input<string>;
    /** Kubernetes version to create the cluster with, for example "1.35". */
    kubernetesVersion: pulumi.Input<string>;
    /** VM size of the single node. */
    vmSize: pulumi.Input<string>;
}

/**
 * One AKS cluster, joined to a fleet, with the fleet baseline applied inside
 * it: a `platform` namespace and a ResourceQuota. Instantiate it once per stack.
 */
export class FleetCluster extends pulumi.ComponentResource {
    public readonly clusterName: pulumi.Output<string>;
    public readonly group: pulumi.Output<string>;
    public readonly fleetMemberId: pulumi.Output<string>;
    public readonly namespace: pulumi.Output<string>;

    constructor(name: string, args: FleetClusterArgs, opts?: pulumi.ComponentResourceOptions) {
        super("fleet:index:FleetCluster", name, {}, opts);

        const tags = { fleet: "workshop" };

        // Never change agentPoolProfiles after creation: the registry page says
        // the pool cannot be updated directly. The Kubernetes version is
        // changed by a fleet update run, not by this program.
        const cluster = new azure.containerservice.ManagedCluster(`${name}-aks`, {
            resourceGroupName: args.resourceGroupName,
            resourceName: `aks-${name}`,
            dnsPrefix: `aks-${name}`,
            kubernetesVersion: args.kubernetesVersion,
            enableRBAC: true,
            identity: { type: azure.containerservice.ResourceIdentityType.SystemAssigned },
            sku: {
                name: azure.containerservice.ManagedClusterSKUName.Base,
                tier: azure.containerservice.ManagedClusterSKUTier.Free,
            },
            agentPoolProfiles: [{
                name: "system",
                mode: azure.containerservice.AgentPoolMode.System,
                count: 1,
                vmSize: args.vmSize,
                osType: azure.containerservice.OSType.Linux,
            }],
            tags,
        }, { parent: this });

        // The member's group is what the update strategy stages select on.
        const member = new azure.containerservice.FleetMember(`${name}-member`, {
            fleetMemberName: name,
            fleetName: args.fleetName,
            resourceGroupName: args.resourceGroupName,
            clusterResourceId: cluster.id,
            group: args.group,
        }, { parent: this });

        const credentials = azure.containerservice.listManagedClusterUserCredentialsOutput({
            resourceGroupName: args.resourceGroupName,
            resourceName: cluster.name,
        });
        const kubeconfig = pulumi.secret(
            credentials.kubeconfigs[0].value.apply(value => Buffer.from(value, "base64").toString("utf8")),
        );
        const provider = new k8s.Provider(`${name}-k8s`, { kubeconfig }, { parent: this });

        // The baseline inside the cluster.
        const platform = new k8s.core.v1.Namespace(`${name}-platform`, {
            metadata: { name: "platform", labels: { fleet: "workshop" } },
        }, { parent: this, provider });

        new k8s.core.v1.ResourceQuota(`${name}-platform-quota`, {
            metadata: { name: "platform-baseline", namespace: platform.metadata.name },
            spec: { hard: { pods: "20", "requests.cpu": "1", "requests.memory": "2Gi" } },
        }, { parent: this, provider });

        this.clusterName = cluster.name;
        this.group = pulumi.output(args.group);
        this.fleetMemberId = member.id;
        this.namespace = platform.metadata.name;

        this.registerOutputs({
            clusterName: this.clusterName,
            group: this.group,
            fleetMemberId: this.fleetMemberId,
            namespace: this.namespace,
        });
    }
}
