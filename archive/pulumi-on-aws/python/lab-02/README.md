# Provision a Static S3 Website

In this lab, you'll first create an S3 bucket. Next, you'll use programming loops to upload objects to that bucket, and then finally you'll add a Bucket Policy to make those objects accessible as a static website.

## Step 1 &mdash;  Declare the Bucket

Import the AWS package in an empty `__main__.py` file:

```python
from pulumi_aws import s3
```

Now, create an S3 bucket and specify some arguments to make this bucket serve a static website

```python
bucket = s3.Bucket(
    "my-website-bucket",
    website=s3.BucketWebsiteArgs(
        index_document="index.html",
    ),
)
```

## Step 2 &mdash; Create the Website contents

Now we need to make a very simple `index.html` for our website.

Let's make a directory inside our Pulumi program to store it:

```bash
mkdir www
```

Inside that directory, create a file: `index.html` and populate it with the correct contents, like so:

```html
<html>
    <head><meta charset="UTF-8">
    <title>Hello, Pulumi!</title></head>
<body>
    <p>Hello, S3!</p>
    <p>Made with ❤️ with <a href="https://pulumi.com">Pulumi</a> and Python</p>
    <img src="python.png" />
</body></html>
```

Finally, lets also add our python image, to make our website look good! You need to download this image into the www directory too:

```bash
curl -o www/python.png https://www.python.org/static/community_logos/python-logo-master-v3-TM-flattened.png
```

Now we're ready to upload these files to our bucket

## Step 3 &mdash; Upload the bucket contents

Go back to our Pulumi program, and add the following to upload the files inside our `www` directory

```python
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
```

Re-run your `pulumi up` to add these files to your bucket

## Step 4 &mdash; Add a Bucket Policy

Now that we've uploaded our files, we need to add a bucket policy to make them accessible.

Our bucket policy needs to reference our Bucket, but the bucket name/id is not known until the program runs. In this particular scenario, we need to use an [apply](https://www.pulumi.com/docs/intro/concepts/programming-model/#apply) to pass the bucket name into the string that contains the bucket policy. Let's see how that looks:

```python
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
```

Run your `pulumi up` again and you'll see the bucket gets modified.

## Step 5 &mdash; Export the bucket endpoint

Finally, we need to actually know where this bucket is so we can view our new website. Let's add an exported output to see what the URL is that was generated:

```
pulumi.export('website_url', bucket.website_endpoint)
```

Run your `pulumi up` to see the new URL
