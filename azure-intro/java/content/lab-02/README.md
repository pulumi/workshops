# Deploy a Static Website

In the second lab of this workshop, we're going to create a website using [static website hosting in Azure Storage](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website).

## Step 1 &mdash; Create a Resource Group

We'll first create an Azure resource group, which will be used for all the other resources we're going to provision. Add the following to your imports at the top of your `App.java` file like so:

```java
import com.pulumi.azurenative.resources.ResourceGroup;
```

Next, create your Resource Group. In Pulumi, this action is done by generating a new object within the `Pulumi.run()` lambda, and assigning the resourceGroup resource to that constant, like so:

```java
var resourceGroup = new ResourceGroup("app");
```

At this stage, your complete `App.java` file should match this code:

```java
package myproject;

import com.pulumi.Pulumi;
import com.pulumi.azurenative.resources.ResourceGroup;

public class App {
    public static void main(String[] args) {
        Pulumi.run(ctx -> {
            var resourceGroup = new ResourceGroup("app");
        });
    }
}
```

## Step 2 &mdash; Create a Storage Account

Now we have the resource group created, we can now add an Azure storage account to store our HTML content for our static site.

We'll need to import the storage account resource first, so add the following to your imports, near the top of your `App.java`:

```java
import com.pulumi.azurenative.storage.StorageAccount;
import com.pulumi.azurenative.storage.StorageAccountArgs;
import com.pulumi.azurenative.storage.enums.Kind;
import com.pulumi.azurenative.storage.enums.SkuName;
import com.pulumi.azurenative.storage.inputs.SkuArgs;
```

Now we can use this import to create a storage account:

```java
var storageAccount = new StorageAccount("app", StorageAccountArgs.builder()
        .enableHttpsTrafficOnly(true)
        .kind(Kind.StorageV2)
        .resourceGroupName(resourceGroup.name())
        .sku(SkuArgs.builder()
                .name(SkuName.Standard_LRS)
                .build())
        .build());
```

Notice a couple of things in the code we just wrote:

1. We use the name of the resource group we created (`resourceGroup.name()`, a Pulumi output) as an input to the storage account we created. This allows the Pulumi engine to know that our resource group must be created before our storage account, and that any changes to the name of the resource group name must also be applied to the storage account. For more information, see [Inputs and Outputs](https://www.pulumi.com/docs/intro/concepts/inputs-outputs/).
1. We can use Pulumi's enums to populate values without needing to look up the allowed values in the docs.

## Step 3 &mdash; Create your Static Website

Now we need to add a new resource, a `StorageAccountStaticWebsite`. This process is similar to before, so let's populate this resource.

First, we need to add the following imports:

```java
import com.pulumi.azurenative.storage.StorageAccountStaticWebsite;
import com.pulumi.azurenative.storage.StorageAccountStaticWebsiteArgs;
```

Add the following to your `App.java`:

```java
var staticWebsite = new StorageAccountStaticWebsite("app", StorageAccountStaticWebsiteArgs.builder()
        .accountName(storageAccount.name())
        .resourceGroupName(resourceGroup.name())
        .indexDocument("index.html")
        .error404Document("404.html")
        .build());
```

## Step 4 &mdash; Upload your Static Files

Our final step for our static website is to upload some files to it. In the previous step, we added a `StorageAccountStaticWebsite`. We can now upload some files to this using the container property.

Again, we'll again need to add some imports first:

```java
import com.pulumi.azurenative.storage.Blob;
import com.pulumi.azurenative.storage.BlobArgs;
import com.pulumi.asset.FileAsset;
```

Because we're writing our infrastructure using Pulumi, which in turn uses real programming languages, we can use familiar mechanisms like loops, so let's loop through all the files in our sample app and upload them.

Add the following to your `App.java` file:

```java
for (var file : new String[] { "index.html", "404.html" }) {
    new Blob(file, BlobArgs.builder()
            .resourceGroupName(resourceGroup.name())
            .accountName(storageAccount.name())
            .containerName(staticWebsite.containerName())
            .source(new FileAsset("../wwwroot/" + file))
            .contentType("text/html")
            .build());
}
```

At this stage, your `App.java` file should match this:

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
        });
    }
}
```

## Step 4 &mdash; Deploy our infrastructure with `pulumi up`

Now we've defined our infrastructure, we use the Pulumi CLI to create the resources.

Run `pulumi up` in your project directory, which results in output similar to the following:

```bash
$ pulumi up
Previewing update (dev)

View Live: https://app.pulumi.com/jaxxstorm/my-first-azure-app/dev/previews/0978b65c-1918-43eb-8969-68540516660c

     Type                                                 Name                    Plan
 +   pulumi:pulumi:Stack                                  my-first-azure-app-dev  create
 +   ├─ azure-native:resources:ResourceGroup              app                     create
 +   ├─ azure-native:storage:StorageAccount               app                     create
 +   ├─ azure-native:storage:StorageAccountStaticWebsite  app                     create
 +   ├─ azure-native:storage:Blob                         404.html                create
 +   └─ azure-native:storage:Blob                         index.html              create

Resources:
    + 6 to create

Do you want to perform this update?  [Use arrows to move, enter to select, type to filter]
  yes
> no
  details
```

You can examine the details of the resources that will be created. When you're happy, move the arrow to `yes` and watch as Pulumi creates your resources!

## Step 4 &mdash; Export the URL

We provisioned our infrastructure, but we don't actually know where it is. We can `export` values from our Pulumi stack so we can see the resolved `Output`.

Add the following to the bottom of your `App.java`:

```java
ctx.export("url", storageAccount.primaryEndpoints().applyValue(x -> x.web()));
```

Rerun your `pulumi up` and you'll see a new field:

```text
Outputs:
    url: "https://app793a46fd.z22.web.core.windows.net/"
```

Check out the website!

```bash
curl $(pulumi stack output url)
```

## Next Steps

* [Deploy to Azure App Service](../lab-03/README.md)
