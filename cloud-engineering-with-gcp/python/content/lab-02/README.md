# Deploy a Static Website

In the second lab of this workshop, we're going to deploy some static HTML files to a GCP Storage bucket.

## Step 1 &mdash; Create a Bucket

We'll first create the GCP storage bucket that will store our HTML files. Before we do that, we need to import the GCP provider

Add the following to the top of `__main__.py`, with the other `import` directive:

```python
import pulumi_gcp as gcp
```

Now that we've imported our GCP provider, we can create our bucket.

Add the following to the bottom of `__main__.py`:

```python
bucket = gcp.storage.Bucket(
    "website",
    location="US"
)
```

At this stage, your `__main__.py` file should match the following code:

```python
"""A Python Pulumi program"""

import pulumi
import pulumi_gcp as gcp

bucket = gcp.storage.Bucket(
    "website",
    location="US"
)
```

## Step 2 &mdash; Create Website Files

Create a directory as a subdirectory of your project:

```bash
mkdir www
```

Create a file `www/index.html` with the following contents:

```html
<html>

<head>
  <meta charset="UTF-8">
  <title>Hello, Pulumi!</title>
</head>

<body>
  <p>Hello, S3!</p>
  <p>Made with ❤️ with <a href="https://pulumi.com">Pulumi</a> and Python</p>
  <p>Hosted with ❤️ by GCP!</p>
  <img src="python.png" />
</body>

</html>
```

Next, download a Python image to the `www` directory:

```bash
curl https://raw.githubusercontent.com/pulumi/examples/ec43670866809bfd64d3a39f68451f957d3c1e1d/aws-py-s3-folder/www/python.png -o www/python.png
```

## Step 3 &mdash; Configure the ACLs for the Bucket Object

When we upload the HTML files to our bucket, we want them to be publicly accessible. In order to make sure every file we place in the bucket gets desired accessibility, we need to set a default access control list (ACL).

Create a default ACL:

```python
acl = gcp.storage.DefaultObjectAccessControl(
    'website',
    bucket=bucket.name,
    role="READER",
    entity="allUsers"
)
```

At this stage, your `__main__.py` file should match the following code:

```python
"""A Python Pulumi program"""

import pulumi
import pulumi_gcp as gcp

bucket = gcp.storage.Bucket(
    "website",
    location="US"
)

acl = gcp.storage.DefaultObjectAccessControl(
    "website",
    bucket=bucket.name,
    role="READER",
    entity="allUsers"
)
```

## Step 4 &mdash; Upload Bucket Objects

Now we need to upload the files that comprise our website so we can view them. Because Pulumi uses real programming languages, we can use constructs like `for` loops. Let's use a `for` loop to iterate over the files in the `www` directory in this repo and upload them using the `BucketObject` resource.

First, we need to import the `os` Python library. Note that a major advantage of Pulumi's design of using real programming languages is that we can make use of both standard libraries and external packages when defining our infrastructure.

Add the following statement near the top of your `__main__.py` near your other imports:

```python
import os
```

Then add the following at the bottom of your `__main.py__`:

```python
content_dir = "www"
for file in os.listdir(content_dir):
    filepath = os.path.join(content_dir, file)
    gcp.storage.BucketObject(
        file,
        bucket=bucket.name,
        name=file,
        source=pulumi.FileAsset(filepath),
        opts=pulumi.ResourceOptions(depends_on=[acl])
    )
```

Notice the use of `depends_on`. This tells Pulumi that our `BucketObjects` should not be created until our `DefaultObjectAccessControl` has been fully provisioned. The `depends_on` is necessary because there's no _explicit_ dependency between the files and the ACL (i.e., there's no output from the `DefaultObjectAccessControl` resource passed to the `BucketObject` inputs). If we didn't explicitly specify `depends_on`, our files may get uploaded before the default ACL is applied, and our files would not get created with the right default permissions.

## Step 5 &mdash; Run `pulumi up`

