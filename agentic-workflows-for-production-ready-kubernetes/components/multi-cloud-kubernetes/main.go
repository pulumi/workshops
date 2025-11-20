package main

import (
	"context"

	"github.com/pulumi/pulumi-go-provider/infer"
)

func main() {
	prov, err := infer.NewProviderBuilder().
		WithNamespace("ediri").
		WithDisplayName("Multi-Cloud Kubernetes").
		WithComponents(
			infer.ComponentF(NewKubernetesCluster),
		).
		Build()
	if err != nil {
		panic(err)
	}

	_ = prov.Run(context.Background(), "multi-cloud-kubernetes", "v0.1.0")
}

/*

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		// Create AWS provider with explicit configuration
		awsProvider, err := aws.NewProvider(ctx, "aws-provider", &aws.ProviderArgs{
			Region:               pulumi.String("us-east-1"),
			SkipMetadataApiCheck: pulumi.Bool(false),
			DefaultTags: &aws.ProviderDefaultTagsArgs{
				Tags: pulumi.StringMap{
					"ManagedBy":   pulumi.String("Pulumi"),
					"Project":     pulumi.String("multi-cloud-kubernetes"),
					"Environment": pulumi.String("dev"),
				},
			},
		})
		if err != nil {
			return err
		}

		// Create Azure Native provider with explicit configuration
		azureProvider, err := azurenative.NewProvider(ctx, "azure-provider", &azurenative.ProviderArgs{
			Location: pulumi.String("eastus"),
		})
		if err != nil {
			return err
		}

		// Create an Azure AKS cluster
		azureCluster, err := NewKubernetesCluster(ctx, "azure-k8s-cluster", &KubernetesClusterArgs{
			Provider:      ProviderAzure,
			ClusterName:   pulumi.String("azure-demo-cluster"),
			Version:       pulumi.String("1.33.5"),
			Role:          RoleHub, // Hub cluster with ArgoCD
			Region:        pulumi.String("westeurope"),
			AzureProvider: azureProvider,
		})
		if err != nil {
			return err
		}

		// Export the Azure cluster outputs
		ctx.Export("azureKubeconfig", azureCluster.Kubeconfig)
		ctx.Export("azureClusterName", azureCluster.ClusterName)
		ctx.Export("azureEndpoint", azureCluster.Endpoint)

		// Create an AWS EKS cluster
		awsCluster, err := NewKubernetesCluster(ctx, "aws-k8s-cluster", &KubernetesClusterArgs{
			Provider:      ProviderAWS,
			ClusterName:   pulumi.String("aws-demo-cluster"),
			Version:       pulumi.String("1.33"),
			Role:          RoleSpoke, // Spoke cluster
			Region:        pulumi.String("us-east-1"),
			HubKubeconfig: azureCluster.Kubeconfig,
			HubEndpoint:   azureCluster.Endpoint,
			AwsProvider:   awsProvider,
		})
		if err != nil {
			return err
		}

		// Export the AWS cluster outputs
		ctx.Export("awsKubeconfig", awsCluster.Kubeconfig)
		ctx.Export("awsClusterName", awsCluster.ClusterName)

		return nil
	})
}
*/
