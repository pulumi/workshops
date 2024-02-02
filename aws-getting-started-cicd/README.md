# Getting started with CI/CD for AWS using Pulumi and GitHub Actions

Last revision: February 2024.

## 🌐 Overview

In this workshop, you will learn the fundamentals of an infrastructure CI/CD pipeline through guided exercises. You will be introduced to Pulumi, an infrastructure-as-code platform that provides modern cloud infrastructure using familiar programming languages.

This workshop introduces new users to DevOps best practices. You will become familiar with the core concepts needed to deploy cloud resources _continuously_. Walk through configuring Pulumi GitHub Actions to deploy AWS resources programmatically and accelerate your cloud projects with the skeleton code provided.

## 🎯 Learning Objectives 

- The basics of the Pulumi programming model
- The key components of a continuous pipeline
- How to build your own infrastructure CI/CD pipeline
- Configuring the Pulumi GitHub Actions to deploy AWS resources

## Table of Contents  

* [🧰 Prerequisites](#-prerequisites)
* [<strong>Part 1</strong> Define infrastructure as code](#part-1-define-infrastructure-as-code)
    * [🎯 Goal](#-goal)
    * [📚 Concepts](#-concepts)
    * [🎬 Steps](#-steps)
        * [1. Set up a new directory](#1-set-up-a-new-directory)
        * [2. Use a template](#2-use-a-template)
        * [3. (Optional) Explore the program](#3-optional-explore-the-program)
        * [4. Perform your first deployment](#4-perform-your-first-deployment)
* [<strong>Part 2</strong> Automatically deploy the IaC](#part-2-automatically-deploy-the-iac)
    * [🎯 Goal](#-goal-1)
    * [📚 Concepts](#-concepts-1)
    * [🎬 Steps](#-steps-1)
        * [1. Add version control](#1-add-version-control)
        * [2. Configure Pulumi GitHub Actions](#2-configure-pulumi-github-actions)
        * [3. Create a Pull Request](#3-create-a-pull-request)
* [(Optional) <strong>Part 3</strong> Make a fun PR!](#optional-part-3-make-a-fun-pr)
    * [🎯 Goal](#-goal-2)
    * [💡 Suggestions](#-suggestions)
* [✨ Summary](#-summary)
* [🚀 Next steps](#-next-steps)


## 🧰 Prerequisites

To go through this workshop with us, here is what you need

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

## **Part 1** Define infrastructure as code

### 🎯 Goal

Attendees will be able to configure the basics of the Pulumi programming model:
* project; 
* program; and
* stack in Pulumi.

### 📚 Concepts

The *Pulumi programming model* is centered around defining infrastructure using familiar programming languages. 

A *Pulumi template* refers to a configuration and infrastructure-as-code (IaC) project created using the Pulumi programming model so that it may be easily reused. At Pulumi, we have curated a list of 100s of out-of-the-box templates for the most popular providers at https://github.com/pulumi/templates. These are directly integrated with the CLI via `pulumi new`. Users can also create templates.

### 🎬 Steps

You will add cloud infrastructure to a Hello World web app so that it runs in an Amazon S3 with a CloudFront.

#### 1. Set up a new directory

The Pulumi program needs an empty directory. Often, this is a subfolder within your application's repository named something like 'infra'. However, because Pulumi templates are standalone full-working solutions, you'll see the app folder nested. 

✅ Create a project

```bash
mkdir cicd-workshop && cd cicd-workshop
```

#### 2. Use a template

You will use a Pulumi template to generate your program's scaffolding. 

✅ Run the following command in your terminal

```bash
# Check you're logged into Pulumi Cloud
$ pulumi whoami
# Provide your access token or press <ENTER> at the prompt to connect to your Pulumi Cloud account


# To walk through the prompts
$ mkdir infra && cd infra
$ pulumi new
#   Select 'template'
#   Select `static-website-aws-typescript`
#   Project name: cicd-workshop   
#   Description: <Enter> to select the default
#   Stack name: local
#   Select defaults for the remaining prompts


# Or, using advance settings
$ pulumi new static-website-aws-typescript --dir infra --template-mode  --stack local  --name cicd-workshop --yes --non-interactive
# Note: The --dir specified will be created if it doesn't exist.
$ cd infra
```

#### 3. (Optional) Explore the program

Each time you create a new Pulumi program, you'll see the following:

1. `Pulumi.yaml` contains the project and top-level configuration settings.
2. A `Pulumi.<stackName>.yaml` file for each stack within your program. This is the stack configuration file, e.g., `Pulumi.local.yaml`
3. A language-specific Pulumi program entry point. This is `index.ts` in our example.
4. Other language-specific package and dependency files. 

For TypeScript, the tree structure is shown below:

```bash
.
├── Pulumi.local.yaml
├── Pulumi.yaml
├── index.ts
├── node_modules
├── package-lock.json
├── package.json
├── tsconfig.json
└── www

3 directories, 6 files
```

✅ Inspect your `local` stack.

> [!TIP] 
> *Stacks*: Stacks are logical environments within your Pulumi project. Each stack can have its own configuration and resources. For example, you might have a development stack and a production stack within the same project.

```bash
$ cat Pulumi.local.yaml        
config:
  aws:region: us-west-2
  cicd-workshop:errorDocument: error.html
  cicd-workshop:indexDocument: index.html
  cicd-workshop:path: ./www
```


✅ Inspect the `index.ts` file to identify its key elements.

> [!TIP] 
> *Pulumi program entrypoint*: Your Pulumi program starts with an entry point, typically a function written in your chosen programming language. This function defines the infrastructure resources and configurations for your project.

The key elements in the Pulumi program entry point file are defined below.

* **Providers** are a crucial part of Pulumi's infrastructure as code (IaC) framework, as they enable you to define and deploy resources in your target environment using familiar programming languages. There are over [150+ providers available](https://www.pulumi.com/registry/) that allow you to interact with and manage resources in a specific cloud or infrastructure environment, such as AWS, Azure, or Google Cloud. 
* **Configurations**. Pulumi allows you to configure your infrastructure by setting variables. These variables can be set via command-line arguments, environment variables, configuration files (e.g., `Pulumi.local.yaml`), or secrets. This flexibility makes it easy to manage different configurations for different environments.
* **Resources** represent cloud infrastructure components, like virtual machines, databases, networks, etc. You define resources using constructors specific to the cloud provider you're working with. For instance, in AWS, you might create an S3 bucket resource.
* **Outputs**  You can define outputs in your Pulumi program to expose information about your infrastructure. These outputs can be used for debugging, integration with other services, or to provide information to other parts of your application. 

```bash
$ cat -n index.ts
# stdout omitted
```

> [!IMPORTANT] 
> *Pulumi is declarative*: Pulumi allows you to define your desired infrastructure state using code in a declarative manner. In a declarative approach to infrastructure management, you **specify what you want** the infrastructure to look like, and the underlying system (Pulumi in this case) takes care of figuring out how to achieve that desired state.

#### 4. Perform your first deployment

✅ Deploy the Pulumi program using the `local` stack via the terminal:

```bash
# Check your AWS Creds are correctly configured
$ aws configure list

# A preview of the changes will be printed on the screen
$ pulumi up
# Select 'yes' to confirm the changes and wait a few seconds

# Or, using advanced settings to skip the preview
$ pulumi up --yes --skip-preview --non-interactive --stack local
# Wait a few seconds

🎉 Congratulations 🎉  Your application is now up and running!
```

✅ Access the `originURL` Output to confirm your website is accessible.

```bash
# To view all your stack outputs
$ pulumi stack output 
# To view an output
$ pulumi stack output originURL

# Validate the app has a working endpoint!
$ curl $(pulumi stack output originURL)
```

✅ Clean up the resources

```bash
$ pulumi destroy --yes
# Wait a few seconds
```

[**Click here to jump back to the Table of Contents**](#table-of-contents)

## **Part 2** Automatically deploy the IaC
 
In [Part 1](#part-1-define-infrastructure-as-code), you manually ran commands using the Pulumi CLI to get your application and cloud infrastructure running. In a DevOps fashion, however, you would deploy everything *programmatically*. 

### 🎯 Goal

Attendees will be able to define and configure the three stages of an infrastructure CI/CD pipeline to deploy changes automatically.

The three stages are depicted in the image below, namely:

1. Define Infrastructure as Code
2. Continuously Test+Commit
3. Continuously Build+Deploy

![App+Infra CI/CD Pipeline](pipeline.svg)

### 📚 Concepts

An **infrastructure CI/CD pipeline** is a set of automated processes and tools designed to manage and deploy infrastructure as code (IaC) consistently, efficiently, and reliably. It's an essential part of modern DevOps practices and is used to streamline the provisioning and maintenance of infrastructure resources, such as servers, networks, and cloud services. 

### 🎬 Steps

#### 1. Add version control

✅ Turn your Pulumi project into a GitHub repository:

```bash
# Ensure you're in the project, `cicd-workshop`, directory
$ cd ../cicd-workshop # if currently in the infra dir.

# Update these variables
$ owner=desteves
$ repo=cicd-workshop

# Initialize the repository
$ git init
$ git remote add origin https://github.com/${owner}/${repo}.git
$ git branch -M main
$ git push -u origin main

# Prepare first commit
$ git touch .gitignore
$ echo "**node_modules" >> .gitignore
$ echo "infra/Pulumi.local.yaml" >> .gitignore
$ git add .gitignore
$ git commit -m "Initial commit"
$ git push -u origin main
```

#### 2. Configure Pulumi GitHub Actions

With IaC and version control in place, we are one step closer to defining the infrastructure pipeline. As a next step, we need to add a trigger to run the IaC automatically. We'll use the [Pulumi GitHub Actions](https://github.com/pulumi/actions), responsible for instantiating the infrastructure and running the application. 

✅ Add a secret to store your Pulumi access token to be used by Actions.

```bash
# Login to GitHub
$ gh auth login

# Create the secret
$ gh secret set PULUMI_ACCESS_TOKEN -b pul-abcdef1234567890abcdef1234567890abcdef12

# Verify it's there
$ gh secret list
```

And let's do the same for the `aws` credentials. If you have short-term credentials, add the session token.

```bash
$ gh secret set AWS_ACCESS_KEY_ID -b abc123
$ gh secret set AWS_SECRET_ACCESS_KEY -b abc123
$ gh secret list
```

Next, configure the pipeline to be triggered by changes to a PR against the main branch. A commit will automatically:
- Verify the Pulumi secret is configured; and
- Test the IaC by creating a `test` stack.

✅ Add a workflow

```bash
# Ensure you're in the project, `cicd-workshop`, directory
$ cd ../cicd-workshop # if currently in the infra dir.

$ mkdir -p .github/workflows
$ cd .github/workflows
$ vi pipeline.yml
# paste the contents below
# update `stack-name`
# save the file.
```

```yaml
# Contents of pipeline.yml
name: pipeline

on:
  pull_request:
    branches: [ "main" ]

  workflow_dispatch:

jobs:
  check-secret:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Check if secret exists
        run: |
            if [ -n "${{ secrets.PULUMI_ACCESS_TOKEN }}" ]; then
            echo "Found Pulumi access token. Proceeding with workflow..."
            else
            echo "Pulumi access token does not exist. Aborting workflow..."
            exit 1
            fi
  pulumi-up:
    name: pulumi-up
    needs: check-secret
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js 18
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install Dependencies
        working-directory: ./infra
        run: npm install

      - uses: pulumi/actions@v5
        with:
          command: up
          stack-name: diana-pulumi-corp/cicd-workshop/test # UPDATE THIS
          work-dir: ./infra
        env:
          PULUMI_ACCESS_TOKEN: ${{ secrets.PULUMI_ACCESS_TOKEN }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

#### 3. Create a Pull Request

✅ Commit all the changes as a PR:

```bash
# Commit your changes
$ git add .
$ git commit -m "add cicd"

# Create a new feature branch
$ git checkout -b feature-cicd

# Create a PR as a draft
$ gh pr create --base main --head feature-cicd --title "Adds a IaC CI/CD pipeline" --body "" --draft 
## wait a couple of minutes for Actions to run.
```

After creating the PR, the Actions will run shortly. 

✅ Navigate and inspect the Actions' results in your browser.

TODO: Add a screenshot

✅ Merge the PR 

```bash
$ gh pr merge 1
```

[**Click here to jump back to the Table of Contents**](#table-of-contents)

## (Optional) **Part 3** Make a fun PR!

At this point, you have 

- a GitHub repository with a sample web application; 
- AWS resources using Pulumi IaC; and
- a CI/CD pipeline to test any change automatically. 

We want to encourage you to modify your solution and watch the changes take effect programmatically.

### 🎯 Goal

Attendees will be able to practice enhancing the infrastructure CI/CD pipeline.

### 💡 Suggestions

- Make an application change to print the current Unix time when visiting the index.html page.
  <details>
    <summary>🧩 Click here for a hint </summary>
    Add the following to the `<body>` section of your `index.html` file:

    ```html
    <span id="timestamp"></span></p>
    <script>
        var unixTimestamp = Math.floor(Date.now() / 1000);
        document.getElementById("timestamp").textContent = unixTimestamp;
      </script>
    ```

  </details>

- Make an infrastructure change to the application in another AWS region.
  <details>
    <summary>🧩 Click here for a hint </summary>
    In the Pulumi CLI, we'd run the following:
    `pulumi config set aws:region us-west-2`
  </details>

- Make a pipeline change to destroy the `test` stack upon successfully merging to the `main` branch.
  <details>
    <summary>🧩 Click here for a hint </summary>
    To set up a GitHub Action workflow that runs only when merging to the main branch, you can use the `on` configuration to specify the event triggers and the `if` condition to control when the workflow should execute. Here's an example workflow YAML file:

    ```yaml
    name: on-merge
    on:
      push:
        branches:
          - main
    ```

    In the Pulumi CLI, we'd run the following:
    `pulumi destroy -s test`
    Now, use the Pulumi GitHub Actions to achieve the same result.
  </details>

- (Advanced) Uses Pulumi ESC to dynamically auth against AWS via OIDC. 
  > [!NOTE]
  > The Advance workshop will cover this in more details.

  <details>
    <summary>🧩 Click here for a hint </summary>
    Add a reference to an ESC environment in your stack file:
   
    ```yaml
    environment:
    - pulumi-cicd-workshop
    ```

    And, ensure the `pulumi-cicd-workshop` is defined for AWS OIDC creds:
    ```yaml
    values:
      aws:
        login:
          fn::open::aws-login:
            oidc:
              duration: 1h
              roleArn: arn:aws:iam::123123123123:role/pulumi-environments-oidc
              sessionName: pulumi-environments-session
      environmentVariables:
        AWS_ACCESS_KEY_ID: ${aws.login.accessKeyId}
        AWS_SECRET_ACCESS_KEY: ${aws.login.secretAccessKey}
        AWS_SESSION_TOKEN: ${aws.login.sessionToken}
      pulumiConfig:
        aws:region: "us-west-2"
    ```

    In AWS, ensure the `roleArn` exists. Example:
    ```json
    {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Federated": "arn:aws:iam::123123123123:oidc-provider/api.pulumi.com/oidc"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringEquals": {
                    "api.pulumi.com/oidc:aud": [
                        "pulumi",
                        "diana-pulumi-corp"
                            ]
                        }
                    }
                }
            ]
        }
      ```
      The `api.pulumi.com/oidc` Identity provider must also exist with your Pulumi Cloud org as an audience.
  </details>

> [!TIP]
> To see all the above suggestions, check out the [🏁 solution](./solution/) folder.

## ✨ Summary

In this workshop, you incrementally worked through creating an infrastructure CI/CD pipeline. In Part 1, you learned the Pulumi IaC programming model basics by developing and deploying a Pulumi template containing Amazon S3 and CloudFront resources. In Part 2, you added version control and a continuous test that deploys your infrastructure. You built your pipeline using GitHub Actions and modified it to validate commits using a Pulumi `test` stack. You had hands-on experience across the three major elements of an infrastructure CI/CD pipeline. Lastly, Part 3 encouraged you to introduce a change to the application, infrastructure, or pipeline and watch changes be automatically applied.

## 🚀 Next steps

Ready for more? Follow the [Advanced CI/CD for AWS using Pulumi and GitHub Actions](../aws-advanced-cicd/) to take your infrastructure pipeline to the next level with AWS Policies, Secrets Management, Drift Detection, and Review Stacks.

[**Click here to jump back to the Table of Contents**](#table-of-contents)
