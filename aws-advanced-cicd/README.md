# Advanced CI/CD for AWS using Pulumi and GitHub Actions

Last revision: February 2024.

> [!IMPORTANT]  
> This is an advanced workshop that builds upon the [Getting Started workshop](../aws-getting-started-cicd/). Please make sure it's finished before proceeding.

In this workshop, you will learn advanced topics that make up a robust infrastructure CI/CD pipeline through guided exercises. You will use Pulumi tooling to take your cloud infrastructure pipeline one step closer to production.

This workshop introduces users to advanced DevOps best practices. You will add compliance checks via policies, drift detection, and isolated test environments to an existing GitHub Actions pipeline. This will help accelerate your AWS projects with the code examples provided.

## Learning Objectives

- Learn how to build an advanced CI pipeline to enforce compliance and correct drift.
- Add policy checks to test your infrastructure before each deployment.
- Add a cron job to the pipeline to check for changes periodically (drift)
- Configure a dedicated cloud environment with Review Stacks

## Table of Contents 

TODO

## 🧰 Prerequisites

To go through this workshop with us, here is what you need:

### Pulumi

1. A Pulumi Cloud account, head to [app.pulumi.com](https://app.pulumi.com/signup/?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops) and follow the sign-up process.
2. An [access token](https://www.pulumi.com/docs/intro/pulumi-service/accounts/#access-tokens?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops) from your Pulumi Cloud account.
3. The [Pulumi CLI]((https://www.pulumi.com/docs/get-started/install/?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops)) is installed in your development environment.

### GitHub

1. A [GitHub](https://github.com/join) account.
2. The [GitHub CLI](https://cli.github.com/), [`gh`](https://cli.github.com/) is installed in your development environment.
3. [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) is installed in your development environment.

### AWS

1. The [`aws` CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) is installed in your development environment.
2. [Set up your local AWS credentials](https://www.pulumi.com/registry/packages/aws/installation-configuration/#credentials).


[**Click here to jump back to the Table of Contents**](#table-of-contents)

## Part 1 - Set up your GitHub project

This workshop picks up right where the [Getting Started](../aws-getting-started-cicd/) workshop left off, so we'll start with a sample application and a basic pipeline.

In your terminal, run:

```bash
# Clone the repo


# Configure your secrets

# Show ESC

```

## Part 2 - Add compliance with Policy as Code

### 🎯 Goal

Attendees will be able to add compliance checks to the CI/CD pipeline using Pulumi CrossGuad.

### 📚 Concepts

*Policy as Code*

*Built-in packs*

### 🎬 Steps

By adding a default policy pack, our workflow will automatically ensure we're not violating any cloud infrastructure best practices.


In your terminal, run

```bash
# Create a branch, 

# Add the policy.

# Modify the workflow file.

# Test locally 

# Commit the changes

# Merge the PR

```

## Part 3 - Add drift detection

### 🎯 Goal

TODO

### 📚 Concepts

*Drift detection*

*Reconciling the infrastructure* 

### 🎬 Steps

In your terminal, run

```bash
#  Create a branch, 

#  Add the cron job workflow

# Commit & Merge PR

```

## Part 4 - Add dedicated environments with Review Stacks

### 🎯 Goal

TODO

### 📚 Concepts

*Test in isolation*

### 🎬 Steps

In your terminal, run

```bash
#  Create a branch, 

#  Add the cron job workflow

# Commit & Merge PR

```

## Summary

You introduced advanced elements to your continuous infrastructure pipeline to make it more robust. In particular, you:
- Added policy checks to test your infrastructure for compliance;
- Added a drift detection cron job to the pipeline; and
- Configured dedicated cloud environments with Review Stacks.

## Next Steps

At this point, you have completed this workshop. You have 
- a GitHub repository with a sample application; 
- AWS resources using Pulumi IaC; and
- a robust cloud infrastructure CI/CD pipeline to test any change automatically. 

We encourage you to modify your app or infra and watch the changes be tested programmatically. Possible changes:

- Deploy your application in two regions
- Add a new AWS policy
- Leverage Pulumi ESC to store your AWS credentials
