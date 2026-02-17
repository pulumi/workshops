"""A Google Cloud Python Pulumi program"""

import pulumi
from pulumi_gcp import storage

# Create a GCP resource (Storage Bucket)
bucket = storage.Bucket('my-bucket', location="US")

# Read a local file — because this is just Python!
with open("text.txt", "r") as f:
    content = f.read()

# Upload the file to our bucket
obj = storage.BucketObject("my-text-file",
    bucket=bucket.name,
    content=content
)

# Export the bucket name and a direct URL to the object
pulumi.export('bucket_name', bucket.url)
pulumi.export('object_url', pulumi.Output.concat(bucket.url, "/", obj.name))
