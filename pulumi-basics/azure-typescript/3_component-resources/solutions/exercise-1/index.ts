import * as insights from "@pulumi/azure-native/insights";
import * as resource from "@pulumi/azure-native/resources";
import * as sql from "@pulumi/azure-native/sql";
import * as storage from "@pulumi/azure-native/storage";
import * as web from "@pulumi/azure-native/web";
import * as pulumi from "@pulumi/pulumi";

// Exercise 1 //
import {StorageInfra, StorageInfraArgs} from "./storage-infra";
// Exercise 1 //

import {baseName, username, pwd} from "./config";
import {getSASToken} from "./utilities"

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

const blob = new storage.Blob(`${baseName}-blob`, {
    resourceGroupName: resourceGroup.name,
    accountName: storageInfra.storageAccountName,
    containerName: storageInfra.storageContainerName,
    source: new pulumi.asset.FileArchive("wwwroot"),
});

const codeBlobUrl = getSASToken(storageInfra.storageAccountName, storageInfra.storageContainerName, blob.name, resourceGroup.name);

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

const app = new web.WebApp(`${baseName}-webapp`, {
    resourceGroupName: resourceGroup.name,
    serverFarmId: appServicePlan.id,
    siteConfig: {
        appSettings: [
            {
                name: "APPINSIGHTS_INSTRUMENTATIONKEY",
                value: appInsights.instrumentationKey,
            },
            {
                name: "APPLICATIONINSIGHTS_CONNECTION_STRING",
                value: pulumi.interpolate`InstrumentationKey=${appInsights.instrumentationKey}`,
            },
            {
                name: "ApplicationInsightsAgent_EXTENSION_VERSION",
                value: "~2",
            },
            {
                name: "WEBSITE_RUN_FROM_PACKAGE",
                value: codeBlobUrl,
            },
        ],
        connectionStrings: [{
            name: "db",
            connectionString:
                pulumi.all([sqlServer.name, database.name]).apply(([server, db]) =>
                    `Server=tcp:${server}.database.windows.net;initial catalog=${db};user ID=${username};password=${pwd};Min Pool Size=0;Max Pool Size=30;Persist Security Info=true;`),
            type: web.ConnectionStringType.SQLAzure,
        }],
    },
});

export const dbUserName = username;
export const dbPassword = pwd;
export const storageAccountKey = storageInfra.storageKey;
export const appHostName = app.defaultHostName;
export const url = pulumi.interpolate`https://${appHostName}`
