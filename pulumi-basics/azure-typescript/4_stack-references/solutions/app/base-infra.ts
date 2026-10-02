// Exercise 1 //
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

const stackName =  config.require("baseInfraStackName");
const stackRef = new pulumi.StackReference(stackName);
export const resourceGroupName = stackRef.requireOutput("resourceGroupName");
export const storageAccountName = stackRef.requireOutput("storageAccountName");
export const storageContainerName = stackRef.requireOutput("storageContainerName"); 
export const appServicePlanId = stackRef.requireOutput("appServicePlanId")
export const appInsightsInstrumentationKey = stackRef.requireOutput("appInsightsInstrumentationKey"); 
export const sqlConnectionString = stackRef.requireOutput("sqlConnectionString");
// Exercise 1 //
