import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as eks from "@pulumi/eks";

// Default VPC subnets are public: no NAT gateway, so no NAT cost.
const vpc = aws.ec2.getVpcOutput({ default: true });
const subnets = aws.ec2.getSubnetsOutput({
    filters: [{ name: "vpc-id", values: [vpc.id] }],
});

const cluster = new eks.Cluster("pki", {
    vpcId: vpc.id,
    subnetIds: subnets.ids,
    instanceType: "t3.medium",
    desiredCapacity: 2,
    minSize: 2,
    maxSize: 2,
    nodeAssociatePublicIpAddress: true, // public subnets only
    createOidcProvider: true,           // IRSA for the issuer in step 04
});

export const kubeconfig = pulumi.secret(cluster.kubeconfigJson);
export const clusterName = cluster.eksCluster.name;
export const oidcProviderArn = cluster.core.apply(c => c.oidcProvider!.arn);
export const oidcProviderUrl = cluster.core.apply(c => c.oidcProvider!.url);
