package main

import (
	"github.com/pulumi/pulumi-awsx/sdk/go/awsx/ec2"
	"github.com/pulumi/pulumi-eks/sdk/v2/go/eks"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi/config"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		// Get some configuration values or set default values
		cfg := config.New(ctx, "")
		minClusterSize, err := cfg.TryInt("minClusterSize")
		if err != nil {
			minClusterSize = 3
		}
		maxClusterSize, err := cfg.TryInt("maxClusterSize")
		if err != nil {
			maxClusterSize = 6
		}
		desiredClusterSize, err := cfg.TryInt("desiredClusterSize")
		if err != nil {
			desiredClusterSize = 3
		}
		eksNodeInstanceType, err := cfg.Try("eksNodeInstanceType")
		if err != nil {
			eksNodeInstanceType = "t3.medium"
		}
		vpcNetworkCidr, err := cfg.Try("vpcNetworkCidr")
		if err != nil {
			vpcNetworkCidr = "10.0.0.0/16"
		}

		// Create a new VPC, subnets, and associated infrastructure
		eksVpc, err := ec2.NewVpc(ctx, "go-eda-workshop-eks-vpc", &ec2.VpcArgs{
			EnableDnsHostnames: pulumi.Bool(true),
			CidrBlock:          &vpcNetworkCidr,
		})
		if err != nil {
			return err
		}

		// Create a new EKS cluster
		eksCluster, err := eks.NewCluster(ctx, "go-eda-workshop-eks-cluster", &eks.ClusterArgs{
			VpcId:                        eksVpc.VpcId,
			PublicSubnetIds:              eksVpc.PublicSubnetIds,
			PrivateSubnetIds:             eksVpc.PrivateSubnetIds,
			InstanceType:                 pulumi.String(eksNodeInstanceType),
			DesiredCapacity:              pulumi.Int(desiredClusterSize),
			MinSize:                      pulumi.Int(minClusterSize),
			MaxSize:                      pulumi.Int(maxClusterSize),
			NodeAssociatePublicIpAddress: pulumi.BoolRef(false),
			CreateOidcProvider:           pulumi.Bool(true),
			EndpointPublicAccess:         pulumi.Bool(true),
			ProviderCredentialOpts: eks.KubeconfigOptionsArgs{
				ProfileName: pulumi.String("default"),
			},
		})
		if err != nil {
			return err
		}

		// Export some values in case they are needed elsewhere
		ctx.Export("kubeconfig", pulumi.ToSecret(eksCluster.KubeconfigJson))
		ctx.Export("eks-oidc-provider-arn", eksCluster.Core.OidcProvider().Arn())
		ctx.Export("eks-oidc-provider-url", eksCluster.Core.OidcProvider().Url())

		return nil
	})
}
