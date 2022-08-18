from pulumi_aws import s3

bucket = s3.Bucket(
    "my-website-bucket",
    website=s3.BucketWebsiteArgs(
        index_document="index.html",
    ),
)
