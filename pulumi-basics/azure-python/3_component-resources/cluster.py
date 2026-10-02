# A component resource module shell 
# See comments below for help

from pulumi import ComponentResource, ResourceOptions

class ClusterArgs:
    def __init__(self,
                 # name the arguments and their types (e.g. str, bool, etc)
                 parameter1:type,
                 parameter2:type):

        # Set the class args
        self.parameter1 = parameter1
        self.parameter2 = parameter2

class Cluster(ComponentResource):
    def __init__(self,
                 name: str,
                 args: ClusterArgs,
                 opts: ResourceOptions = None):

        # Leave this line. You can modify 'custom:resource:Cluster' if you want
        super().__init__('custom:resource:Cluster', name, {}, opts)

        # Create the resources. 
        # Be sure to set a ResourceOption(parent=self) and prefix anything you want to return as an output with "self."
        # Example:
        # resource_group = resources.ResourceGroup('rg', opts=ResourceOptions(parent=self))
        # self.rg_name = resource_group.name


        # End with this. It is used for display purposes.
        self.register_outputs({})
