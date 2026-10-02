using Pulumi;
using Pulumi.AzureNative.Resources;

class StackBasics: Stack
{
    public StackBasics()
    {
      // Create an Azure Resource Group
      var resourceGroup = new ResourceGroup("resourceGroup");
    }
}