package main

import (
    "io/ioutil"
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

        // For each file in the directory, create an S3 object stored in `bucket`
        files, err := ioutil.ReadDir(siteDir)
        if err != nil {
            return err
        }
        for _, item := range files {
            name := item.Name()
            if _, err := s3.NewBucketObject(ctx, name, &s3.BucketObjectArgs{
                Bucket:      bucket.Bucket,                                       // reference to the s3.Bucket object
                Source:      pulumi.NewFileAsset(filepath.Join(siteDir, name)),   // use FileAsset to point to a file
                ContentType: pulumi.String(mime.TypeByExtension(path.Ext(name))), // set the MIME type of the file
                Acl:         pulumi.String("public-read"),
            }); err != nil {
                return err
            }
        }

        ctx.Export("bucketName", bucket.Bucket)
        ctx.Export("bucketEndpoint", bucket.WebsiteEndpoint)

        return nil
    })
}
