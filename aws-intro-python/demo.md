## Demo

Here you will find all the steps to build the demo.

Pre-reqs:
```
logged into AWS (,aws-login)

```

## s3 Stuff

First let's start with a template:

```
> pulumi new --force
aws-python
( all defaults)
ca-central-1
```

Then look at files and update:

```
pulumi up
```

Add file to S3:
```
echo 'textfile!' > text.txt
```

Update code:

``` diff
# Create an AWS resource (S3 Bucket)
bucket = s3.BucketV2('my-bucket')

+with open("text.txt","r") as f:
+    content = f.read()

+obj = s3.BucketObject("my-text-file",
+    bucket=bucket.id,
+    content=content
+   )

# Export the name of the bucket
pulumi.export('bucket_name', bucket.id)

```

Run it and see the file:
```
pulumi up
echo "$(pulumi stack output bucket_name)"
aws s3 cp s3://$(pulumi stack output bucket_name)/my-text-file -
```

aws s3 gets the bucket name, gets the file and `-` prints to standard out.
