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

    ctx.export("webAppUrl", Output.format("https://%s", webApp.defaultHostName()));
  }
}