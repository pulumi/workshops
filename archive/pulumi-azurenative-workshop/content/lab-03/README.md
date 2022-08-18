# Deploy to Azure App Service

In the previous lab, we deployed our static HTML files.

In the third lab of this workshop, we're going to deploy the same HTML to Azure App Service Using Docker. We'll build the Docker image using Pulumi, and upload it to an Azure container registry.

## Step 1 &mdash; Create an App Service Plan

We need to add an [App Service Plan](https://docs.microsoft.com/en-us/azure/app-service/overview-hosting-plans) to our resourceGroup. Before we do that, we need to add an additional import.

Add the following to the top of your `index.ts` with your other imports:

```typescript
import * as web from "@pulumi/azure-native/web";
```

Then, add the following to your `index.ts`:

```typescript
const plan = new web.AppServicePlan("plan", {
    resourceGroupName: resourceGroup.name,
    kind: "Linux",
    reserved: true,
    sku: {
        name: "B1",
        tier: "Basic",
    },
});
```

> At this stage, your `index.ts` file should look like this:

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as storage from "@pulumi/azure-native/storage";
import * as web from "@pulumi/azure-native/web";

const resourceGroup = new resources.ResourceGroup("app");

const storageAccount = new storage.StorageAccount("app", {
  enableHttpsTrafficOnly: true,
  kind: storage.Kind.StorageV2,
  resourceGroupName: resourceGroup.name,
  sku: {
    name: storage.SkuName.Standard_LRS,
  },
});

const staticWebsite = new storage.StorageAccountStaticWebsite("app", {
  accountName: storageAccount.name,
  resourceGroupName: resourceGroup.name,
  indexDocument: "index.html",
  error404Document: "404.html",
});

["index.html", "404.html"].map(
  (name) =>
    new storage.Blob(name, {
      resourceGroupName: resourceGroup.name,
      accountName: storageAccount.name,
      containerName: staticWebsite.containerName,
      source: new pulumi.asset.FileAsset(`../wwwroot/${name}`),
      contentType: "text/html",
    })
);

// Web endpoint to the website
export const url = storageAccount.primaryEndpoints.web;

const plan = new web.AppServicePlan("plan", {
    resourceGroupName: resourceGroup.name,
    kind: "Linux",
    reserved: true,
    sku: {
        name: "B1",
        tier: "Basic",
    },
});

```

## Step 2 &mdash; Add a Container Registry

Now, we need to build a Docker container. One has already been defined for your in the `../wwwroot` directory. We can define a container registry to store our Docker image first. Add the following to your `index.ts`:

```typescript
// Add this to your imports
import * as containerregistry from "@pulumi/azure-native/containerregistry";

const registry = new containerregistry.Registry("registry", {
    resourceGroupName: resourceGroup.name,
    sku: {
        name: "Basic",
    },
    adminUserEnabled: true,
})
```

Now, we need to retrieve our credentials from this created registry. We need to only grab these credentials once the registry has been created. Pulumi has a mechanism for this, an `apply()` call. We can chain multiple `apply()` calls with `.all()`. Add the following to your `index.ts`:

```typescript
// grab the registry credentials using `listRegistryCredentials
const credentials = pulumi.all([resourceGroup.name, registry.name]).apply(
    ([resourceGroupName, registryName]) => containerregistry.listRegistryCredentials({
        resourceGroupName: resourceGroupName,
        registryName: registryName,
}));

// assign the retrieved values to constants once they are resolved
const adminUsername = credentials.apply(credentials => credentials.username!);
const adminPassword = credentials.apply(credentials => credentials.passwords![0].value!);
```

> At this stage, your `index.ts` file should look like this:

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as storage from "@pulumi/azure-native/storage";
import * as web from "@pulumi/azure-native/web";
import * as containerregistry from "@pulumi/azure-native/containerregistry";

const resourceGroup = new resources.ResourceGroup("app");

const storageAccount = new storage.StorageAccount("app", {
  enableHttpsTrafficOnly: true,
  kind: storage.Kind.StorageV2,
  resourceGroupName: resourceGroup.name,
  sku: {
    name: storage.SkuName.Standard_LRS,
  },
});

const staticWebsite = new storage.StorageAccountStaticWebsite("app", {
  accountName: storageAccount.name,
  resourceGroupName: resourceGroup.name,
  indexDocument: "index.html",
  error404Document: "404.html",
});

["index.html", "404.html"].map(
  (name) =>
    new storage.Blob(name, {
      resourceGroupName: resourceGroup.name,
      accountName: storageAccount.name,
      containerName: staticWebsite.containerName,
      source: new pulumi.asset.FileAsset(`../wwwroot/${name}`),
      contentType: "text/html",
    })
);

// Web endpoint to the website
export const url = storageAccount.primaryEndpoints.web;

const plan = new web.AppServicePlan("plan", {
    resourceGroupName: resourceGroup.name,
    kind: "Linux",
    reserved: true,
    sku: {
        name: "B1",
        tier: "Basic",
    },
});

const registry = new containerregistry.Registry("registry", {
    resourceGroupName: resourceGroup.name,
    sku: {
        name: "Basic",
    },
    adminUserEnabled: true,
})

// grab the registry credentials using `listRegistryCredentials
const credentials = pulumi.all([resourceGroup.name, registry.name]).apply(
    ([resourceGroupName, registryName]) => containerregistry.listRegistryCredentials({
        resourceGroupName: resourceGroupName,
        registryName: registryName,
}));

// assign the retrieved values to constants once they are resolved
const adminUsername = credentials.apply(credentials => credentials.username!);
const adminPassword = credentials.apply(credentials => credentials.passwords![0].value!);
```

## Step 3 &mdash; Build and Push your Docker Image

Now your registry to store your docker image exists, we need to build our image and push to this registry. First, we'll need to add a new provider, the [Docker Provider](https://www.pulumi.com/docs/intro/cloud-providers/docker/). We do this using the same mechanism we used for the Azure provider earlier, using `npm`:

```bash
npm install @pulumi/docker
```

Then, add the following to your imports:

```typescript
import * as docker from "@pulumi/docker";
```

And finally for this step, define your Docker image resource:

```typescript
const image = new docker.Image("app", {
    imageName: pulumi.interpolate`${registry.loginServer}/app:latest`,
    build: { context: `../wwwroot` },
    registry: {
        server: registry.loginServer,
        username: adminUsername,
        password: adminPassword,
    },
});
```

## Step 4 &mdash; Deploy your WebApp

Now, we need to actually deploy this Docker container. We'll use Azure's [Web App](https://azure.microsoft.com/en-us/services/app-service/web/) service for this.

Our final import will be the web resource. Add the following to your imports:

```typescript
import * as web from "@pulumi/azure-native/web";
```

And then define your webapp, like so:

```typescript
const app = new web.WebApp("app", {
    resourceGroupName: resourceGroup.name,
    serverFarmId: plan.id,
    siteConfig: {
        appSettings: [
            {
                name: "DOCKER_REGISTRY_SERVER_URL",
                value: pulumi.interpolate`https://${registry.loginServer}`,
            },
            {
                name: "DOCKER_REGISTRY_SERVER_USERNAME",
                value: adminUsername,
            },
            {
                name: "DOCKER_REGISTRY_SERVER_PASSWORD",
                value: adminPassword,
            },
            {
                name: "WEBSITES_PORT",
                value: "80", // Our custom image exposes port 80. Adjust for your app as needed.
            },
        ],
        alwaysOn: true,
        linuxFxVersion: pulumi.interpolate`DOCKER|${image.imageName}`,
    },
    httpsOnly: true,
});
```

> At this stage, your `index.ts` should look like this:

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

import * as resources from "@pulumi/azure-native/resources";
import * as storage from "@pulumi/azure-native/storage";
import * as web from "@pulumi/azure-native/web";
import * as containerregistry from "@pulumi/azure-native/containerregistry";

const resourceGroup = new resources.ResourceGroup("app");

const storageAccount = new storage.StorageAccount("app", {
  enableHttpsTrafficOnly: true,
  kind: storage.Kind.StorageV2,
  resourceGroupName: resourceGroup.name,
  sku: {
    name: storage.SkuName.Standard_LRS,
  },
});

const staticWebsite = new storage.StorageAccountStaticWebsite("app", {
  accountName: storageAccount.name,
  resourceGroupName: resourceGroup.name,
  indexDocument: "index.html",
  error404Document: "404.html",
});

["index.html", "404.html"].map(
  (name) =>
    new storage.Blob(name, {
      resourceGroupName: resourceGroup.name,
      accountName: storageAccount.name,
      containerName: staticWebsite.containerName,
      source: new pulumi.asset.FileAsset(`../wwwroot/${name}`),
      contentType: "text/html",
    })
);

// Web endpoint to the website
export const url = storageAccount.primaryEndpoints.web;

const plan = new web.AppServicePlan("plan", {
    resourceGroupName: resourceGroup.name,
    kind: "Linux",
    reserved: true,
    sku: {
        name: "B1",
        tier: "Basic",
    },
});

const registry = new containerregistry.Registry("registry", {
    resourceGroupName: resourceGroup.name,
    sku: {
        name: "Basic",
    },
    adminUserEnabled: true,
})

// grab the registry credentials using `listRegistryCredentials
const credentials = pulumi.all([resourceGroup.name, registry.name]).apply(
    ([resourceGroupName, registryName]) => containerregistry.listRegistryCredentials({
        resourceGroupName: resourceGroupName,
        registryName: registryName,
}));

// assign the retrieved values to constants once they are resolved
const adminUsername = credentials.apply(credentials => credentials.username!);
const adminPassword = credentials.apply(credentials => credentials.passwords![0].value!);

const image = new docker.Image("app", {
    imageName: pulumi.interpolate`${registry.loginServer}/app:latest`,
    build: { context: `../wwwroot` },
    registry: {
        server: registry.loginServer,
        username: adminUsername,
        password: adminPassword,
    },
});

const app = new web.WebApp("app", {
    resourceGroupName: resourceGroup.name,
    serverFarmId: plan.id,
    siteConfig: {
        appSettings: [
            {
                name: "DOCKER_REGISTRY_SERVER_URL",
                value: pulumi.interpolate`https://${registry.loginServer}`,
            },
            {
                name: "DOCKER_REGISTRY_SERVER_USERNAME",
                value: adminUsername,
            },
            {
                name: "DOCKER_REGISTRY_SERVER_PASSWORD",
                value: adminPassword,
            },
            {
                name: "WEBSITES_PORT",
                value: "80", // Our custom image exposes port 80. Adjust for your app as needed.
            },
        ],
        alwaysOn: true,
        linuxFxVersion: pulumi.interpolate`DOCKER|${image.imageName}`,
    },
    httpsOnly: true,
});
```

## Step 4 &mdash; Run `pulumi up`

Now we've defined our webapp, we can again use the pulumi CLI to create the resources.

Run `pulumi up` within your project directory. You should see something like this:

```bash
pulumi up
Previewing update (dev)

View Live: https://app.pulumi.com/jaxxstorm/my-first-azure-app/dev/previews/a2c2c717-ac1d-4847-908c-3b820312a91f

     Type                                        Name                    Plan
     pulumi:pulumi:Stack                         my-first-azure-app-dev
 +   ├─ docker:image:Image                       app                     create
 +   ├─ azure-native:containerregistry:Registry  registry                create
 +   ├─ azure-native:web:AppServicePlan          plan                    create
 +   └─ azure-native:web:WebApp                  app                     create

Resources:
    + 4 to create
    6 unchanged

Do you want to perform this update?  [Use arrows to move, enter to select, type to filter]
  yes
> no
  details
```

You'll notice, the existing infrastructure (ie our static site in our bucket) remains unchanged. Let's deploy this but hitting yes

## Step 4 &mdash; Export the URL

Like our static site before it, we need to export the URL so we can examine our site. Let's do this now.

Add the following to the bottom of your `index.ts`:

```typescript
export const webAppUrl = pulumi.interpolate`https://${app.defaultHostName}`;
```

Rerun your `pulumi up` and you'll see a new field:

```
Outputs:
  + webAppUrl: "https://app8570cf33.azurewebsites.net"
```

Check out the result!

```
curl $(pulumi stack output webAppUrl)
```

## Step 5 &mdash; Cleaning up

Whenever you're working on learning something new with Pulumi, it's always a
good idea to clean up any resources you've created so you don't get charged on a
free tier or otherwise leave behind resources you'll never use. Let's clean up.

Run the `pulumi destroy` command to remove all of the resources:

```bash
$ pulumi destroy
Previewing destroy (dev)

View Live: https://app.pulumi.com/<org>/<project>/<stack>/previews/<build-id>

...
Do you want to perform this destroy? yes
Destroying (dev)

View Live: https://app.pulumi.com/<org>/<project>/<stack>/updates/<update-id>

...

The resources in the stack have been deleted, but the history and configuration associated with the stack are still maintained.
If you want to remove the stack completely, run 'pulumi stack rm dev'.
```

Now your resources should all be cleared! That last comment you see in the
output notes that the stack and all of the configuration and history will stay
in your dashboard on the Pulumi Service ([app.pulumi.com](https://app.pulumi.com/)).

If you want to completely remove the project and its history, r un `pulumi stack rm dev`.
