# Deploy to Azure App Service

In the previous lab, we deployed our static HTML files to Azure Storage.

In the third lab of this workshop, we're going to deploy Nginx to Azure App Service.

## Step 1 &mdash; Create an App Service Plan

We need to add an [App Service Plan](https://docs.microsoft.com/en-us/azure/app-service/overview-hosting-plans) to our resourceGroup. Before we do that, we need to add an additional import.

Add the following to the top of your `App.java` with your other imports:

```java
import com.pulumi.azurenative.web.AppServicePlan;
import com.pulumi.azurenative.web.AppServicePlanArgs;
import com.pulumi.azurenative.web.inputs.SkuDescriptionArgs;
```

Then, add the following to your `App.java`:

```java
var plan = new AppServicePlan("plan", AppServicePlanArgs.builder()
        .resourceGroupName(resourceGroup.name())
        .kind("Linux")
        .reserved(true)
        .sku(SkuDescriptionArgs.builder()
                .name("B1")
                .tier("Basic")
                .build())
        .build());
```

At this stage, your `App.java` file should look like this:

```java
package myproject;

import com.pulumi.Pulumi;
import com.pulumi.azurenative.resources.ResourceGroup;
import com.pulumi.azurenative.storage.StorageAccount;
import com.pulumi.azurenative.storage.StorageAccountArgs;
import com.pulumi.azurenative.storage.enums.Kind;
import com.pulumi.azurenative.storage.enums.SkuName;
import com.pulumi.azurenative.storage.inputs.SkuArgs;
import com.pulumi.azurenative.storage.StorageAccountStaticWebsite;
import com.pulumi.azurenative.storage.StorageAccountStaticWebsiteArgs;
import com.pulumi.azurenative.storage.Blob;
import com.pulumi.azurenative.storage.BlobArgs;
import com.pulumi.asset.FileAsset;
import com.pulumi.azurenative.web.AppServicePlan;
import com.pulumi.azurenative.web.AppServicePlanArgs;
import com.pulumi.azurenative.web.inputs.SkuDescriptionArgs;

public class App {
    public static void main(String[] args) {
        Pulumi.run(ctx -> {
            var resourceGroup = new ResourceGroup("app");

            var storageAccount = new StorageAccount("app", StorageAccountArgs.builder()
                    .enableHttpsTrafficOnly(true)
                    .kind(Kind.StorageV2)
                    .resourceGroupName(resourceGroup.name())
                    .sku(SkuArgs.builder()
                            .name(SkuName.Standard_LRS)
                            .build())
                    .build());

            var staticWebsite = new StorageAccountStaticWebsite("app", StorageAccountStaticWebsiteArgs.builder()
                    .accountName(storageAccount.name())
                    .resourceGroupName(resourceGroup.name())
                    .indexDocument("index.html")
                    .error404Document("404.html")
                    .build());

            for (var file : new String[] { "index.html", "404.html" }) {
                new Blob(file, BlobArgs.builder()
                        .resourceGroupName(resourceGroup.name())
                        .accountName(storageAccount.name())
                        .containerName(staticWebsite.containerName())
                        .source(new FileAsset("../wwwroot/" + file))
                        .contentType("text/html")
                        .build());
            }

            ctx.export("url", storageAccount.primaryEndpoints().applyValue(x -> x.web()));

            var plan = new AppServicePlan("plan", AppServicePlanArgs.builder()
                    .resourceGroupName(resourceGroup.name())
                    .kind("Linux")
                    .reserved(true)
                    .sku(SkuDescriptionArgs.builder()
                            .name("B1")
                            .tier("Basic")
                            .build())
                    .build());
        });
    }
}
```

## Step 2 &mdash; Deploy your WebApp

Now, we need to deploy nginx. We'll use Azure's [Web App](https://azure.microsoft.com/en-us/services/app-service/web/) service for this.

Add the following to the top of your `App.java` with your other imports:

```java
import java.util.Arrays;
import com.pulumi.azurenative.web.WebApp;
import com.pulumi.azurenative.web.WebAppArgs;
import com.pulumi.azurenative.web.inputs.NameValuePairArgs;
import com.pulumi.azurenative.web.inputs.SiteConfigArgs;
```

Then, add the following to your `App.java`:

```java
var appSettings = Arrays.asList(
        NameValuePairArgs.builder()
                .name("WEBSITES_PORT")
                .value("80")
                .build(),
        NameValuePairArgs.builder()
                .name("DOCKER_REGISTRY_SERVER_URL")
                .value("https://hub.docker.com")
                .build());

var webApp = new WebApp("app", WebAppArgs.builder()
        .resourceGroupName(resourceGroup.name())
        .serverFarmId(plan.getId())
        .siteConfig(SiteConfigArgs.builder()
                .appSettings(appSettings)
                .alwaysOn(true)
                .linuxFxVersion("DOCKER|nginx")
                .build())
        .httpsOnly(true)
        .build());
```

At this stage, your `App.java` should look like this:

```java
package myproject;

import com.pulumi.Pulumi;
import com.pulumi.azurenative.resources.ResourceGroup;
import com.pulumi.azurenative.storage.StorageAccount;
import com.pulumi.azurenative.storage.StorageAccountArgs;
import com.pulumi.azurenative.storage.enums.Kind;
import com.pulumi.azurenative.storage.enums.SkuName;
import com.pulumi.azurenative.storage.inputs.SkuArgs;
import com.pulumi.azurenative.storage.StorageAccountStaticWebsite;
import com.pulumi.azurenative.storage.StorageAccountStaticWebsiteArgs;
import com.pulumi.azurenative.storage.Blob;
import com.pulumi.azurenative.storage.BlobArgs;
import com.pulumi.asset.FileAsset;
import com.pulumi.azurenative.web.AppServicePlan;
import com.pulumi.azurenative.web.AppServicePlanArgs;
import com.pulumi.azurenative.web.inputs.SkuDescriptionArgs;
import java.util.Arrays;
import com.pulumi.azurenative.web.WebApp;
import com.pulumi.azurenative.web.WebAppArgs;
import com.pulumi.azurenative.web.inputs.NameValuePairArgs;
import com.pulumi.azurenative.web.inputs.SiteConfigArgs;

public class App {
    public static void main(String[] args) {
        Pulumi.run(ctx -> {
            var resourceGroup = new ResourceGroup("app");

            var storageAccount = new StorageAccount("app", StorageAccountArgs.builder()
                    .enableHttpsTrafficOnly(true)
                    .kind(Kind.StorageV2)
                    .resourceGroupName(resourceGroup.name())
                    .sku(SkuArgs.builder()
                            .name(SkuName.Standard_LRS)
                            .build())
                    .build());

            var staticWebsite = new StorageAccountStaticWebsite("app", StorageAccountStaticWebsiteArgs.builder()
                    .accountName(storageAccount.name())
                    .resourceGroupName(resourceGroup.name())
                    .indexDocument("index.html")
                    .error404Document("404.html")
                    .build());

            for (var file : new String[] { "index.html", "404.html" }) {
                new Blob(file, BlobArgs.builder()
                        .resourceGroupName(resourceGroup.name())
                        .accountName(storageAccount.name())
                        .containerName(staticWebsite.containerName())
                        .source(new FileAsset("../wwwroot/" + file))
                        .contentType("text/html")
                        .build());
            }

            ctx.export("url", storageAccount.primaryEndpoints().applyValue(x -> x.web()));

            var plan = new AppServicePlan("plan", AppServicePlanArgs.builder()
                    .resourceGroupName(resourceGroup.name())
                    .kind("Linux")
                    .reserved(true)
                    .sku(SkuDescriptionArgs.builder()
                            .name("B1")
                            .tier("Basic")
                            .build())
                    .build());

            var appSettings = Arrays.asList(
                    NameValuePairArgs.builder()
                            .name("WEBSITES_PORT")
                            .value("80")
                            .build(),
                    NameValuePairArgs.builder()
                            .name("DOCKER_REGISTRY_SERVER_URL")
                            .value("https://hub.docker.com")
                            .build());

            var webApp = new WebApp("app", WebAppArgs.builder()
                    .resourceGroupName(resourceGroup.name())
                    .serverFarmId(plan.getId())
                    .siteConfig(SiteConfigArgs.builder()
                            .appSettings(appSettings)
                            .alwaysOn(true)
                            .linuxFxVersion("DOCKER|nginx")
                            .build())
                    .httpsOnly(true)
                    .build());
        });
    }
}
```

## Step 4 &mdash; Run `pulumi up`

Now we've defined our web app, we can again use the Pulumi CLI to create the resources.

Run `pulumi up` within your project directory. You should see something like this:

```bash
$ pulumi up
Previewing update (dev)

View Live: https://app.pulumi.com/jkodroff/my-first-azure-app/dev/previews/c0322dec-b075-45c8-afa9-b1a414ca74e0

     Type                                Name                    Plan
     pulumi:pulumi:Stack                 my-first-azure-app-dev
 +   ├─ azure-native:web:AppServicePlan  plan                    create
 +   └─ azure-native:web:WebApp          app                     create

Resources:
    + 2 to create
    6 unchanged

Do you want to perform this update?  [Use arrows to move, enter to select, type to filter]
  yes
> no
  details
```

Notice that the existing infrastructure (i.e. our static site in our bucket) remains unchanged. Let's deploy this by selecting "yes" and hitting return.

## Step 4 &mdash; Export the URL

Like our static site before it, we need to export the URL so we can view our site. Let's do this now.

Add the following to the top of your `App.java` with your other imports:

```java
import com.pulumi.core.Output;
```

Add the following to the bottom of your `App.java`:

```java
ctx.export("webAppUrl", Output.format("https://%s", webApp.defaultHostName()));
```

Rerun `pulumi up` and you'll see a new output, something like:

```bash
Outputs:
  + webAppUrl: "https://app8570cf33.azurewebsites.net"
```

Check out the result!

```bash
$ curl $(pulumi stack output webAppUrl)

<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```

The final version of your code should look like [App.java](App.java).

## Step 5 &mdash; Cleaning up

Whenever you're working on learning with Pulumi, it's always a good idea to clean up any resources you've created so you don't get charged.

Let's clean up.

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

Now your resources should all be deleted! That last comment you see in the output notes that the stack and all of the configuration and history will stay in your dashboard on the Pulumi Service ([app.pulumi.com](https://app.pulumi.com/)).

If you want to completely remove the project and its history, run `pulumi stack rm dev`.
