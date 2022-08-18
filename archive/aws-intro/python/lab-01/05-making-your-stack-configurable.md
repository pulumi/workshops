# Making Your Stack Configurable

Right now, the bucket's contents are hard-coded. Next, you'll make the location of the contents configurable, and add support for populating the bucket with an entire directory's worth of contents.

## Step 1 &mdash; Adding a Config Variable

Instead of hard-coding the `"site"` directory, we will use configuration to make it easy to change the location without editing the program.

Add this to your `__main__.py` file:

```python
config = pulumi.Config()
site_dir = config.require("siteDir")
```

## Step 2 &mdash; Populating the Bucket Based on Config


And replace the hard-coded `"site"` parameter with this imported `siteDir` variable:

```python
filepath = os.path.join(site_dir, "index.html")
mime_type = mimetypes.guess_type(filepath)

obj = aws.s3.BucketObject("index.html",
    bucket=bucket.bucket,
    source=pulumi.FileAsset(filepath),
    acl="public-read",
    content_type=mime_type,
)
```

> :white_check_mark: After these changes, your `__main__.py` should [look like this](./code/05-making-your-stack-configurable/step2.py).

To make matters interesting, rename the `site` directory to `www`:

```bash
mv site www
```

## Step 3 &mdash; Deploying the Changes

Now, deploy your changes. To do so, first configure your stack. If you don't, you'll get an error:

```bash
pulumi up
```

This results in an error like the following:

```
error: Missing required configuration variable 'iac-workshop:siteDir'
    please set a value using the command `pulumi config set iac-workshop:siteDir <value>`
```

Configure the `iac-workshop:siteDir` variable very much like the `aws:region` variable:

```bash
pulumi config set iac-workshop:siteDir www
```

This detects that the path has changed and will perform a simple update:

```
Updating (dev):

     Type                    Name              Status      Info
     pulumi:pulumi:Stack     iac-workshop-dev
 ~   └─ aws:s3:BucketObject  index.html        updated     [diff: ~source]

Outputs:
    bucket_endpoint: "http://my-bucket-8257ac5.s3-website-us-west-1.amazonaws.com"
    bucket_name    : "my-bucket-8257ac5"

Resources:
    ~ 1 updated
    2 unchanged

Duration: 3s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop/dev/updates/5
```

## Step 4 &mdash; Add More Files

Instead of hard-coding the set of files, you will now change the program to read the entire contents of the `www` directory.

Add a new file, `about.html`, to the `www` directory:

```
<html>
    <p>Infrastructure as code using real languages is powerful.</p>
</html>
```

Now replace the object allocation code as follows:

```python
for file in os.listdir(site_dir):
    filepath = os.path.join(site_dir, file)
    mime_type, _ = mimetypes.guess_type(filepath)
    obj = aws.s3.BucketObject(file,
          bucket=bucket.bucket,
          source=pulumi.FileAsset(filepath),
          acl="public-read",
          content_type=mime_type
    )
```

> :white_check_mark: After these changes, your `__main__.py` should [look like this](./code/05-making-your-stack-configurable/step4.py).

Perform a deployment:

```bash
pulumi up
```

You will see a single new object created for the `www/about.html` file:

```
Updating (dev):

     Type                    Name              Status
     pulumi:pulumi:Stack     iac-workshop-dev
 +   └─ aws:s3:BucketObject  about.html        created
# ...
```

Now fetch it:

```bash
curl $(pulumi stack output bucket_endpoint)/about.html
```

And you will see the contents added above.

## Next Steps

* [Creating a Second Stack](./06-creating-a-second-stack.md)
