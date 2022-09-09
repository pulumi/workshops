# Deploy a Static Website

In the second lab of this workshop, we're going to deploy some static HTML files to a GCP Storage bucket.

## Step 1 &mdash; Create a Bucket

We'll first create the GCP storage bucket that will store our HTML files. Before we do that, we need to import the GCP provider into our project at the top with the other import statements:

```python
import pulumi_gcp as gcp
```

Now that we've imported our GCP provider, we can create our bucket at the end of the file:

```python
bucket = gcp.storage.Bucket(
    "website",
    location="US"
)
```

You'll notice we've set a location parameter for our bucket.

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

## Step 2 &mdash; Configure the ACLs for the Bucket Object

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
    'website',
    bucket=bucket.name,
    role="READER",
    entity="allUsers"
)
```

## Step 3 &mdash; Upload your Objects

Now we need to upload the files that comprise our website so we can view them. Because Pulumi uses real programming languages, we can use constructs like `for` loops. Let's use a `for` loop to iterate over the files in the `wwwroot` directory in this repo and upload them using the `BucketObject` resource.

First, we need to import the `os` Python library. Note that a major advantage of Pulumi's design of using real programming languages is that we can make use of both standard libraries and external packages when defining our infrastructure.

Add the following statement near the top of your `__main__.py` near your other imports:

```python
import os
for file in ["404.html", "index.html"]:
    filepath = os.path.join("../wwwroot", file)
    gcp.storage.BucketObject(
        file,
        bucket=bucket.name,
        name=file,
        source=pulumi.FileAsset(filepath),
        opts=pulumi.ResourceOptions(depends_on=[acl])
    )
```

Notice the use of `depends_on`. This tells Pulumi that our `BucketObjects` should not be created until our `DefaultObjectAccessControl` has been fully provisioned. The `depends_on` is necessary because there's no _explicit_ dependency between the files and the ACL (i.e., there's no output from the `DefaultObjectAccessControl` resource passed to the `BucketObject` inputs). If we didn't explicitly specify `depends_on`, our files may get uploaded before the default ACL is applied, and our files would not get created with the right default permissions.

## Step 4 &mdash; Run `pulumi up`

Now that we've defined our infrastructure, we use the Pulumi CLI to create the resources we've defined.

Run `pulumi up` in your project directory. You should see output similar to the following:

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

## Step 5 &mdash; Export the Bucket URL

Our final step is to build our static site URL and add it as a [stack output](https://www.pulumi.com/learn/building-with-pulumi/stack-outputs/).

First, we assemble the output's value using `pulumi.Output.concat`:

```python
static_site_url = pulumi.Output.concat(
    "https://storage.googleapis.com/", bucket.name, "/index.html")
```

We use `pulumi.Output.concat` instead of standard Python string concatenation because `bucket.name` is a Pulumi Output&mdash;a value that isn't known until after a resource has been created. For more information on Pulumi Inputs and Outputs, reference [Inputs and Outputs](https://www.pulumi.com/docs/intro/concepts/inputs-outputs/) in the Pulumi docs.

Now we can export the value as a stack export, which will allow us to view its value after our Pulumi program runs and our infrastructure has been provisioned:

```python
pulumi.export("static_site_url", static_site_url)
```

We can obtain the value of our URL by running `pulumi up` again:

```bash
pulumi up
```

And we can now view our website's index page via `curl`:

```bash
curl $(pulumi stack output static_site_url)
```

At the end of this lab, your `__main__.py` should look like this:

```python
"""A Python Pulumi program"""

import os

import pulumi
import pulumi_gcp as gcp

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

for file in ["404.html", "index.html"]:
    filepath = os.path.join("wwwroot", file)
    gcp.storage.BucketObject(
        file,
        bucket=bucket.name,
        name=file,
        source=pulumi.FileAsset(filepath),
        opts=pulumi.ResourceOptions(depends_on=[acl])
    )

static_site_url = pulumi.Output.concat(
    "https://storage.googleapis.com/", bucket.name, "/index.html")

pulumi.export("static_url", static_site_url)
```

## Next Steps

* [Build and Deploy a Container on Google Cloud Run](../lab-03/README.md)
