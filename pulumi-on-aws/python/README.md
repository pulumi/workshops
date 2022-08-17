---
author: Lee B.
language: python
provider: aws
use: first-party
last-ran: unknown
boilerplate: something
last-host: unknown
learn-content: none
original-repo: https://github.com/pulumi/infrastructure-as-code-workshop/tree/master/labs/aws/pulumi-in-practice/python
status: stale
---
### Lab 1 - Preparing to use Pulumi with AWS

The first lab shows you how to set up your Pulumi project so that you can use Pulumi with AWS.

We'll cover:

  - Bootstrapping your Pulumi + AWS Python project
  - Setting up AWS credentials
  - Verifying your access to AWS is valid
  - Setting AWS config options in your program

### Lab 2 - Managing an S3 Bucket

The [second lab](./lab-02/README.md) shows a very simple static website deployed with Pulumi. It introduces some key Pulumi features, namely the ability to use standard programming loops. Also in this lab, we'll introduce the Pulumi concept of an Output, and how to manage these outputs when managing standard programming strings.

Once you have completed this lab, you should feel comfortable with:

 - Running your first Pulumi program in AWS
 - Pulumi's Python SDK and its type system
 - More steps in understanding Pulumi's programming model
 - How you can use traditional programming constructs in Pulumi

### Lab 3 - Deploying a Webserver

The [third lab](./lab-03/README.md) shows how to deploy a simple, python webserver to multiple AWS regions. Once you've completed this lab, you'll feel comfortable with:

 - Retrieving existing resources in AWS using Pulumi's `get` methods
 - Looping over retrieved resources to deploy new resources using familiar programming methods

### Lab 4 - Deploying Containers to Elastic Container Service (ECS)

In this lab, you will learn about how to create and deploy container based applications to Elastic Container Service (ECS).

  - You'll gain familiarity with with the AWS Elastic Container Service
