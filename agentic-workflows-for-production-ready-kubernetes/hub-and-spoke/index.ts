import * as multiCloudKubernetes from "@ediri/multi-cloud-kubernetes";
import * as pulumi from "@pulumi/pulumi";


const azureCluster = new multiCloudKubernetes.KubernetesCluster("azure-hub-cluster", {
    provider: "azure",
    clusterName: "azure-hub-cluster",
    version: "1.33.5",
    role: "hub",
    region: "westeurope",
});

export const azureKubeconfig = pulumi.secret(azureCluster.kubeconfig);
export const clusterName = azureCluster.clusterName;
export const clusterEndpoint = azureCluster.endpoint;

/*
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
 */

const awsSpoke1Cluster = new multiCloudKubernetes.KubernetesCluster("aws-spoke-1-cluster", {
    provider: "aws",
    clusterName: "aws-spoke-1-cluster",
    version: "1.33",
    role: "spoke",
    region: "us-east-1",
    hubKubeconfig: azureCluster.kubeconfig,
    hubEndpoint: azureCluster.endpoint,
});

export const spoke1Kubeconfig = pulumi.secret(awsSpoke1Cluster.kubeconfig);
export const spoke1ClusterName = awsSpoke1Cluster.clusterName;

const awsSpoke2Cluster = new multiCloudKubernetes.KubernetesCluster("aws-spoke-2-cluster", {
    provider: "aws",
    clusterName: "aws-spoke-2-cluster",
    version: "1.33",
    role: "spoke",
    region: "il-central-1",
    hubKubeconfig: azureCluster.kubeconfig,
    hubEndpoint: azureCluster.endpoint,
});

export const spoke2Kubeconfig = pulumi.secret(awsSpoke2Cluster.kubeconfig);
export const spoke2ClusterName = awsSpoke2Cluster.clusterName;
