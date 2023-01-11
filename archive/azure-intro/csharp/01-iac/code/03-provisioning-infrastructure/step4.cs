using Pulumi;
using Azure = Pulumi.AzureNative;
using Pulumi.AzureNative.Resources;

class MyStack : Stack
{
    public MyStack()
    {
        // Add your resources here
        // Create an Azure Resource Group
        var resourceGroup = new ResourceGroup("myrgroup");
        // Export the resource group name
        this.resourcegroupname = resourceGroup.Name;
    }

    // Add Outputs here
    [Output("resourcegroup_name")] public Output<string> resourcegroup_name { get; set; }
}
