# Advanced CI/CD for AWS using Pulumi and GitHub Actions

> [!IMPORTANT]  
> This is an advanced workshop that builds upon the [Getting started worksop](../aws-getting-started-cicd/). Please ensure its completion prior to proceeding.

In this workshop, you will learn advanced topics that make up a robust infrastructure CI/CD pipeline through guided exercises. You will use Pulumi tooling to take your cloud infrastructure pipeline one step closer to production.

This workshop introduces users to advanced DevOps best practices. You will add compliance checks via policies, drift detection, and isolated test environments to an existing GitHub Actions pipeline. This will help accelerate your AWS projects with the code examples provided.

## Learning Objectives

- Learn how to build an advanced CI pipeline to enforce compliance and correct drift.
- Add policy checks to test your infrastructure before each deployment.
- Add a cron job to the pipeline to check for changes periodically (drift)
- Configure a dedicated cloud environment with Review Stacks

## Table of Contents 

* [Prerequisites](#prerequisites)
    * [Pulumi](#pulumi)
    * [GitHub](#github)
    * [AWS](#aws)
* [Part 1 - Set up your GitHub project](#part-1---set-up-your-github-project)
* [Part 2 - Add compliance with Policy as Code](#part-2---add-compliance-with-policy-as-code)
    * [Modify the Repo](#modify-the-repo)
* [Part 3 - Add drift detection](#part-3---add-drift-detection) 
<!-- * [Part 3 - Store secret credentials in Pulumi ESC](#part-3---store-secret-credentials-in-pulumi-esc) -->
* [Part 4 - Add dedicated environments with Review Stacks](#part-4---add-dedicated-environments-with-review-stacks)
* [Next Steps](#next-steps)

## Prerequisites

To go through this workshop with us, here is what you need

### Pulumi

1. Get a free Pulumi Cloud account at [app.pulumi.com](https://app.pulumi.com/signup/?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops) and follow the sign-up process.
2. An [access token](https://www.pulumi.com/docs/intro/pulumi-service/accounts/#access-tokens?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops) from your Pulumi Cloud account.
3. The [Pulumi CLI]((https://www.pulumi.com/docs/get-started/install/?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops)) installed in your development environment.

### GitHub

1. A [GitHub](https://github.com/join) account.
2. The [GitHub CLI](https://cli.github.com/), [`gh`](https://cli.github.com/), installed in your development environment.
3. [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) installed in your development environment.

### AWS

1. The [`aws` CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) installed in your development environment.
2. [Set up your local AWS credentials](https://www.pulumi.com/registry/packages/aws/installation-configuration/#credentials).

## Part 1 - Set up your GitHub project

This workshop picks up right were the Getting Started workshop left off, so we'll start with a sample application and basic infra pipeline.

## Part 2 - Add compliance with Policy as Code

By adding a default policy pack, our workflow will automatically ensure we're not violating any cloud infrastructure best practices.

### Modify the Repo

// Create a branch, add the policy.

// Modify the workflow file.

// Test locally && clean up

Let's review our changes.

Everything looks good; we're now ready to commit our changes in a PR.

// Commit a new PR

## Part 3 - Add drift detection

// Create a branch, 

// add the cron job workflow

// commit && PR

## Part 4 - Add dedicated environments with Review Stacks


## Next Steps

At this point, you have completed this workshop. You have 
- a GitHub repository with a sample application; 
- AWS cloud infrastructure defined as code; and
- a robust clodu infrastructire CI/CD pipeline to test any change automatically. 

We encourage you to modify your app or infra and watch the changes be tested programmatically. Possible changes:

- Deploy your application in two regions
- Add a new AWS policy
- Leverage Pulumi ESC to store your AWS credentials
