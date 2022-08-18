# Provisioning Infrastructure

Now that you have a project configured to use AWS, you'll create some basic infrastructure in it. We will start with a simple S3 bucket.

## Step 1 &mdash; Declare a New Bucket

Add the following to your `main.go` file:

```go
...
		_, err := s3.NewBucket(ctx, "my-bucket", nil)
		if err != nil {
			return err
		}
...
```

> :white_check_mark: After this change, your `main.go` should [look like this](./code/03-provisioning-infrastructure/step1.go).

## Step 2 &mdash; Preview Your Changes

Let's ensure that all of our dependencies are installed at this point by running:

```bash
$ dep ensure -v
```

Now preview your changes:

```
pulumi up
```

This command evaluates your program, determines the resource updates to make, and shows you an outline of these changes:

```
▶ pulumi up
Previewing update (dev):
     Type                 Name              Plan
 +   pulumi:pulumi:Stack  iac-workshop-dev  create
 +   └─ aws:s3:Bucket     my-bucket         create

Resources:
    + 2 to create

Do you want to perform this update?
  yes
> no
  details
```

This is a summary view. Select `details` to view the full set of properties:

```
+ pulumi:pulumi:Stack: (create)
    [urn=urn:pulumi:dev::iac-workshop::pulumi:pulumi:Stack::iac-workshop-dev]
    + aws:s3/bucket:Bucket: (create)
        [urn=urn:pulumi:dev::iac-workshop::aws:s3/bucket:Bucket::my-bucket]
        acl         : "private"
        bucket      : "my-bucket-9af9943"
        forceDestroy: false

Do you want to perform this update?
  yes
> no
  details
```

The stack resource is a synthetic resource that all resources your program creates are parented to.

## Step 3 &mdash; Deploy Your Changes

Now that we've seen the full set of changes, let's deploy them. Select `yes`:

```
Updating (dev):
     Type                 Name              Status
 +   pulumi:pulumi:Stack  iac-workshop-dev  created
 +   └─ aws:s3:Bucket     my-bucket         created

Resources:
    + 2 created

Duration: 34s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop/dev/updates/1
```

Now our S3 bucket has been created in our AWS account. Feel free to click the Permalink URL and explore; this will take you to the [Pulumi Console](https://www.pulumi.com/docs/intro/console/), which records your deployment history.

## Step 4 &mdash; Export Your New Bucket Name

To inspect your new bucket, you will need its physical AWS name. Pulumi records a logical name, `my-bucket`, however the resulting AWS name will be different.

Programs can export variables which will be shown in the CLI and recorded for each deployment. Export your bucket's name by adding this line to `main.go`:

```go
...
ctx.Export("bucketName", bucket.Bucket)
```

> :white_check_mark: After this change, your `main.go` should [look like this](./code/03-provisioning-infrastructure/step4.go).

Now deploy the changes:

```bash
pulumi up
```

Notice a new `Outputs` section is included in the output containing the bucket's name:

```
...

Outputs:
  + bucketName: "my-bucket-036acb3"

Resources:
    2 unchanged

Duration: 6s

Permalink: https://app.pulumi.com/joeduffy/iac-workshop/dev/updates/2
```

> The difference between logical and physical names is in part due to "auto-naming" which Pulumi does to ensure side-by-side 
>projects and zero-downtime upgrades work seamlessly. It can be disabled if you wish; [read more about auto-naming here](https://www.pulumi.com/docs/intro/concepts/programming-model/#autonaming).

## Step 5 &mdash; Inspect Your New Bucket

Now run the `aws` CLI to list the objects in this new bucket:

```
aws s3 ls $(pulumi stack output bucketName)
```

Note that the bucket is currently empty.

## Next Steps

* [Updating Your S3 Bucket](./04-updating-your-infrastructure.md)
