using System.IO;
using Pulumi;
using Pulumi.Aws.S3;
using Aws = Pulumi.Aws;

class MyStack : Stack
{
    public MyStack()
    {
        var bucket = new Aws.S3.Bucket("my-bucket", new BucketArgs());
        this.BucketName = bucket.BucketName;

        var bucketFile = Path.Combine("site", "index.html");
        var bucketObject = new Aws.S3.BucketObject("index.html", new BucketObjectArgs
        {
            Bucket = bucket.BucketName,
            Source = new FileAsset(bucketFile)
        });
    }

    [Output] public Output<string> BucketName { get; set; }
}
