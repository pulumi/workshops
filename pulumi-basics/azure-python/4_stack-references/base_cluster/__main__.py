# See EXERCISES.md

import pulumi
from pulumi import Config, ResourceOptions
import pulumi_azure as azure
from pulumi_azure_native import resources
import pulumi_random as random

import cluster

# Config values or defaults
config = Config()
supported_k8s_versions = azure.containerservice.get_kubernetes_service_versions(location="West Europe")
latest_k8s_version = supported_k8s_versions.latest_version 
k8s_version = config.get('k8sVersion') or latest_k8s_version
k8s_version = config.get('k8sVersion') or '1.19.11'
admin_username = config.get('adminUserName') or 'testuser'
node_count = config.get_int('nodeCount') or 2
node_size = config.get('nodeSize') or 'Standard_D2_v2'

# Resource Group
resource_group = resources.ResourceGroup('rg')

# Create a cluster resource using our custom component resource class
cluster = cluster.Cluster('k8scluster', cluster.ClusterArgs(
    resource_group_name=resource_group.name,
    node_count=node_count,
    node_size=node_size,
    k8s_version=k8s_version,
    admin_username=admin_username,
))

# Export the kubeconfig 
pulumi.export("kubeconfig", cluster.kubeconfig)