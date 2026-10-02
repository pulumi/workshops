import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";

// Exercise 2 //
const config = new pulumi.Config()
const baseName = config.require("baseName")
// Exercise 2 //

// Create an Azure Resource Group
// Exercise 2 //
const resourceGroup = new resources.ResourceGroup(`${baseName}-rg`, {
  // Exercise 3 //
  resourceGroupName: "mitch-rg-0527"
  // Exercise 3 //
});
// Exercise 2 //

// Exercise 1 //
export const resourceGroupName = resourceGroup.name;
// Exercise 1 //
