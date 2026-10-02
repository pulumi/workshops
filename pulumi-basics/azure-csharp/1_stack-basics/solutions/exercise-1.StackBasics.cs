using Pulumi;
using Pulumi.AzureNative.Resources;
using System.Collections.Generic;

class Ex1_StackBasics: Stack
{
    public Ex1_StackBasics()
    {
      // Create an Azure Resource Group
      var resourceGroup = new ResourceGroup("resourceGroup");

      // Export the resource group name
      this.rgName = resourceGroup.Name;
    }

    [Output("rgName")]
    public Output<string> rgName { get; set; }
}