Now that we've defined our infrastructure, we can use the Pulumi CLI to create the resources we've defined.

Run the following command in your project directory:

```bash
pulumi up
```

You should see output similar to the following:

```bash
$ pulumi up
Previewing update (dev)

View Live: https://app.pulumi.com/jaxxstorm/static_site/dev/previews/b5ce861f-16ac-4930-ada4-1e9547e02eb1

     Type                                       Name             Plan
 +   pulumi:pulumi:Stack                        static_site-dev  create
 +   ├─ gcp:storage:Bucket                      website          create
 +   ├─ gcp:storage:DefaultObjectAccessControl  website          create
 +   ├─ gcp:storage:BucketObject                404.html         create
 +   └─ gcp:storage:BucketObject                index.html       create

Resources:
    + 5 to create

Do you want to perform this update?  [Use arrows to move, enter to select, type to filter]
  yes
> no
  details
```

You can examine the details of the resources that will be created. When you're happy, move the arrow to `yes` and watch as Pulumi creates your resources!

## Step 6 &mdash; Export the Bucket URL

Our final step is to build our static site URL and add it as a [stack output](https://www.pulumi.com/learn/building-with-pulumi/stack-outputs/). Stack outputs allow us to consume values from the command line or other Pulumi programs. In this case, we will consume our output from the command line.

First, we assemble the output's value using `pulumi.Output.concat`.

Add the following to your `__main__.py`:

```python
static_site_url = pulumi.Output.concat(
    "https://storage.googleapis.com/", bucket.name, "/index.html")
```

We use `pulumi.Output.concat` instead of standard Python string concatenation because `bucket.name` is a Pulumi Output&mdash;a value that isn't known until after a resource has been created. For more information on Pulumi Inputs and Outputs, reference [Inputs and Outputs](https://www.pulumi.com/docs/intro/concepts/inputs-outputs/) in the Pulumi docs.

Now we can export the value as a stack output, which will allow us to view its value from outside of our Pulumi program via the command line.

Add the following to your `__main__.py`:

```python
pulumi.export("static_site_url", static_site_url)
```

At the end of this lab, your `__main__.py` should look like this:

```python
"""A Python Pulumi program"""

import pulumi
import pulumi_gcp as gcp
import os

bucket = gcp.storage.Bucket(
    "website",
    location="US"
)

acl = gcp.storage.DefaultObjectAccessControl(
    'website',
    bucket=bucket.name,
    role="READER",
    entity="allUsers"
)

content_dir = "www"
for file in os.listdir(content_dir):
    filepath = os.path.join(content_dir, file)
    gcp.storage.BucketObject(
        file,
        bucket=bucket.name,
        name=file,
        source=pulumi.FileAsset(filepath),
        opts=pulumi.ResourceOptions(depends_on=[acl])
    )

static_site_url = pulumi.Output.concat(
    "https://storage.googleapis.com/", bucket.name, "/index.html")

pulumi.export("static_site_url", static_site_url)
```

We can obtain the value of our URL by running `pulumi up` again, which will create the stack output:

```bash
pulumi up
```

Select `yes` to continue. One the command completes, we can now view our website.

```bash
curl $(pulumi stack output static_site_url)
```

You should see the contents of `index.html`.

## Step 7 &mdash; Tear Down

Now that we've demonstrated creating a static site using Pulumi, it's time to tear down our infrastructure now that we no longer need it.

Run the following command at the command line:

```bash
pulumi destroy
```

You will be presented with a preview indicating that all resources in the stack will be destroyed by continuing. Select `yes` to continue and your infrastructure will be deleted.

If you'd like to remove your now-empty stack completely, you can optionally run the following command and confirm when asked if you're sure:

```bash
pulumi stack rm dev
```

That's it! We've now explored all the basics of creating and deleting infrastructure with Pulumi! Now we can move on to a slightly more advanced example: running containers on Google Cloud Run.

## Next Steps

* [Build and Deploy a Container on Google Cloud Run](../lab-03/README.md)
