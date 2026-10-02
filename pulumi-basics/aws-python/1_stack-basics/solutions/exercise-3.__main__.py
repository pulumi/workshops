import pulumi
from pulumi_aws import s3

## Exercise 2 ##
config = pulumi.Config()
base_name = config.require("base_name")
## Exercise 2 ##

# Create an AWS resource (S3 Bucket)
## Exercise 2 ##
my_bucket_name = f"{base_name}-bucket"
bucket = s3.Bucket(my_bucket_name,
  ## Exercise 3 ##
  bucket=my_bucket_name
  ## Exercise 3 ##
)
## Exercise 2 ##

pulumi.export("bucket_name", bucket.id)
