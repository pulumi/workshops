## Exercise 1: Add stack references to get the kubeconfig from the "base_cluster" stack.
# Doc: https://www.pulumi.com/docs/intro/concepts/stack/#stackreferences

import pulumi
from pulumi import ResourceOptions
import pulumi_kubernetes as k8s
from pulumi_kubernetes.helm.v3 import Chart, ChartOpts

## Exercise 1
# Using config data to get the name of the base stack.
# The Pulumi automation API or other methods could be used to automate the config value.
config = pulumi.Config()
base_cluster_stack_name = config.require("base_cluster_stack")
base_cluster_stack = pulumi.StackReference(base_cluster_stack_name)
kubeconfig = base_cluster_stack.get_output("kubeconfig")

# The K8s provider which supplies the helm chart resource needs to know how to talk to the K8s cluster.
# So, instantiate a K8s provider using the retrieved kubeconfig.
k8s_provider = k8s.Provider('k8s-provider', kubeconfig=kubeconfig)

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