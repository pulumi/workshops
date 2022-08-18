---
author: Luke/Sean
language: typescript
provider: aws
use: first-party
last-ran: unknown
boilerplate: something
last-host: unknown
learn-content: none
original-repo: https://github.com/pulumi/qcon-workshop
status: stale
---

# Programming the Cloud Workshop

Source code for the Programming the Cloud with TypeScript workshop at QCON London.


### Setup

1. Install Pulumi

    Go to https://pulumi.io/quickstart/install.html to install Pulumi.

1. Install Node.js

    Go to https://nodejs.org/en/download/ to install Node.js version >=10.

1. Install AWS CLI

    Go to https://aws.amazon.com/cli/ to install the AWS CLI.

1. Configure AWS credentials

    Run `aws configure` to configure credentials and defaults for AWS.  Use the Access Key ID and Secret Access Key provided for the workshop.  Set the `eu-west-1` region as the default.  We will be using account 713699580332 which you can log in to at https://713699580332.signin.aws.amazon.com/console.

1. Login to Pulumi

    Run `pulumi login` to signup/login to the Pulumi service.

## Steps

* __Step 1__: [Introduction](./1.Intro/)
* __Step 2__: [Serverless](./2.Serverless/)
* __Step 3__: [Kubernetes](./3.Kubernetes/)
* __Step 4__: [Kubernetes + Cloud](./4.Kubernetes+Cloud)
