+++
title = "Updating Infrastructure"
chapter = false
weight = 30
+++

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

Add an import to your `index.ts` file:

```typescript
import * as path from "path";
```

And then add these lines to `index.ts` right after creating the bucket itself:

```typescript
const myObject = new aws.s3.BucketObject("index.html", {
    bucket: myBucket,
    source: new pulumi.asset.FileAsset(path.join("site", "index.html")),
});
```

{{% notice info %}}
The `index.ts` file should now have the following contents:
{{% /notice %}}
```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as path from "path";

const myBucket = new aws.s3.Bucket("my-bucket");

const myObject = new aws.s3.BucketObject("index.html", {
    bucket: myBucket,
    source: new pulumi.asset.FileAsset(path.join("site", "index.html")),
});

export const bucketName = myBucket.bucket;
```

Deploy the changes:

```bash
pulumi up
```

This will give you a preview and selecting `yes` will apply the changes:

```
Updating (dev):

     Type                    Name              Status
     pulumi:pulumi:Stack     iac-workshop-dev
 +   └─ aws:s3:BucketObject  index.html        created

Resources:
    + 1 created
    2 unchanged

Duration: 4s

Permalink: https://app.pulumi.com/workshops/iac-workshop/dev/updates/3
```

A single resource is added and the 2 existing resources are left unchanged. This is a key attribute of infrastructure as code &mdash; such tools determine the minimal set of changes necessary to update your infrastructure from one change to the next.

Finally, relist the contents of your bucket:

```bash
aws s3 ls $(pulumi stack output bucketName)
```

Notice that your `index.html` file has been added:

```
2019-10-22 16:50:54        68 index.html
```

## Step 2 &mdash; Serve Content From Your Bucket as a Website

To serve content from your bucket as a website, you'll need to update a few properties.

First, your bucket needs a website property that sets the default index document to `index.html`:

```typescript
const myBucket = new aws.s3.Bucket("my-bucket", {
    website: {
        indexDocument: "index.html",
    },
});
```

Next, your `index.html` object will need two changes: an ACL of `public-read` so that it can be accessed anonymously over the Internet, and a content type so that it is served as HTML:

```typescript
const myObject = new aws.s3.BucketObject("index.html", {
    acl: "public-read",
    bucket: myBucket,
    contentType: "text/html",
    source: new pulumi.asset.FileAsset(path.join("site", "index.html")),
});
```

Finally, export the resulting bucket's endpoint URL so we can easily access it:

```typescript
export const bucketEndpoint = pulumi.interpolate`http://${myBucket.websiteEndpoint}`;
```

{{% notice info %}}
The `index.ts` file should now have the following contents:
{{% /notice %}}
```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as path from "path";

const myBucket = new aws.s3.Bucket("my-bucket", {
    website: {
        indexDocument: "index.html",
    },
});

const myObject = new aws.s3.BucketObject("index.html", {
    acl: "public-read",
    bucket: myBucket,
    contentType: "text/html",
    source: new pulumi.asset.FileAsset(path.join("site", "index.html")),
});

export const bucketName = myBucket.bucket;
export const bucketEndpoint = pulumi.interpolate`http://${myBucket.websiteEndpoint}`;
```

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
  ~ bucketName    : "my-bucket-aca82a7" => output<string>

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
        [id=my-bucket-aca82a7]
        [urn=urn:pulumi:dev::iac-workshop::aws:s3/bucket:Bucket::my-bucket]
         [provider=urn:pulumi:dev::iac-workshop::pulumi:providers:aws::default_2_6_1::04da6b54-80e4-46f7-96ec-b56ff0331ba9]
      + website: {
          + indexDocument: "index.html"
        }
    ~ aws:s3/bucketObject:BucketObject: (update)
        [id=index.html]
        [urn=urn:pulumi:dev::iac-workshop::aws:s3/bucketObject:BucketObject::index.html]
         [provider=urn:pulumi:dev::iac-workshop::pulumi:providers:aws::default_2_6_1::04da6b54-80e4-46f7-96ec-b56ff0331ba9]
      ~ acl        : "private" => "public-read"
      ~ contentType: "binary/octet-stream" => "text/html"
    --outputs:--
  + bucketEndpoint: output<string>
  ~ bucketName    : "my-bucket-aca82a7" => output<string>

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
  + bucketEndpoint: "http://my-bucket-aca82a7.s3-website-us-west-1.amazonaws.com"
    bucketName: "my-bucket-99caf0e"

Resources:
    ~2 updated
    1 unchanged

Duration: 7s

Permalink: https://app.pulumi.com/workshops/iac-workshop/dev/updates/4
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
