using Pulumi;
using Pulumi.Aws.S3;
using Aws = Pulumi.Aws;

class MyStack : Stack
{
    public MyStack()
    {
        var bucket = new Aws.S3.Bucket("my-bucket", new BucketArgs());
    }
}
