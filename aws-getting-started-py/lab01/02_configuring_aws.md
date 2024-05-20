# 1.2 Configuring AWS

Now that we have a basic project, let's add the Pulumi AWS provider and configure our credentials.

## Step 1 &mdash; Install the AWS Package

Pulumi created a `virtualenv` for us when we created our `iac-workshop` project. We'll need to activate it to install dependencies:

```bash
source venv/bin/activate
```

Add the following content to `requirements.txt`:

```text
pulumi_aws>=6.0.0,<7.0.0
```

Run the following command to install the AWS packages:

```bash
pip3 install -r requirements.txt
```

## Step 2 &mdash; Import the AWS Package

Now that the AWS package is installed, we need to import it as part of our project.

Add the following to the top of your `__main.py__`:

```python
import pulumi_aws as aws
```

<details>
<summary> ✅ Code check </summary>

After this change, your `__main__.py` should look like this:

```python
"""A Python Pulumi program"""

import pulumi
import pulumi_aws as aws
```

</details>

## Step 3 &mdash; Configure an AWS Region

Configure the AWS region you would like to deploy to, replacing `us-east-1` with your AWS region of choice:

```bash
pulumi config set aws:region us-east-1
```

Note that the previous command will create the file `Pulumi.dev.yaml` which contains the configuration for our `dev` stack. (Stacks are logical groupings of Pulumi resources.) We will be working with a single Pulumi stack in this tutorial, but we could define additional stacks to deploy our infrastructure to different regions/accounts with different parameters. To learn more about Pulumi stacks, see [Stacks](https://www.pulumi.com/docs/intro/concepts/stack/) in the Pulumi docs.

## (Optional) Step 4 &mdash; Configure an AWS Profile

If you are using an alternative AWS profile, you can tell Pulumi which to use in one of two ways:

* Using an environment variable: `export AWS_PROFILE=<profile name>`
* Using configuration: `pulumi config set aws:profile <profile name>`

## Next Step

[Provision Infrastructure](./03_provisioning_infrastructure.md)
