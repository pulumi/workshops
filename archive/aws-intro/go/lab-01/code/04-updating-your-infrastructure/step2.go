package main

import (
    "mime"
    "path"
    "path/filepath"

    "github.com/pulumi/pulumi-aws/sdk/go/aws/s3"
    "github.com/pulumi/pulumi/sdk/go/pulumi"
)

func main() {
    pulumi.Run(func(ctx *pulumi.Context) error {

        bucket, err := s3.NewBucket(ctx, "my-bucket", &s3.BucketArgs{
            Website: s3.BucketWebsiteArgs{
                IndexDocument: pulumi.String("index.html"),
            },
        })
        if err != nil {
            return err
        }

        bucketFile := filepath.Join("site", "index.html")
        _, err = s3.NewBucketObject(ctx, "index.html", &s3.BucketObjectArgs{
            Bucket:      bucket.Bucket,
            Source:      pulumi.NewFileAsset(bucketFile),
            Acl:         pulumi.String("public-read"),
            ContentType: pulumi.String(mime.TypeByExtension(path.Ext(bucketFile))),
        })

        ctx.Export("bucketName", bucket.Bucket)
        ctx.Export("bucketEndpoint", bucket.WebsiteEndpoint)

        return nil
    })
}
