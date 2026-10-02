import pathlib
import pulumi
from pulumi_aws import s3

# Create an AWS resource (S3 Bucket)
bucket = s3.Bucket('my-bucket')

pulumi.export("bucket_name", bucket.id)
pulumi.export("readme", pathlib.Path("README-stack.md").read_text())