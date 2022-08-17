package main

import (
    "path/filepath"

    "github.com/pulumi/pulumi/sdk/go/pulumi"
    "github.com/pulumi/pulumi-aws/sdk/go/aws/s3"
)

func main() {
    pulumi.Run(func(ctx *pulumi.Context) error {

        bucket, err := s3.NewBucket(ctx, "my-bucket", nil)
        if err != nil {
            return err
        }

        bucketFile := filepath.Join("site", "index.html")
        _, err = s3.NewBucketObject(ctx, "index.html", &s3.BucketObjectArgs{
            Bucket: bucket.Bucket,
            Source: pulumi.NewFileAsset(bucketFile),
        })

        ctx.Export("bucketName", bucket.Bucket)

        return nil
    })
}
