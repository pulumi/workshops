using Pulumi;
using Pulumi.AzureNative.Resources;
using System.Collections.Generic;

class Ex0_StackBasics: Stack
{
    public Ex0_StackBasics()
    {
      // Create an Azure Resource Group
      var resourceGroup = new ResourceGroup("resourceGroup");
    }
}