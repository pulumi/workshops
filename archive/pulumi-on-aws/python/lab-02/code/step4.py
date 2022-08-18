from pulumi_aws import s3

bucket = s3.Bucket(
    "my-website-bucket",
    website=s3.BucketWebsiteArgs(
        index_document="index.html",
    ),
)

content_dir = "www"
for file in os.listdir(content_dir):
    filepath = os.path.join(content_dir, file)
    mime_type, _ = mimetypes.guess_type(filepath)
    obj = s3.BucketObject(
        file,
        bucket=bucket.id,
        source=pulumi.FileAsset(filepath),
        content_type=mime_type,
        opts=pulumi.ResourceOptions(parent=bucket)
    )

bucket_policy = s3.BucketPolicy(
    "my-website-bucket-policy",
    bucket=bucket.id,
    policy=bucket.arn.apply(
        lambda arn:  json.dumps({
            "Version": "2012-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Principal": "*",
                "Action": [
                    "s3:GetObject"
                ],
                "Resource": [
                    f"{arn}/*"
                ]
            }]
        })),
    opts=pulumi.ResourceOptions(parent=bucket)
)

pulumi.export('website_url', bucket.website_endpoint)
