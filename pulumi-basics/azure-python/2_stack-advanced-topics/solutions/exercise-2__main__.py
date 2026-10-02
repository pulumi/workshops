# See EXERCISES.md

import base64
import pulumi
from pulumi import Config, ResourceOptions
from pulumi_tls import PrivateKey
from pulumi_azure_native import resources, containerservice
import pulumi_azuread as azuread
import pulumi_kubernetes as k8s
from pulumi_kubernetes.helm.v3 import Chart, ChartOpts

config = Config()
k8s_version = config.get('k8sVersion') or '1.19.11'
node_count = config.get_int('nodeCount') or 2
node_size = config.get('nodeSize') or 'Standard_D2_v2'

## Exercise 1
## Suggestion: Take a look at the stack config file (e.g. Pulumi.dev.yaml) to confirm you stored the admin username as a secret.
admin_username = config.require_secret('adminUserName') 
pulumi.export('admin_username', admin_username)
## Exercise 1

generated_key_pair = PrivateKey('ssh-key',
    algorithm='RSA', rsa_bits=4096)
ssh_public_key = generated_key_pair.public_key_openssh

resource_group = resources.ResourceGroup('rg')

k8s_cluster = containerservice.ManagedCluster('cluster',
    resource_group_name=resource_group.name,
    agent_pool_profiles=[{
        'count': node_count,
        'max_pods': 20,
        'mode': 'System',
        'name': 'agentpool',
        'node_labels': {},
        'os_disk_size_gb': 30,
        'os_type': 'Linux',
        'type': 'VirtualMachineScaleSets',
        'vm_size': node_size,
    }],
    dns_prefix=resource_group.name,
    enable_rbac=True,
    kubernetes_version=k8s_version,
    linux_profile={
        'admin_username': admin_username,
        'ssh': {
            'publicKeys': [{
                'keyData': ssh_public_key,
            }],
        },
    },
    identity={
        'type': 'SystemAssigned'
    })

# Obtaining the kubeconfig from an Azure K8s cluster requires using the "list_managed_clsuter_user_credentials"
# function.
# That function requires passing values that are not be known until the resources are created.
# Thus, the use of "apply()" to wait for those values before calling the function.
creds = pulumi.Output.all(resource_group.name, k8s_cluster.name).apply(
    lambda args:
    containerservice.list_managed_cluster_user_credentials(
        resource_group_name=args[0],
        resource_name=args[1]))

# The "list_managed_cluster_user_credentials" function returns an array of base64 encoded kubeconfigs.
# So decode the kubeconfig for our cluster.
## Exercise 2/2a
## How to programmatically create a secret: Use `pulumi.Output.secret()`
kubeconfig = pulumi.Output.secret(creds.kubeconfigs[0].value.apply(
    lambda enc: base64.b64decode(enc).decode()))
## How to get the unecrypted value from the stack outputs: `pulumi stack output kubeconfig --show-secret`
pulumi.export('kubeconfig', kubeconfig)
## Exercise 2

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

pulumi.export('resource_group_name', resource_group.name)
pulumi.export('cluster_name', k8s_cluster.name)
pulumi.export('apache_service_ip', apache_service_ip)