---
author: Piers
language: typescript
provider: aws
use: first-party
last-ran: 3 Nov 2022
boilerplate: none
last-host: Piers
learn-content: none
original-repo: none
status: active
---

# Serverless Architecture on AWS

We're going to explore different ways of deploying Serverless resources on Amazon Web Services (AWS) using infrastructure as code and cloud engineering principles. We’ll use Typescript to define our new architecture, and we’ll explore more about stacks, inputs and outputs, secrets, and more. 

## Prerequisites

You will need the following tools:

* [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops)
* [Pulumi FREE SaaS Account](https://app.pulumi.com/signup/?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops)
  * Pulumi state storage is FREE for individuals, you can use this account for all your personal Pulumi projects and you never need to worry about where to store your state 😃
* [NodeJS](https://www.pulumi.com/docs/intro/languages/javascript/?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops) (I've run this with NodeJS v16.3.0 but it should run with v14)
* An [AWS Account](https://portal.aws.amazon.com/billing/signup#/start/email) - the free tier should cover everything in this workshop but any costs accrued will be minimal

## Workshop contents

The workshop is divided into three labs:

### Lab 1 - Serverless templates

In this lab we will use the AWS Serverless Application template to deploy a serverless application. [View lab 1](https://github.com/pulumi/workshops/tree/main/serverless-architecture-on-aws/lab-1)

### Lab 2 - Production Ready serverless application

In the second lab we will take our learnings from the first lab and make changes to make it easier and more secure to deploy. [View lab 2](https://github.com/pulumi/workshops/tree/main/serverless-architecture-on-aws/lab-2)

### Lab 3 - Exploring more serverless architectures

In the final lab we will take a look at what tools the Pulumi AWS provider gives us to make it easier to build Serverless architectures. [View lab 3](https://github.com/pulumi/workshops/tree/main/serverless-architecture-on-aws/lab-3)