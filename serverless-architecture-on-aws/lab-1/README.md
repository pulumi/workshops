# Lab 1: Getting started with Pulumi Templates

## Create a directory

To get started, we need a directory. Run these two commands in your terminal:

```bash
mkdir my-serverless-app && cd my-serverless-app
```

## Initialise your project

We're using the AWS Serverless Application template:

```bash
pulumi new serverless-aws-typescript
```

## Inspect your project

Let's take a look at what we've created

## Deploying your serverless app

Run the following command:

```bash
pulumi up
```

Select `yes` to continue

## Viewing the results

Run the following to view the output:

```bash
pulumi stack output url
```

Copy link and paste into browser

Run the following:

```bash
curl $(pulumi stack output url)/date
```

## Tidy up

Run the following command to remove resources:

```bash
pulumi destroy
```

## Moving on

Let's continue to [lab 2](https://github.com/pulumi/workshops/tree/main/serverless-architecture-on-aws/lab-2).