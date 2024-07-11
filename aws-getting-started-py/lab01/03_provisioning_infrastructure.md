# 1.3 Provisioning Infrastructure

Now that we have a project configured to use AWS, we can create some basic infrastructure. We will start with a simple S3 bucket.

## Step 1 &mdash; Declare a New Bucket

Add the following to your `__main__.py` file:

```python
bucket = aws.s3.Bucket(
    "my-website-bucket",
    aws.s3.BucketArgs(
        website=aws.s3.BucketWebsiteArgs(
            index_document="index.html"
        )
    )
)
```
<details>
<summary> ✅ Code check </summary>
After this change, your `__main__.py` should look like this:

```python
"""A Python Pulumi program"""

import pulumi
import pulumi_aws as aws

aws.s3.Bucket(
    "my-website-bucket",
    aws.s3.BucketArgs(
        website=aws.s3.BucketWebsiteArgs(
            index_document="index.html"
        )
    )
)
```
</details>

## Step 2 &mdash; Preview and Deploy Your Changes

Now let's deploy our bucket:

```bash
pulumi up
```

The `pulumi up` command evaluates our program, determines what the resources need to change, and shows us a preview of the planned changes. You'll see output similar to the following:

```text
Previewing update (dev)

View Live: https://app.pulumi.com/username/iac-workshop/dev/previews/82f71dc2-077e-48d5-b574-e4575f27dad9

     Type                 Name               Plan       
 +   pulumi:pulumi:Stack  iac-workshop-dev   create     
 +   └─ aws:s3:Bucket     my-website-bucket  create     
 
Resources:
    + 2 to create

Do you want to perform this update?  [Use arrows to move, enter to select, type to filter]
  yes
> no
  details
```

The `pulumi:pulumi:stack` resource is the container for all of our infrastructure. Whenever we create a new stack with Pulumi, we'll see this resource created. The second resource is our S3 bucket, which we declared in our program.

Now that we've examined a preview of our changes, let's deploy them. Select `yes`:

```text
Updating (dev)

View Live: https://app.pulumi.com/jkodroff/iac-workshop/dev/updates/1

     Type                 Name               Status      
 +   pulumi:pulumi:Stack  iac-workshop-dev   created     
 +   └─ aws:s3:Bucket     my-website-bucket  created     
 
Resources:
    + 2 created

Duration: 7s
```

Our S3 bucket has been created in our AWS account! Feel free to click the link in the command output and explore; this will take you to the [Pulumi Service](https://www.pulumi.com/docs/intro/pulumi-service/), which records your deployment history.

In the next step, we'll add some files to our S3 bucket.

## Next Step

[Update Infrastructure](./04_updating_infrastructure.md)
