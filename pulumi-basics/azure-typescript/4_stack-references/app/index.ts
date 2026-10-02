import * as insights from "@pulumi/azure-native/insights";
import * as resource from "@pulumi/azure-native/resources";
import * as sql from "@pulumi/azure-native/sql";
import * as storage from "@pulumi/azure-native/storage";
import * as web from "@pulumi/azure-native/web";
import * as pulumi from "@pulumi/pulumi";

import {baseName} from "./config";
import {getSASToken} from "./utilities"

const blob = new storage.Blob(`${baseName}-blob`, {
    resourceGroupName: resourceGroupName,
    accountName: storageAccountName,
    containerName: storageContainerName,
    source: new pulumi.asset.FileArchive("wwwroot"),
});

const codeBlobUrl = getSASToken(storageAccountName, storageContainerName, blob.name, resourceGroupName);

const app = new web.WebApp(`${baseName}-webapp`, {
    resourceGroupName: resourceGroupName,
    serverFarmId: appServicePlanId,
    siteConfig: {
        appSettings: [
            {
                name: "APPINSIGHTS_INSTRUMENTATIONKEY",
                value: appInsightsInstrumentationKey,
            },
            {
                name: "APPLICATIONINSIGHTS_CONNECTION_STRING",
                value: pulumi.interpolate`InstrumentationKey=${appInsightsInstrumentationKey}`,
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
            connectionString: sqlConnectionString,
            type: web.ConnectionStringType.SQLAzure,
        }],
    },
});

export const appHostName = app.defaultHostName;
export const url = pulumi.interpolate`https://${appHostName}`
