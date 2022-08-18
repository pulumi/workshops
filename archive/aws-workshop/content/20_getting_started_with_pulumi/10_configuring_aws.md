+++
title = "Configuring AWS"
chapter = false
weight = 10
+++

Now that you have a basic project, let's configure AWS support for it.

## Step 1 &mdash; Install the AWS Package

Run the following command to install the AWS package:

```bash
npm install @pulumi/aws
```

The package will be added to `node_modules`, `package.json`, and `package-lock.json`.

## Step 2 &mdash; Import the AWS Package

Now that the AWS package is installed, we need to import it as part of our project:

```typescript
import * as aws from "@pulumi/aws";
```

{{% notice info %}}
The `index.ts` file should now have the following contents:
{{% /notice %}}
```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
```

## Step 3 &mdash; Configure an AWS Region

Configure the AWS region you would like to deploy to:

```bash
pulumi config set aws:region us-west-2
```

Feel free to choose any AWS region that supports the services used in these labs ([see this table](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#concepts-available-regions) for a list of available regions).

## (Optional) Step 4 &mdash; Configure an AWS Profile

If you're using an alternative AWS profile, you can tell Pulumi which to use in one of two ways:

* Using an environment variable: `export AWS_PROFILE=<profile name>`
* Using configuration: `pulumi config set aws:profile <profile name>`
