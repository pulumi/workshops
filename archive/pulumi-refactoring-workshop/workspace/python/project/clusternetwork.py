import pulumi
from pulumi_azure_native import network

class ClusterNetworkArgs:
    def __init__(
        self,
        resource_group_name: pulumi.Input[str],
        vnet_cidr: pulumi.Input[str],
        subnet_cidr: pulumi.Input[str],
    ):
        self.vnet_cidr = vnet_cidr
        self.subnet_cidr = subnet_cidr
        self.resource_group_name = resource_group_name
        
class ClusterNetwork(pulumi.ComponentResource):
    vnet: network.VirtualNetwork
    subnet: network.Subnet

    def __init__(self, name: str, args: ClusterNetworkArgs, opts: pulumi.ResourceOptions = None):
        super().__init__("cluster:index:Network", name, {}, opts)
        
    # Code goes here
        
        
    self.register_outputs({})