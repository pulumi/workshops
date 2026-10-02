# See EXERCISES.md

import pulumi
from pulumi import Config, ResourceOptions
from pulumi_azure_native import resources
import pulumi_kubernetes as k8s
from pulumi_kubernetes.helm.v3 import Chart, ChartOpts
import pulumi_random as random

import cluster

# Config values or defaults
config = Config()
k8s_version = config.get('k8sVersion') or '1.19.11'
admin_username = config.get('adminUserName') or 'testuser'
node_count = config.get_int('nodeCount') or 2
node_size = config.get('nodeSize') or 'Standard_D2_v2'

# Resource Group
resource_group = resources.ResourceGroup('rg')

# Exercise 1
# Create a cluster resource using our custom component resource class
cluster = cluster.Cluster('k8scluster', cluster.ClusterArgs(
    resource_group_name=resource_group.name,
    node_count=node_count,
    node_size=node_size,
    k8s_version=k8s_version,
    admin_username=admin_username,
))

# The K8s provider which supplies the helm chart resource needs to know how to talk to the K8s cluster.
# So, instantiate a K8s provider using the retrieved kubeconfig.
k8s_provider = k8s.Provider('k8s-provider', kubeconfig=cluster.kubeconfig)

# Create a chart resource to deploy apache using the k8s provider instantiated above.
apache = Chart('apache-chart',
    ChartOpts(
        chart='apache',
        version='8.3.2',
        fetch_opts={'repo': 'https://charts.bitnami.com/bitnami'}),
    opts=ResourceOptions(provider=k8s_provider))

# Get the helm-deployed apache service IP which isn't known until the chart is deployed.
apache_service_ip = apache.get_resource('v1/Service', 'apache-chart').apply(
    lambda res: res.status.load_balancer.ingress[0].ip)

# Correct option using "concat()"
pulumi.export('Apache_URL', pulumi.Output.concat('http://', apache_service_ip)) 