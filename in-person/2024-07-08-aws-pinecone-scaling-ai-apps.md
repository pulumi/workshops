# Scaling AI Applications on AWS - Installation Instructions

Before starting the hands-on exercises in this workshop, you'll need to ensure you have three things set up:

1. Pulumi, the infrastructure as code platform you'll be using to provision and deploy your app.
1. An existing AWS account, in which you will deploy your cloud resources. **Note that you must have an existing AWS account to which you have administrator access to do the hands-on exercises in this workshop.** To sign up for an AWS account: <https://portal.aws.amazon.com/billing/signup>.
1. Pinecone, the vector database that will hold your app's vector embeddings. Don't worry if you don't know what this means yet - we will explain as part of the workshop material!

## Pulumi

### Install Pulumi

You can install Pulumi via one of the following methods:

1. Install to your operating system using a package manager or direct download. This method is preferred and can be supported by the workshop instructors.
1. Use a [DevContainer](https://code.visualstudio.com/docs/devcontainers/containers) with Visual Studio Code. This method is not supported by the workshop instructors (because we don't have experience using it), but should be ok for attendees with substantial experience using Devcontainers.

#### Installing to the OS

To install directly to your operating system:

- Instal Pulumi: <https://www.pulumi.com/docs/install/>
- Install Node.js: <https://nodejs.org/en/download/package-manager>

#### DevContainer

The Pulumi DevContainer can be found at <https://github.com/pulumi/devcontainer>. Installation instructions are in the README.

### Sign up for a Pulumi Cloud Account and Configure Your Access Token

If you have not already done so, sign up for a Pulumi Cloud account at <https://pulumip.us/SignUp-Pulumi>. Pulumi Cloud accounts are free for individual use forever, and we will not ask you for payment information.

Once your have your Pulumi Cloud account, you will need to add your Pulumi Cloud personal token to your environment. To obtain a Pulumi Cloud token, click here in [Pulumi Cloud](https://app.pulumi.com/):

![alt text](images/image.png)

Follow the instructions to create a Pulumi Cloud personal token. Place the token's value in your shell's environment, e.g.:

```bash
export PULUMI_ACCESS_TOKEN=pul-4a7028d227cd0f7fac6f3714fec1c3368921f25e
```

Be careful with your Pulumi access token. Anyone who has its value will be able to authenticate to Pulumi Cloud via the Pulumi CLI.

### Verifying your Pulumi Install

To verify that Pulumi is working on your system and that your personal token is correctly configured, run the following command:

```bash
pulumi whoami
```

The output from the command should contain your Pulumi Cloud username, e.g.:

```bash
$ pulumi whoami
josh-pulumi-corp
```

### Pre-Install Required Pulumi Plugins

Some Pulumi providers can take a while to download when they are used for the first time. In order to shorten this time, you should run these commands before the workshop begins on your home or hotel wifi, or possibly on a cellular data hotspot:

```bash
pulumi plugin install resource aws
pulumi plugin install resource awsx
pulumi plugin install resource pinecone
```

## AWS

In order to successfully complete the exercises and run the demos in this workshop, you will need an AWS principal with admin access and have your AWS region correctly set.

### Create an IAM Principal

The easiest way to get an IAM principal with admin access is to create an IAM user with admin privileges in the AWS Console, and use static credentials (access keys) to authenticate against AWS. While this method is easy, it requires careful attention be paid to not exposing your keys since anyone with access to a key will be able to authenticate against your AWS account with admin access.

**If you are unsure of how to handle access keys securely, please ask an instructor for help.**

### Configure Your AWS Region

Ensure your AWS region is set to `us-east-1` before running any Pulumi commands to spin up infrastructure. There are a few ways to set your AWS region in Pulumi: either on a stack-by-stack basis, or using a global default with the AWS CLI.

Setting an AWS region for each Pulumi stack is probably the easier way. To configure the value directly in your Pulumi program once you begin the hands-on section, run this command:

```bash
pulumi config set aws:region us-east-1
```

For details on the other ways of setting your AWS region, see: <https://www.pulumi.com/registry/packages/aws/installation-configuration/#credentials>

## Pinecone

Sign up for a free Pinecone account here: <https://app.pinecone.io/?sessionType=signup>

A free account is sufficient to create the necessary resources for the workshop.

You will also need a Pinecone API key. See [Authentication](https://docs.pinecone.io/guides/get-started/authentication) in the Pinecone docs for instructions on how to create a Pinecone API key.
