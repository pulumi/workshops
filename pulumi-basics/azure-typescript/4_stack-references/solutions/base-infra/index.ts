import * as pulumi from "@pulumi/pulumi";
import * as insights from "@pulumi/azure-native/insights";
import * as resource from "@pulumi/azure-native/resources";
import * as sql from "@pulumi/azure-native/sql";
import * as web from "@pulumi/azure-native/web";

import {StorageInfra} from "./storage-infra";

import {baseName, username, pwd} from "./config";

const resourceGroup = new resource.ResourceGroup(`${baseName}-rg`);

const storageInfra = new StorageInfra(baseName, {
    resourceGroupName: resourceGroup.name
})

const appServicePlan = new web.AppServicePlan(`${baseName}-asp`, {
    resourceGroupName: resourceGroup.name,
    kind: "App",
    sku: {
        name: "B1",
        tier: "Basic",
    },
});

const appInsights = new insights.Component(`${baseName}-ai`, {
    resourceGroupName: resourceGroup.name,
    kind: "web",
    applicationType: insights.ApplicationType.Web,
});

const sqlServer = new sql.Server(`${baseName}-sql`, {
    resourceGroupName: resourceGroup.name,
    administratorLogin: username,
    administratorLoginPassword: pwd,
    version: "12.0",
});

const database = new sql.Database(`${baseName}-db`, {
    resourceGroupName: resourceGroup.name,
    serverName: sqlServer.name,
    sku: {
        name: "S0",
    },
});

export const dbUserName = username;
export const dbPassword = pwd;
export const storageAccountKey = storageInfra.storageKey;
export const resourceGroupName = resourceGroup.name;
export const storageAccountName = storageInfra.storageAccountName;
export const storageContainerName = storageInfra.storageContainerName;
export const appServicePlanId = appServicePlan.id;
export const appInsightsInstrumentationKey = appInsights.instrumentationKey;
export const sqlConnectionString = pulumi.interpolate`Server=tcp:${sqlServer.name}.database.windows.net;initial catalog=${database.name};user ID=${username};password=${pwd};Min Pool Size=0;Max Pool Size=30;Persist Security Info=true;`;
