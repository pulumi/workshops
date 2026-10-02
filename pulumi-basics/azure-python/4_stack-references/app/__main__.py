# See EXERCISES.md

import pulumi
from pulumi import ResourceOptions
import pulumi_kubernetes as k8s
from pulumi_kubernetes.helm.v3 import Chart, ChartOpts

# The K8s provider which supplies the helm chart resource needs to know how to talk to the K8s cluster.
# So, instantiate a K8s provider using the retrieved kubeconfig.
k8s_provider = k8s.Provider('k8s-provider', kubeconfig=kubeconfig)

# Create a chart resource to deploy apache using the k8s provider instantiated above.
apache = Chart('apache-chart',
    ChartOpts(
        chart='apache',
        version='9.4.1', # See https://artifacthub.io/packages/helm/bitnami/apache for latest chart versions.
        fetch_opts={'repo': 'https://charts.bitnami.com/bitnami'}),
    opts=ResourceOptions(provider=k8s_provider))

# Get the helm-deployed apache service IP which isn't known until the chart is deployed.
apache_service_ip = apache.get_resource('v1/Service', 'apache-chart').apply(
    lambda res: res.status.load_balancer.ingress[0].ip)

# Correct option using "concat()"
pulumi.export('Apache_URL', pulumi.Output.concat('http://', apache_service_ip)) 