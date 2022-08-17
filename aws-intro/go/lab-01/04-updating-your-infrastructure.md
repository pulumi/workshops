# Updating Your Infrastructure

We just saw how to create new infrastructure from scratch. Next, let's make a few updates:

1. Add an object to your bucket.
2. Serve content from your bucket as a website.
3. Programmatically create infrastructure.

This demonstrates how declarative infrastructure as code tools can be used not just for initial provisioning, but also subsequent changes to existing resources.

## Step 1 &mdash; Add an Object to Your Bucket

Create a directory `site/` and add a new `index.html` file with the following contents:

```html
<html>
    <body>
        <h1>Hello Pulumi</h1>
    </body>
</html>
```

Add an import to your `main.go` file:

```go
...
path/filepath
...
```

And then add these lines to `main.go` right after creating the bucket itself:

```go
...
_, err = s3.NewBucketObject(ctx, "index.html", &s3.BucketObjectArgs{
    Bucket: bucket.Bucket,
    Source: pulumi.NewFileAsset(bucketFile),
})
...
```

> :white_check_mark: After these changes, your `main.go` should [look like this](./code/04-updating-your-infrastructure/step1.go).

Deploy the changes:

```bash
pulumi up
```

This will give you a preview and selecting `yes` will apply the changes:

```
Updating (dev):

     Type                    Name              Status
     Type                    Name              Status
     pulumi:pulumi:Stack     iac-workshop-dev
 +   └─ aws:s3:BucketObject  index.html        created

Resources:
    + 1 created
    2 unchanged

Duration: 13s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop/dev/updates/3
```

A single resource is added and the 2 existing resources are left unchanged. This is a key attribute of infrastructure as code &mdash; 
such tools determine the minimal set of changes necessary to update your infrastructure from one change to the next.

Finally, relist the contents of your bucket:

```bash
aws s3 ls $(pulumi stack output bucket_name)
```

Notice that your `index.html` file has been added:

```
2019-10-22 16:50:54        68 index.html
```

## Step 2 &mdash; Serve Content From Your Bucket as a Website

To serve content from your bucket as a website, you'll need to update a few properties.

First, your bucket needs a website property that sets the default index document to `index.html`:

```go
...
bucket, err := s3.NewBucket(ctx, "my-bucket", &s3.BucketArgs{
    Website: s3.BucketWebsiteArgs{
        IndexDocument: pulumi.String("index.html"),
    },
})
...
```

Next, your `index.html` object will need two changes: an ACL of `public-read` so that it can be accessed anonymously over the Internet, and a content type so that it is served as HTML:

```go
...
bucketFile := filepath.Join("site", "index.html")
_, err = s3.NewBucketObject(ctx, "index.html", &s3.BucketObjectArgs{
    Bucket:      bucket.Bucket,
    Source:      pulumi.NewFileAsset(bucketFile),
    Acl:         pulumi.String("public-read"),
    ContentType: pulumi.String(mime.TypeByExtension(path.Ext(bucketFile))),
})
...
```

Finally, export the resulting bucket's endpoint URL so we can easily access it:

```go
...
ctx.Export("bucketEndpoint", bucket.WebsiteEndpoint)
...
```

> :white_check_mark: After these changes, your `main.go` should [look like this](./code/04-updating-your-infrastructure/step2.go).

Now deploy the changes:

```bash
pulumi up
```

This shows a preview like so:

```
Previewing update (dev):

     Type                    Name              Plan       Info
     pulumi:pulumi:Stack     iac-workshop-dev
 ~   ├─ aws:s3:Bucket        my-bucket         update     [diff: +website]
 ~   └─ aws:s3:BucketObject  index.html        update     [diff: ~acl,contentType]

Outputs:
  + bucketEndpoint: output<string>
  ~ bucketName    : "my-bucket-8257ac5" => output<string>

Resources:
    ~ 2 to update
    1 unchanged

Do you want to perform this update?
  yes
> no
  details
```

Selecting `details` during the preview is more interesting this time:

```
  pulumi:pulumi:Stack: (same)
    [urn=urn:pulumi:dev::iac-workshop::pulumi:pulumi:Stack::iac-workshop-dev]
    ~ aws:s3/bucket:Bucket: (update)
        [id=my-bucket-02d7e7a]
        [urn=urn:pulumi:dev::iac-workshop::aws:s3/bucket:Bucket::my-bucket]
      + website: {
          + indexDocument: "index.html"
        }
    ~ aws:s3/bucketObject:BucketObject: (update)
        [id=index.html]
        [urn=urn:pulumi:dev::iac-workshop::aws:s3/bucketObject:BucketObject::index.html]
      ~ acl        : "private" => "public-read"
      ~ contentType: "binary/octet-stream" => "text/html; charset=utf-8"
    --outputs:--
  + bucketEndpoint: output<string>
  ~ bucketName    : "my-bucket-8257ac5" => output<string>

Do you want to perform this update?
  yes
> no
  details
```

Afterwards, select `yes` to deploy all of the updates:

```
Updating (dev):

     Type                    Name              Status      Info
     pulumi:pulumi:Stack     iac-workshop-dev
 ~   ├─ aws:s3:Bucket        my-bucket         updated     [diff: +website]
 ~   └─ aws:s3:BucketObject  index.html        updated     [diff: ~acl,contentType]

Outputs:
  + bucketEndpoint: "http://my-bucket-8257ac5.s3-website-us-west-1.amazonaws.com"
    bucketName: "my-bucket-8257ac5"

Resources:
    ~2 updated
    1 unchanged

Duration: 7s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop/dev/updates/4
```

## Step 3 &mdash; Access Your Website

```bash
curl $(pulumi stack output bucketEndpoint)
```

This will fetch and print our `index.html` file:

```
<html>
    <body>
        <h1>Hello Pulumi</h1>
    </body>
</html>
```

## Next Steps

* [Making Your Stack Configurable](./05-making-your-stack-configurable.md)
