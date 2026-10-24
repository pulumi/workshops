import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as eks from "@pulumi/eks";

// PublicEksCluster: the cluster shape both workshop projects use.
// One VPC, two public subnets in two availability zones, one EKS cluster and one
// managed node group of 2 t3.medium nodes. No private subnets, no NAT gateway.
// This file is identical in 02-provider/ and 05-consumer/ (each project is
// deployed on its own, so each carries its own copy).

export interface PublicEksClusterArgs {
    /** EKS cluster name. Must be unique per account and region. */
    clusterName: string;
    /** Kubernetes version of the control plane. Defaults to 1.35. */
    kubernetesVersion?: pulumi.Input<string>;
    /** Worker node instance type. Defaults to t3.medium. */
    instanceType?: pulumi.Input<string>;
    /** Number of worker nodes. Defaults to 2. */
    nodeCount?: pulumi.Input<number>;
    /** VPC CIDR block. Defaults to 10.0.0.0/16. */
    vpcCidr?: pulumi.Input<string>;
}

export class PublicEksCluster extends pulumi.ComponentResource {
    public readonly clusterName: pulumi.Output<string>;
    public readonly kubeconfig: pulumi.Output<string>;

    constructor(name: string, args: PublicEksClusterArgs, opts?: pulumi.ComponentResourceOptions) {
        super("kbind-workshop:index:PublicEksCluster", name, {}, opts);

        const vpcCidr = args.vpcCidr ?? "10.0.0.0/16";
        const nodeCount = args.nodeCount ?? 2;
        const azs = aws.getAvailabilityZonesOutput({ state: "available" });

        const vpc = new aws.ec2.Vpc(`${name}-vpc`, {
            cidrBlock: vpcCidr,
            enableDnsHostnames: true,
            enableDnsSupport: true,
            tags: { Name: `${args.clusterName}-vpc` },
        }, { parent: this });

        const igw = new aws.ec2.InternetGateway(`${name}-igw`, {
            vpcId: vpc.id,
            tags: { Name: `${args.clusterName}-igw` },
        }, { parent: this });

        const routeTable = new aws.ec2.RouteTable(`${name}-public`, {
            vpcId: vpc.id,
            routes: [{ cidrBlock: "0.0.0.0/0", gatewayId: igw.id }],
            tags: { Name: `${args.clusterName}-public` },
        }, { parent: this });

        const subnetIds: pulumi.Output<string>[] = [];
        for (let i = 0; i < 2; i++) {
            const subnet = new aws.ec2.Subnet(`${name}-public-${i}`, {
                vpcId: vpc.id,
                cidrBlock: `10.0.${i}.0/24`,
                availabilityZone: azs.names[i],
                mapPublicIpOnLaunch: true,
                tags: {
                    Name: `${args.clusterName}-public-${i}`,
                    // Lets the Kubernetes cloud provider place the load balancer in these subnets.
                    "kubernetes.io/role/elb": "1",
                    [`kubernetes.io/cluster/${args.clusterName}`]: "shared",
                },
            }, { parent: this });
            new aws.ec2.RouteTableAssociation(`${name}-public-${i}`, {
                subnetId: subnet.id,
                routeTableId: routeTable.id,
            }, { parent: this });
            subnetIds.push(subnet.id);
        }

        const cluster = new eks.Cluster(`${name}-cluster`, {
            name: args.clusterName,
            version: args.kubernetesVersion ?? "1.35",
            vpcId: vpc.id,
            subnetIds,
            endpointPublicAccess: true,
            authenticationMode: eks.AuthenticationMode.Api,
            skipDefaultNodeGroup: true,
        }, { parent: this });

        const nodeRole = new aws.iam.Role(`${name}-node-role`, {
            assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({ Service: "ec2.amazonaws.com" }),
        }, { parent: this });
        [
            "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
            "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
            "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
        ].forEach((policyArn, i) => {
            new aws.iam.RolePolicyAttachment(`${name}-node-policy-${i}`, {
                role: nodeRole.name,
                policyArn,
            }, { parent: this });
        });

        new eks.ManagedNodeGroup(`${name}-nodes`, {
            cluster,
            nodeRole,
            subnetIds,
            instanceTypes: [args.instanceType ?? "t3.medium"],
            scalingConfig: { minSize: nodeCount, maxSize: nodeCount, desiredSize: nodeCount },
        }, { parent: this });

        this.clusterName = cluster.eksCluster.name;
        this.kubeconfig = pulumi.secret(cluster.kubeconfigJson);

        this.registerOutputs({
            clusterName: this.clusterName,
            kubeconfig: this.kubeconfig,
        });
    }
}
