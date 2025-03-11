"""An AWS Python Pulumi program"""

import pulumi
from pulumi_aws import s3

# Create an AWS resource (S3 Bucket)
bucket = s3.BucketV2('my-bucket')

with open("text.txt","r") as f:
    content = f.read()

obj = s3.BucketObject("my-text-file",
    bucket=bucket.id,
    content=content
    )

# Export the name of the bucket
pulumi.export('bucket_name', bucket.id)
