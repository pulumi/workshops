using System.IO;
using Pulumi;
using Pulumi.Aws.S3;
using Pulumi.Aws.S3.Inputs;
using Aws = Pulumi.Aws;

class MyStack : Stack
{
    public MyStack()
    {
        var config = new Pulumi.Config();
        var siteDir = config.Get("siteDir");
        
        var bucket = new Aws.S3.Bucket("my-bucket", new BucketArgs
        {
            Website = new BucketWebsiteArgs
            {
                IndexDocument = "index.html",
            }
        });
        this.BucketName = bucket.BucketName;
        this.WebsiteEndpoint = bucket.WebsiteEndpoint;

        var bucketFile = Path.Combine(siteDir, "index.html");
        var bucketObject = new Aws.S3.BucketObject("index.html", new BucketObjectArgs
        {
            Bucket = bucket.BucketName,
            Source = new FileAsset(bucketFile),
            Acl = "public-read",
            ContentType = "text/html",
        });
    }

    [Output] public Output<string> BucketName { get; set; }
    [Output] public Output<string> WebsiteEndpoint { get; set; }
}
