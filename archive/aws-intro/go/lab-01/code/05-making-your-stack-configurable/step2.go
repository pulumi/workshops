package main

import (
    "mime"
    "path"
    "path/filepath"

    "github.com/pulumi/pulumi-aws/sdk/go/aws/s3"
    "github.com/pulumi/pulumi/sdk/go/pulumi"
    "github.com/pulumi/pulumi/sdk/go/pulumi/config"
)

func main() {
    pulumi.Run(func(ctx *pulumi.Context) error {
        conf := config.New(ctx, "")
        siteDir := conf.Get("siteDir")

        bucket, err := s3.NewBucket(ctx, "my-bucket", &s3.BucketArgs{
            Website: s3.BucketWebsiteArgs{
                IndexDocument: pulumi.String("index.html"),
            },
        })
        if err != nil {
            return err
        }

        bucketFile := filepath.Join(siteDir, "index.html")
        mimeType := mime.TypeByExtension(path.Ext(bucketFile))
        _, err = s3.NewBucketObject(ctx, "index.html", &s3.BucketObjectArgs{
            Bucket:      bucket.Bucket,
            Source:      pulumi.NewFileAsset(bucketFile),
            Acl:         pulumi.String("public-read"),
            ContentType: pulumi.String(mimeType),
        })

        ctx.Export("bucketName", bucket.Bucket)
        ctx.Export("bucketEndpoint", bucket.WebsiteEndpoint)

        return nil
    })
}
