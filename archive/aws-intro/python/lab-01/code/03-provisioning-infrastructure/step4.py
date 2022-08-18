import pulumi
import pulumi_aws as aws

bucket = aws.s3.Bucket("my-bucket")

pulumi.export('bucket_name', bucket.bucket)
