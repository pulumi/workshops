# 2.2 Installing and Configuring the AWS and AWSX Providers

Now that we have our project boilerplate, we will add 2 [Pulumi providers](https://www.pulumi.com/docs/intro/concepts/resources/providers/):

1. [AWS Classic](https://www.pulumi.com/registry/packages/aws/), which gives us all the fundamental AWS resources, like VPC subnets.
1. [AWSx](https://www.pulumi.com/registry/packages/awsx/), which contains higher level [Pulumi components](https://www.pulumi.com/docs/intro/concepts/resources/components/), like a full, production-ready VPC that includes subnets, NAT gateways, routing tables, and so on.

## Step 1 &mdash; Install the AWS and AWSx Packages

Pulumi created a `virtualenv` for us when we created our `iac-workshop-ecs` project. We'll need to activate it to install dependencies:

```bash
source venv/bin/activate
```

Add the following content to `requirements.txt`:

```text
pulumi_aws>=6.0.0,<7.0.0
pulumi_awsx>=2.0.0,<3.0.0
```

Run the following command to install the AWS and AWSx packages:

```bash
pip3 install -r requirements.txt
```

## Step 2 &mdash; Import the AWS Package

Now that our packages are installed, we need to import them as part of our project.

Add the following to the top of your `__main.py__`:

```python
import pulumi_aws as aws
import pulumi_awsx as awsx
```

<details>
<summary> ✅ Code check </summary>
After this change, your `__main__.py` should look like this:

```python
"""A Python Pulumi program"""

import pulumi
import pulumi_aws as aws
import pulumi_awsx as awsx
```

</details>

## Step 3 &mdash; Configure an AWS Region

Configure the AWS region you would like to deploy to, replacing `us-west-2` with your AWS region of choice:

```bash
pulumi config set aws:region us-west-2
```

Note that the previous command will create the file `Pulumi.dev.yaml` which contains the configuration for our `dev` stack. (Stacks are logical groupings of Pulumi resources.) We will be working with a single Pulumi stack in this tutorial, but we could define additional stacks to deploy our infrastructure to different regions/accounts with different parameters. To learn more about Pulumi stacks, see [Stacks](https://www.pulumi.com/docs/intro/concepts/stack/) in the Pulumi docs.

## (Optional) Step 4 &mdash; Configure an AWS Profile

If you are using an alternative AWS profile, you can tell Pulumi which to use in one of two ways:

* Using an environment variable: `export AWS_PROFILE=<profile name>`
* Using configuration: `pulumi config set aws:profile <profile name>`

## Next Step

[Create a Cluster](./03_create_cluster.md)
