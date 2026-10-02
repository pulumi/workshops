# A component resource module shell 
# See comments below for help

import pulumi
from pulumi import ComponentResource, ResourceOptions
from pulumi_tls import PrivateKey
import pulumi_azuread as azuread
from pulumi_azure_native import containerservice
import base64

class ClusterArgs:
    def __init__(self,
                 # name the arguments and their types (e.g. str, bool, etc)
                 resource_group_name: str,
                 node_count:int,
                 node_size:str,
                 k8s_version:str,
                 admin_username: str,
                 ):

        # Set the class args
        self.resource_group_name = resource_group_name
        self.node_count = node_count
        self.node_size = node_size
        self.k8s_version = k8s_version
        self.admin_username = admin_username

class Cluster(ComponentResource):
    def __init__(self,
                 name: str,
                 args: ClusterArgs,
                 opts: ResourceOptions = None):

        # Leave this line. You can modify 'customer:resoure:Cluster' if you want
        super().__init__('custom:resource:Cluster', name, {}, opts)

        # Create the resources. 
        # Be sure to set a ResourceOption(parent=self) and prefix anything you want to return as an output with "self."
        # Example:
        # resource_group = resources.ResourceGroup('rg', opts=ResourceOptions(parent=self))
        # self.rg_name = resource_group.name

        ### AKS Cluster Related Resources
        generated_key_pair = PrivateKey(f'{name}-ssh-key',
            algorithm='RSA', rsa_bits=4096, opts=ResourceOptions(parent=self))
        ssh_public_key = generated_key_pair.public_key_openssh

        k8s_cluster = containerservice.ManagedCluster(f'{name}-k8s',
            resource_group_name=args.resource_group_name,
            agent_pool_profiles=[{
                'count': args.node_count,
                'max_pods': 20,
                'mode': 'System',
                'name': 'agentpool',
                'node_labels': {},
                'os_disk_size_gb': 30,
                'os_type': 'Linux',
                'type': 'VirtualMachineScaleSets',
                'vm_size': args.node_size,
            }],
            dns_prefix=args.resource_group_name,
            enable_rbac=True,
            kubernetes_version=args.k8s_version,
            linux_profile={
                'admin_username': args.admin_username,
                'ssh': {
                    'publicKeys': [{
                        'keyData': ssh_public_key,
                    }],
                },
            },
            identity={
                'type': 'SystemAssigned'
            },
            opts=ResourceOptions(parent=self))

        # Obtaining the kubeconfig from an Azure K8s cluster requires using the "list_managed_clsuter_user_credentials"
        # function.
        # That function requires passing values that are not be known until the resources are created.
        # Thus, the use of "apply()" to wait for those values before calling the function.
        creds = pulumi.Output.all(args.resource_group_name, k8s_cluster.name).apply(
            lambda args:
            containerservice.list_managed_cluster_user_credentials(
                resource_group_name=args[0],
                resource_name=args[1]))

        # The "list_managed_cluster_user_credentials" function returns an array of base64 encoded kubeconfigs.
        # So decode the kubeconfig for our cluster but mark it as a secret so Pulumi treats it accordingly.
        self.kubeconfig = pulumi.Output.secret(creds.kubeconfigs[0].value.apply(
            lambda enc: base64.b64decode(enc).decode()))
        ### End of Cluster Related Resources

        # End with this. It is used for display purposes.
        self.register_outputs({})
