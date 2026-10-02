# See EXERCISES.md

import pulumi
from pulumi import ResourceOptions
from pulumi_kubernetes.helm.v3 import Chart, ChartOpts

## Exercise 4
## Move the cluster and related bits to a cluster.py file and import here.
## Modify references to add "cluster." as needed.
## This means the main can focus on deploying the Helm chart to the K8s cluster without worrying
## about the nuances of creating a cluster.
## It also means I can swap out the cluster.py file for one which deploys to, say, AWS EKS and this code
## doesn't have to change.
import cluster

# Create a chart resource to deploy apache using the k8s provider instantiated above.
apache = Chart('apache-chart',
    ChartOpts(
        chart='apache',
        version='8.3.2',
        fetch_opts={'repo': 'https://charts.bitnami.com/bitnami'}),
    opts=ResourceOptions(provider=cluster.k8s_provider))

# Get the helm-deployed apache service IP which isn't known until the chart is deployed.
apache_service_ip = apache.get_resource('v1/Service', 'apache-chart').apply(
    lambda res: res.status.load_balancer.ingress[0].ip)

pulumi.export('resource_group_name', cluster.resource_group.name)
pulumi.export('cluster_name', cluster.k8s_cluster.name)
pulumi.export('apache_service_ip', apache_service_ip)

## Exercise 3
# Same results in a couple of different ways.
# using "concat()"
pulumi.export('apache_url_using_concat', pulumi.Output.concat('http://', apache_service_ip)) 
# using "apply()"
pulumi.export('apache_url_using_apply', apache_service_ip.apply(lambda ip: f'http://{ip}'))

## Exercise 4
## Now that kubeconfig and password come via the cluster module, the export is updated to reference it as such.
pulumi.export('kubeconfig', cluster.kubeconfig)