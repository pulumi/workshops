using Pulumi;
using Pulumi.AzureNative.Resources;
using System.Collections.Generic;

class Ex2_StackBasics: Stack
{
    public Ex2_StackBasics()
    {

      // Exercise 2 //
      var config = new Config();
      var baseName = config.Require("baseName");
      // Exercise 2 //

      // Create an Azure Resource Group
      var resourceGroup = new ResourceGroup($"{baseName}-rg");

      // Export the resource group name
      this.rgName = resourceGroup.Name;
    }

    [Output("rgName")]
    public Output<string> rgName { get; set; }
}

