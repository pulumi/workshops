import pulumi
from pulumi_aws import s3

## Exercise 2 ##
config = pulumi.Config()
base_name = config.require("base_name")
## Exercise 2 ##

# Create an AWS resource (S3 Bucket)
## Exercise 2 ##
bucket = s3.Bucket(f"{base_name}-bucket")
## Exercise 2 ##

pulumi.export("bucket_name", bucket.id)
