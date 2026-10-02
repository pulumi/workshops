using Pulumi;
using Pulumi.AzureNative.Storage;
using Pulumi.AzureNative.Storage.Inputs;

class Ex1StorageInfraArgs
{
    public Input<string> ResourceGroupName { get; set; } = null!;
}

class Ex1StorageInfra: Pulumi.ComponentResource
{
    public Output<string> StorageAccountName;
    public Output<string> StorageContainerName;
    public Output<string> StorageBlobName;
    public Output<string> CodeBlobUrl;

    public Ex1StorageInfra(string name, Ex1StorageInfraArgs args, ComponentResourceOptions? opts = null)
        : base("custom:x:StorageInfra", name, opts)
    {
        var storageAccount = new StorageAccount($"{name}sa", new StorageAccountArgs
        {
            ResourceGroupName = args.ResourceGroupName,
            Kind = "StorageV2",
            Sku = new SkuArgs
            {
                Name = SkuName.Standard_LRS,
            },
        }, new CustomResourceOptions { Parent = this });

        this.StorageAccountName = storageAccount.Name;
        
        var container = new BlobContainer("zips", new BlobContainerArgs
        {
            AccountName = storageAccount.Name,
            PublicAccess = PublicAccess.None,
            ResourceGroupName = args.ResourceGroupName,
        }, new CustomResourceOptions { Parent = this });

        this.StorageContainerName = container.Name;

        var blob = new Blob($"{name}-appservice-blob", new BlobArgs
        {
            ResourceGroupName = args.ResourceGroupName,
            AccountName = storageAccount.Name,
            ContainerName = container.Name,
            Type = BlobType.Block,
            Source = new FileArchive("wwwroot"),
        }, new CustomResourceOptions { Parent = this });

        this.StorageBlobName = blob.Name;

        this.CodeBlobUrl = SignedBlobReadUrl(blob, container, storageAccount, args.ResourceGroupName);
    }

    private static Output<string> SignedBlobReadUrl(Blob blob, BlobContainer container, StorageAccount account, Input<string> ResourceGroupName)
    {
        var serviceSasToken = ListStorageAccountServiceSAS.Invoke(new ListStorageAccountServiceSASInvokeArgs
        {
            AccountName = account.Name,
            Protocols = HttpProtocol.Https,
            SharedAccessStartTime = "2021-01-01",
            SharedAccessExpiryTime = "2030-01-01",
            Resource = SignedResource.C,
            ResourceGroupName = ResourceGroupName,
            Permissions = Permissions.R,
            CanonicalizedResource = Output.Format($"/blob/{account.Name}/{container.Name}"),
            ContentType = "application/json",
            CacheControl = "max-age=5",
            ContentDisposition = "inline",
            ContentEncoding = "deflate",
        }).Apply(blobSAS => blobSAS.ServiceSasToken);

        return Output.Format($"https://{account.Name}.blob.core.windows.net/{container.Name}/{blob.Name}?{serviceSasToken}");
    }
}