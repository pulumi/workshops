# Getting started with CI/CD for AWS using Pulumi and GitHub Actions

Last revision: May 2024.

## 🌐 Overview

In this workshop, you will learn the fundamentals of an infrastructure CI/CD pipeline through guided exercises. You will be introduced to Pulumi, an infrastructure-as-code platform that provides modern cloud infrastructure using familiar programming languages.

This workshop introduces new users to DevOps best practices. You will become familiar with the core concepts needed to deploy cloud resources _continuously_. Walk through configuring Pulumi GitHub Actions to deploy AWS resources programmatically and accelerate your cloud projects with the skeleton code provided.

## 🎯 Learning Objectives

- The basics of the Pulumi programming model
- The key components of a continuous pipeline
- How to build your own infrastructure CI/CD pipeline
- Configuring the Pulumi GitHub Actions to deploy AWS resources

## Table of Contents

<!-- TOC start (generated with https://github.com/derlin/bitdowntoc) -->

- [Getting started with CI/CD for AWS using Pulumi and GitHub Actions](#getting-started-with-cicd-for-aws-using-pulumi-and-github-actions)
  - [🌐 Overview](#-overview)
  - [🎯 Learning Objectives](#-learning-objectives)
  - [Table of Contents](#table-of-contents)
  - [🧰 Prerequisites](#-prerequisites)
    - [Pulumi](#pulumi)
    - [GitHub](#github)
    - [AWS](#aws)
  - [**Part I** Define infrastructure as code](#part-i-define-infrastructure-as-code)
    - [🎯 I. Goal](#-i-goal)
    - [📚 I. Concepts](#-i-concepts)
    - [🎬 I. Steps](#-i-steps)
      - [1. Set up a new directory](#1-set-up-a-new-directory)
      - [2. Use a template](#2-use-a-template)
      - [3. (Optional) Explore the program](#3-optional-explore-the-program)
      - [4. Perform your first deployment](#4-perform-your-first-deployment)
  - [**Part II** Automatically deploy the IaC](#part-ii-automatically-deploy-the-iac)
    - [🎯 II. Goal](#-ii-goal)
    - [📚 II. Concepts](#-ii-concepts)
    - [🎬 II. Steps](#-ii-steps)
      - [1. Add version control](#1-add-version-control)
      - [2. Configure Pulumi GitHub Actions](#2-configure-pulumi-github-actions)
      - [3. Create a Pull Request](#3-create-a-pull-request)
  - [(Optional) **Part III** Make a fun PR](#optional-part-iii-make-a-fun-pr)
    - [🎯 III. Goal](#-iii-goal)
    - [💡 III. Suggestions](#-iii-suggestions)
  - [✨ Summary](#-summary)
  - [🚀 Next steps](#-next-steps)

<!-- TOC end -->

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

## **Part I** Define infrastructure as code

### 🎯 I. Goal

Attendees will be able to configure the basics of the Pulumi IaC programming model:

- a project;
- a program; and
- a stack.

### 📚 I. Concepts

The **Pulumi programming model** is centered around defining infrastructure using familiar programming languages.

A **Pulumi template** refers to a configuration and infrastructure-as-code (IaC) project created using the Pulumi programming model so that it may be easily reused. At Pulumi, we have curated a list of [100s of out-of-the-box templates](https://github.com/pulumi/templates) for the most popular providers. These are directly integrated with the CLI via `pulumi new`. Users can also create templates.

### 🎬 I. Steps

You will add cloud infrastructure to a Hello World web app so that it runs in an Amazon S3 with a CloudFront.

#### 1. Set up a new directory

The Pulumi program needs an empty directory. Often, this is a subfolder within your application's repository named something like 'infra'. However, because Pulumi templates are standalone full-working solutions, you'll see the app folder nested.

✅ Create a new project

```bash
mkdir live-workshop && cd live-workshop
```

#### 2. Use a template

You will use a Pulumi template to generate your program's scaffolding.

> [!NOTE]
> The presenter should use the [AWS `IaC-Workshop` account](https://d-9267002f56.awsapps.com/start/#/?tab=accounts) and the workshop's temporary org, i.e. `https://app.pulumi.com/get-started-cicd-aws-gha`
> [!NOTE]
> The presenter should create an `infra-done` version ahead of time and switched to it after getting the live version to start the provisioning of resources. This should not be teared down so the attendees can view it until the trial expires.

✅ Run the following command in your terminal

```bash
# Check you're logged into Pulumi Cloud
$ pulumi whoami
# Provide your access token or press <ENTER> at the prompt to connect to your Pulumi Cloud account

# Check you're logged into AWS
$ aws sso login --profile work

# To walk through the prompts **recommended for learners**
$ mkdir infra && cd infra
$ pulumi new
#   Select template
#   Select static-website-aws-typescript
#   Project name: live-workshop
#   Description: <Enter> to select the default
#   Stack name: dev
#   Select defaults for the remaining prompts
#   Wait a few seconds while dependencies are installed


# Or, using advanced settings
$ pulumi new static-website-aws-typescript --dir infra --template-mode  --stack dev  --name live-workshop --yes --non-interactive
#   Wait a few seconds while dependencies are installed
# Note: The --dir specified will be created if it doesn't exist.
$ cd infra
```

#### 3. (Optional) Explore the program

Each time you create a new Pulumi program, you'll see the following:

1. `Pulumi.yaml` contains the project and top-level configuration settings.
2. A `Pulumi.<stackName>.yaml` file for each stack within your program. This is the stack configuration file, e.g., `Pulumi.dev.yaml`
3. A language-specific Pulumi program entry point. This is `index.ts` in our example.
4. Other language-specific package and dependency files.

For TypeScript, the tree structure is shown below:

```bash
.
├── Pulumi.dev.yaml
├── Pulumi.yaml
├── index.ts
├── node_modules
├── package-lock.json
├── package.json
├── tsconfig.json
└── www

3 directories, 6 files
```

✅ Inspect your `dev` stack.

> [!TIP]
> **Stacks**: Stacks are logical environments within your Pulumi project. Each stack can have its own configuration and resources. For example, you might have a development stack and a production stack within the same project.

```bash
$ cat Pulumi.dev.yaml
config:
  aws:region: us-west-2
  live-workshop:errorDocument: error.html
  live-workshop:indexDocument: index.html
  live-workshop:path: ./www
```

Note the custom config settings we were prompted during the `pulumi new` are stored in the stack file.

✅ Inspect the `index.ts` file to identify its key elements.

> [!TIP]
> **Pulumi program entrypoint**: Your Pulumi program starts with an entry point, typically a function written in your chosen programming language. This function defines the infrastructure resources and configurations for your project.

The key elements in the Pulumi program entry point file are defined below.

- **Providers** are a crucial part of Pulumi's infrastructure as code (IaC) framework, as they enable you to define and deploy resources in your target environment using familiar programming languages. There are over [150+ providers available](https://www.pulumi.com/registry/) that allow you to interact with and manage resources in a specific cloud or infrastructure environment, such as AWS, Azure, or Google Cloud.
- **Configurations**. Pulumi allows you to configure your infrastructure by setting variables. These variables can be set via command-line arguments, environment variables, configuration files (e.g., `Pulumi.dev.yaml`), or secrets. This flexibility makes it easy to manage different configurations for different environments.
- **Resources** represent cloud infrastructure components, like virtual machines, databases, networks, etc. You define resources using constructors specific to the cloud provider you're working with. For instance, in AWS, you might create an S3 bucket resource.
- **Outputs**  You can define outputs in your Pulumi program to expose information about your infrastructure. These outputs can be used for debugging, integration with other services, or to provide information to other parts of your application.

```bash
$ cat -n index.ts
# stdout omitted
```

> [!IMPORTANT]
> **Pulumi is declarative**: Pulumi allows you to define your desired infrastructure state using code in a declarative manner. In a declarative approach to infrastructure management, you **specify what you want** the infrastructure to look like, and the underlying system (Pulumi in this case) takes care of figuring out how to achieve that desired state.

#### 4. Perform your first deployment

✅ Deploy the Pulumi program using the `dev` stack via the terminal:

```bash
# Check your AWS Creds are correctly configured
$ aws configure list
#       Name                    Value             Type    Location
#       ----                    -----             ----    --------
#    profile                <not set>             None    None
# access_key     ****************ZLSR              env
# secret_key     ****************if9v              env
#     region                <not set>             None    None


# A preview of the changes will be printed on the screen **recommended for learners**
$ pulumi up
# Give it a couple of seconds, then
# Select 'yes' to confirm the changes
# Wait a few more seconds for the changes to occur

# Or, using advanced settings to skip the preview
$ pulumi up --yes --skip-preview --non-interactive --stack dev
# Wait a few seconds

🎉 Congratulations 🎉  Your application is now up and running!
```

✅ Access the `originURL` Output to confirm your website is reachable.

```bash
# To view all your stack outputs
$ pulumi stack output
# To view an output
$ pulumi stack output originURL

# Validate the app has a working endpoint!
$ curl $(pulumi stack output originURL)
```

✅ Clean up the resources after we checked things work manually.

```bash
$ pulumi destroy --yes
# Wait a few seconds
```

[**Click here to jump back to the Table of Contents**](#table-of-contents)

## **Part II** Automatically deploy the IaC

In [Part I](#part-i-define-infrastructure-as-code), you manually ran commands using the Pulumi CLI to get your application and cloud infrastructure running. In a DevOps/GitOps fashion, however, you would deploy everything _programmatically_.

![alt text](pipeline-example.png)

### 🎯 II. Goal

Attendees will be able to define and configure the three stages of an infrastructure CI/CD pipeline to deploy changes automatically.

The three stages are depicted in the image below, namely:

1. Define Infrastructure as Code
2. Continuously Test+Commit
3. Continuously Build+Deploy

![App+Infra CI/CD Pipeline](pipeline.svg)

### 📚 II. Concepts

An **infrastructure CI/CD pipeline** is a set of automated processes and tools designed to manage and deploy infrastructure as code (IaC) consistently, efficiently, and reliably. It's an essential part of modern DevOps practices and is used to streamline the provisioning and maintenance of infrastructure resources, such as servers, networks, and cloud services.

> [!NOTE]
> The presenter should have version control set up ahead of time under the `live-workshop` folder.

### 🎬 II. Steps

#### 1. Add version control

✅ Turn your Pulumi project into a GitHub repository:

```bash
# Ensure you're in the project, `live-workshop`, directory
$ cd ../ # if currently in the infra dir.

# Update the owner value to your GitHub handle
$ owner=desteves
$ repo=live-workshop

# Initialize the repository locally
$ git init
# Initialized empty Git repository in .....

# Prepare your first commit
$ echo "**node_modules" >> .gitignore
$ git add .gitignore
$ git commit -m "Initial commit"

# Add the main branch
$ git branch -M main
# Add your remote repo
$ git remote add origin "https://github.com/${owner}/${repo}.git"
# Verify the values
$ git remote -v
# origin  https://github.com/desteves/live-workshop.git (fetch)
# origin  https://github.com/desteves/live-workshop.git (push)

# Login to GitHub, if necessary
$ gh auth login

# Create the repo and push the changes
$ gh repo create "${repo}" --public  --push --source .
# $ git push -u origin main
```

#### 2. Configure Pulumi GitHub Actions

With IaC and version control in place, we are one step closer to defining the infrastructure pipeline. As a next step, we need to add a trigger to run the IaC automatically. We'll use the [Pulumi GitHub Actions](https://github.com/pulumi/actions), responsible for instantiating the infrastructure and running the application.

> [!NOTE]
> The presenter should simulate the steps required to obtain a Pulumi Cloud PAT. Navigate to your [profile settings token page](https://app.pulumi.com/diana-pulumi-corp/settings/tokens). In addition, set the short-term aws credentials by pasting the values from [our accounts page](https://d-9267002f56.awsapps.com/start/#/?tab=accounts)

✅ Add a secret to store your Pulumi access token to be used by Actions.

```bash
# Login to GitHub, if necessary
$ gh auth login

# Create the secret
$ gh secret set PULUMI_ACCESS_TOKEN
# ? Paste your secret ********************************************
# ✓ Set Actions secret PULUMI_ACCESS_TOKEN for ...
```

And let's do the same for the `aws` credentials.

```bash
$ gh secret set AWS_ACCESS_KEY_ID
$ gh secret set AWS_SECRET_ACCESS_KEY
# For short-term credentials, add the session token.
$ gh secret set AWS_SESSION_TOKEN

# Verify it's all there
$ gh secret list
# Press 'q' to exit
```

Next, you will configure the pipeline so it is triggered by commits to PR against the `main` branch. For each commit, the pipeline will automatically:

- Test the IaC by running the `preview` on a PR commit.
- Test the IaC by running the `up` on merge to main.

> [!NOTE]
> The presenter should create the workflow files ahead of time and walk through the contents to save time.

✅ Add your workflow files

```bash
# Ensure you're in the project, `live-workshop`, directory
$ cd ../ # if currently in the infra dir.

$ mkdir -p .github/workflows
$ cd .github/workflows
$ vi branch.yml
#   paste the contents of branch.yml shown below
#   save the file.
$ vi main.yml
```

Alternatively, navigate to the [branch.yml](./solution/.github/workflows/branch.yml) and the [main.yml](./solution/.github/workflows/main.yml) file to copy the contents.

#### 3. Create a Pull Request

✅ Commit all the changes as a PR:

```bash
# Ensure you're in the project, `live-workshop`, directory

# Commit your changes
$ git add .
$ git status
        # new file:   .github/workflows/branch.yml
        # new file:   infra/.gitignore
        # new file:   infra/Pulumi.yaml
        # new file:   infra/index.ts
        # new file:   infra/package-lock.json
        # new file:   infra/package.json
        # new file:   infra/tsconfig.json
        # new file:   infra/www/error.html
        # new file:   infra/www/index.html
$ git commit -m "add cicd"

# Create a new feature branch
$ git checkout -b feature-cicd

# Push the changes
$ git push --set-upstream origin feature-cicd
```

> [!NOTE]
> The presenter should run the above commands ahead of time; create the PR live. In addition have a closed/completed dummy PR for the `infra-done` in case the demo gods aren't cooperaing.

```bash
# Create a PR
$ gh pr create --base main --head feature-cicd --title "Adds IaC + pipeline" --body ""
# Follow the link to see the Actions
```

After creating the PR, the Actions will run shortly.
✅ Navigate and inspect the Actions' results in your browser.

When Actions is running, you see the following in progress message in the PR:
![PR Actions running](pipeline-running.png)

Click on the "Details" link to see the progress. It is usual for this phase to a couple of take minutes.

Once completed, notice all the checks have passed:
![PR Actions completed successfully](checks-passed.png)

✅ Merge the PR

```bash
gh pr merge 1 --squash
```

[**Click here to jump back to the Table of Contents**](#table-of-contents)

## (Optional) **Part III** Make a fun PR

At this point, you have

- a GitHub repository with a sample web application;
- AWS resources using Pulumi IaC; and
- a CI/CD pipeline to test any change automatically.

We want to encourage you to modify your solution and watch the changes take effect programmatically.

### 🎯 III. Goal

Attendees will be able to practice enhancing the infrastructure CI/CD pipeline.

### 💡 III. Suggestions

- Make an application change to print the current Unix time when visiting the index.html page.
  <details>
    <summary>🧩 Click here for a hint </summary>
    Add the following to the body section of your index.html file:

    ```html
    <span id="timestamp"></span></p>
    <script>
        var unixTimestamp = Math.floor(Date.now() / 1000);
        document.getElementById("timestamp").textContent = unixTimestamp;
      </script>
    ```

  </details>

- Make an infrastructure change to deploy the application in another AWS region.
  <details>
    <summary>🧩 Click here for a hint </summary>
    In the Pulumi CLI, we'd run the following:
    ```bash
    pulumi config set aws:region us-east-1
    ```
  </details>

- Make a pipeline change to destroy the `dev` stack upon successfully merging to the `main` branch.
  <details>
    <summary>🧩 Click here for a hint </summary>
    To set up a GitHub Action workflow that runs only when merging to the main branch:

    ```yaml
    name: main
    on:
      push:
        branches:
          - main
    ```

    In the Pulumi CLI, we'd run the following:

    ```bash
    pulumi destroy -s dev
    ```

    Now, use the Pulumi GitHub Actions to achieve the same result. Here is some helper code:

    ```yaml
      jobs:
        pulumi-destroy:
          name: pulumi-destroy
          runs-on: ubuntu-latest
          steps:
            - uses: actions/checkout@v3

            - name: Set up Node.js 18
              uses: actions/setup-node@v4
              with:
                node-version: 18

            - name: Install Dependencies
              working-directory: ./infra
              run: npm install

            - uses: pulumi/actions@v5
              with:
                command:  ?????????
                stack-name: ??????????
                work-dir: ./infra
              env:
                PULUMI_ACCESS_TOKEN: ${{ secrets.PULUMI_ACCESS_TOKEN }}
    ```

  </details>

 > [!NOTE]
> The advanced workshop will cover Pulumi ESC in a lot more detail.

- (Advanced) Uses Pulumi ESC to connect to your AWS account via OIDC.
  <details>
    <summary>🧩 Click here for a hint </summary>
    Add a reference to an ESC environment in your stack file:

    ```yaml
    environment:
    - pulumi-live-workshop
    ```

    And, ensure the pulumi-live-workshop includes AWS OIDC creds:

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
        aws:region: "us-east-1"
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

      The api.pulumi.com/oidc Identity provider must also exist with your Pulumi Cloud org as an audience.
  </details>

> [!TIP]
> To see all the above suggestions, check out the [🏁 solution](./solution/) folder.

## ✨ Summary

In this workshop, you incrementally worked through creating an infrastructure CI/CD pipeline. In Part 1, you learned the Pulumi IaC programming model basics by developing and deploying a Pulumi template containing Amazon S3 and CloudFront resources. In Part 2, you added version control and a continuous test that previews your infrastructure. You built your pipeline using GitHub Actions and modified it to validate commits using a Pulumi `dev` stack. You had hands-on experience across the three major elements of an infrastructure CI/CD pipeline. Lastly, Part 3 encouraged you to introduce a change to the application, infrastructure, or pipeline and watch changes be automatically applied.

## 🚀 Next steps

Ready for more? Follow the [Advanced CI/CD for AWS using Pulumi and GitHub Actions](../aws-advanced-cicd/) to take your infrastructure pipeline to the next level with AWS Policies, Secrets Management, Drift Detection, and Review Stacks.

[**Click here to jump back to the Table of Contents**](#table-of-contents)
