# Getting started with CI/CD using Pulumi GitHub Actions

In this workshop, you will learn the fundamentals of an infrastructure ci/cd pipeline through guided exercises. You will be introduced to Pulumi, a infrastructure-as-code platform designed to provision modern cloud infrastructure using familiar programming languages.

This workshop introduces new users to DevOps best practices. You will become familiar with the core concepts needed to deploy cloud resources _continuously_. We will guide you through the use Pulumi GitHub Actions to deploy AWS resources programmatically. Accelerate your cloud projects with the skeleton code provided.

## Learning Objectives

- The basics of the Pulumi programming model
- The key components of a continuous pipeline
- How to build your own infrastructure CI/CD pipeline
- Use Pulumi GitHub Actions to deploy AWS resources

## Table of Contents 
   * [Prerequisites](#prerequisites)
      * [Pulumi](#pulumi)
      * [GitHub](#github)
      * [AWS](#aws)
   * [Part 0 - Set up the demo application](#part-0---set-up-the-demo-application)
   * [Part 1 - Using the Pulumi template](#part-1---using-the-pulumi-template)
      * [Make a new directory](#make-a-new-directory)
      * [Using a template](#using-a-template)
      * [Explore the code](#explore-the-code)
      * [First deployment](#first-deployment)
   * [Part 2 - Improving our deployment](#part-2---improving-our-deployment)
      * [Add secrets to your GitHub repo](#add-secrets-to-your-github-repo)
      * [Add Pulumi GitHub Actions](#add-pulumi-github-actions)
      * [Create a PR](#create-a-pr)
      * [Review the Workflow](#review-the-workflow)
      * [Merge the PR](#merge-the-pr)
   * [Part 3 - Add a policy PR](#part-3---add-a-policy-pr)
      * [Modify the Repo](#modify-the-repo)
      * [Deployment update](#deployment-update)
   * [(Optional) Part 4 - Make a fun change!](#optional-part-4---make-a-fun-change)

## Prerequisites

To go through this workshop with us, here is what you need

### Pulumi

1. A Pulumi Cloud account, head to [app.pulumi.com](https://app.pulumi.com/signup/?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops) and follow the sign-up process.
2. An [access token](https://www.pulumi.com/docs/intro/pulumi-service/accounts/#access-tokens?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops) from your Pulumi Cloud account.
3. The [Pulumi CLI]((https://www.pulumi.com/docs/get-started/install/?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops)) installed in your development environment.

### GitHub

1. A [GitHub](https://github.com/join) account.
2. The [GitHub CLI](https://cli.github.com/), [`gh`](https://cli.github.com/), installed in your development environment.

### AWS

1. The [`aws` CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) installed in your development environment.
2. [Set up your local AWS credentials](https://www.pulumi.com/registry/packages/aws/installation-configuration/#credentials).

## Part 0 - Set up the demo application

We will likely need a step here to fork the sample app first and show the app running locally, sans infra.

todo-todo-todo todo-todo-todo todo-todo-todo

## Part 1 - Using the Pulumi template

We'll add cloud infrastructure to test out sample application.

### Make a new directory

```bash
mkdir infra && cd infra
```

### Using a template

We're going to use a template to generate our program's scaffolding. Run the following command in your terminal.

```bash

pulumi new todo-todo-todo
```

### Explore the code

Each time you create a new Pulumi program, you'll see the following files:

1. `Pulumi.yaml` contains the project and top-level configuration
2. `Pulumi.<stackName>.yaml` is the stack configuration file, e.g., `Pulumi.dev.yaml`
3. `index.ts` is your Pulumi program entrypoint.

### First deployment

Let's deploy our Pulumi program.

```bash
# If not logged in, run
$ pulumi login
# Provide your access token at the prompt to connect to your Pulumi Cloud account


# A preview of the changes will be printed on the screen
$ pulumi up
# Select 'yes' to confirm the changes and wait a few seconds


# After completion, view the url via
$ pulumi stack output url
```

Access the `url` to confirm your website is accessible.

```bash
$ curl $(pulumi stack output url)
```

## Part 2 - Improving our deployment

We have manually run commands to get our application's cloud infrastructure up and running. In a DevOps fashion, however, we would instantiate the infrastructure programmatically. We will add an infrastructure pipeline to our repo using GitHub Actions.

### Add secrets to your GitHub repo

Let's add our Pulumi token.

```ts
todo-todo-todo
```

And let's do the same for the `aws` credentials

```ts
todo-todo-todo
```

### Add Pulumi GitHub Actions

TODO-TODO-TODO

```ts
todo-todo-todo
```

### Create a PR

TODO-TODO-TODO

```ts
todo-todo-todo
```

### Review the Workflow

TODO-TODO-TODO

```ts
todo-todo-todo todo-todo-todo
```

### Merge the PR

TODO-TODO-TODO

```bash
todo-todo-todo
```

## Part 3 - Add a policy PR

By adding a default policy pack, our workflow will automatically ensure we're not violating any cloud infrastructure best practices.

### Modify the Repo

// Create a branch, add the policy.

// Modify the workflow file.

// Test locally && clean up

```bash
pulumi up // add policy commands

pulumi destroy

```

// Commit a new PR

### Deployment update

Let's review our changes.

```bash
pulumi preview --diff
```

Everything looks good; we're now ready to commit our changes in a PR.

## (Optional) Part 4 - Make a fun change!

At this point, you have completed this workshop. You have 
- a GitHub repository with a sample application; 
- AWS cloud infrastructure defined as code; and
- a CI/CD pipeline to test any change automatically. 

We encourage you to modify your app or infra and watch the changes be tested programmatically. Possible changes:

- Add a new API endpoint to your application
- Add a `test` stack to the Pulumi program
- Modify an AWS policy
