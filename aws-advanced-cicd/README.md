# Advanced CI/CD for AWS using Pulumi and GitHub Actions

Last revision: February 2024.

> [!IMPORTANT]  
> This is an advanced workshop that builds upon the [Getting Started workshop](../aws-getting-started-cicd/). Please make sure it's finished before proceeding.

In this workshop, you will learn advanced topics that make up a robust infrastructure CI/CD pipeline through guided exercises. You will use Pulumi tooling to take your cloud infrastructure pipeline one step closer to production.

This workshop introduces users to advanced DevOps best practices. You will add compliance checks via policies, drift detection, and isolated test environments to an existing GitHub Actions pipeline. This will help accelerate your AWS projects with the code examples provided.

## Learning Objectives

- Learn how to build an advanced CI pipeline to enforce compliance and correct drift.
- Add dynamic credentials to your stack by configuring Pulumi ESC.
- Add policy checks to test your infrastructure before each deployment.
- Add a cron job to the pipeline to check for changes periodically (drift)
- Configure a dedicated cloud environment with Review Stacks

## Table of Contents 

<!-- https://derlin.github.io/bitdowntoc/ -->
* [🧰 Prerequisites](#-prerequisites)
* [**Part 1** Set up your GitHub project with Pulumi ESC](#part-1-set-up-your-github-project-with-pulumi-esc)
  + [🎯 Goal](#-goal)
  + [📚 Concepts](#-concepts)
  + [🎬 Steps](#-steps)
* [**Part 2** Add compliance with Policy as Code](#part-2-add-compliance-with-policy-as-code)
  + [🎯 Goal](#-goal-1)
  + [📚 Concepts](#-concepts-1)
  + [🎬 Steps](#-steps-1)
* [**Part 3** Add drift detection](#part-3-add-drift-detection)
  + [🎯 Goal](#-goal-2)
  + [📚 Concepts](#-concepts-2)
  + [🎬 Steps](#-steps-2)
* [**Part 4** Add dedicated environments with Review Stacks](#part-4-add-dedicated-environments-with-review-stacks)
  + [🎯 Goal](#-goal-3)
  + [📚 Concepts](#-concepts-3)
  + [🎬 Steps](#-steps-3)
* [✨ Summary](#-summary)
* [🚀 Next steps](#-next-steps)

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

## **Part 1** Set up your GitHub project with Pulumi ESC

This workshop picks up right where the [Getting Started](../aws-getting-started-cicd/) workshop left off, so we'll start with a sample application and a basic pipeline.

### 🎯 Goal

Attendees will be able to authenticate using Dynamic Credentials by adding a Pulumi ESC Environment with an AWS OIDC configuration.

### 📚 Concepts

*Dynamic Credentials* Unlike static credentials, which remain constant over time, dynamic credentials are generated on-the-fly and have a short validity period, enhancing security by reducing the risk of unauthorized access from credential theft or misuse. It also eliminates the need for developers to manage the lifecycle of individual access keys for instances.

*OIDC* OpenID Connect (OIDC) is an authentication protocol built on top of the OAuth 2.0 framework. enables clients to authenticate users with a high degree of confidence while supporting single sign-on (SSO) and other identity-related functionalities such 

*Pulumi ESC* Pulumi ESC enables you to define environments, which contain collections of secrets and configuration. Each environment can be composed from multiple environments. An environment may be used to store dynamic credentials from an OIDC IdP such as Pulumi Cloud to connect to your AWS.


### 🎬 Steps

✅ Clone the Getting Started workshop solution

```bash
# Update the owner value to your GitHub handle
$ owner=desteves 
$ repo=cicd-workshop-advanced

# Login to GitHub, if necessary
$ gh auth login

# Clone the Getting Started repo to ${repo}
$ gh repo clone desteves/cicd-workshop "${repo}"

# Create your own repo
$ gh repo create "${repo}" --public
$ cd "${repo}"

# Add your remote repo
$ git remote set-url origin "https://github.com/${owner}/${repo}.git"

# Push your clone
$ git push -u origin main
```

✅ Add a secret to store your Pulumi access token to be used by Actions.

```bash
# Login to GitHub, if necessary
$ gh auth login

# Create the secret
$ gh secret set PULUMI_ACCESS_TOKEN -b pul-abcdef1234567890abcdef1234567890abcdef12
# ✓ Set Actions secret PULUMI_ACCESS_TOKEN ...

# Verify it's there
$ gh secret list
# Press 'q' to exit
```

✅ Use a Pulumi ESC Environment to configure AWS Dynamic Credentials

```bash
# Ensure you're in the project, `cicd-workshop-advanced/infra`, directory

# Use a Pulumi template to create AWS OIDC Resources
$ pulumi new https://github.com/desteves/aws-oidc-typescript/infra --dir aws-oidc
# Go through the wizard and update the defaults as necessary

$ pulumi up --yes --cwd aws-oidc
# wait for the resources to get created; this can take a couple of minutes

# Obtain the name of the ESC Environment
$ e=$(pulumi stack output escEnv --cwd aws-oidc)

# Add the ESC Environment to your Stack
$ echo "environment:" >> Pulumi.test.yaml
$ echo "  - ${e}" >> Pulumi.test.yaml

# Test the changes locally
$ pulumi preview
```

<!-- Note to presenter: run pulumi up ahead to save time. -->

✅ Commit the changes 

```bash
# Ensure you're in the project, `cicd-workshop-advanced`, directory

# Commit your changes
$ git add .
$ git commit -m "add esc"

# Create a new feature branch
$ git checkout -b feature-esc

# Push the changes
$ git push --set-upstream origin feature-esc

# Create a PR 
$ gh pr create --base main --head feature-esc --title "Adds Pulumi ESC for AWS OIDC" --body ""
# Follow the link to see the Actions
# It can take a few minutes for the GHA Runner to complete

# Merge the PR 
# Update the PR merge number as needed
$ m=1  
$ gh pr merge $m --squash

$ git checkout main
```
<!-- EXAMPLE https://github.com/desteves/cicd-workshop-advanced/pull/1 -->

[**Click here to jump back to the Table of Contents**](#table-of-contents)

## **Part 2** Add compliance with Policy as Code

### 🎯 Goal

Attendees will be able to add compliance checks to the CI/CD pipeline using [Pulumi CrossGuard](https://www.pulumi.com/crossguard/).

### 📚 Concepts

*Cloud compliance* 

*Policy as Code*

*Built-in packs*

### 🎬 Steps

By adding a default policy pack, your workflow will automatically ensure your stack is not violating any cloud infrastructure best practices.

✅ Add the CIS compliance framework

```bash
# Ensure you're in the project, `cicd-workshop-advanced/infra`, directory

# Add the policy under the policypack/ folder
$ pulumi policy new aws-cis-compliance-policies-typescript  --dir policypack

# Add deps for GHA
$ cd policypack
$ npm install @pulumi/policy @pulumi/compliance-policy-manager @pulumi/aws-compliance-policies
$ pulumi up
$ cd ../

# Test locally 
$ pulumi up  --policy-pack policypack 
# Policies:
#    ✅ aws-cis-compliance-ready-policies-typescript@v0.0.1 (local: policypack)

# Modify the workflow file to test programmatically
$ vi .github/workflows/branch.yml
#   edit the last step as shown below
#   save the file.
```

`branch.yml` code snippet:
```yaml
      - name: Install PaC Dependencies
        working-directory: ./infra/policypack
        run: npm install

      - name: Create the resources
        uses: pulumi/actions@v5
        with:
          command: up
          stack-name: zephyr/cicd-workshop/test # UPDATE THIS
          work-dir: ./infra
          policyPacks: policypack
        env:
          PULUMI_ACCESS_TOKEN: ${{ secrets.PULUMI_ACCESS_TOKEN }}
```

<!-- Note to presenter: run pulumi up ahead to save time. -->

✅ Commit the changes 

```bash
# Ensure you're in the project, `cicd-workshop-advanced`, directory

# Commit your changes
$ git add .
$ git commit -m "add pac"

# Create a new feature branch
$ git checkout -b feature-pac

# Push the changes
$ git push --set-upstream origin feature-pac

# Create a PR 
$ gh pr create --base main --head feature-pac --title "Adds Policy as Code" --body ""
# Follow the link to see the Actions
# It can take a few minutes for the GHA Runner to complete

# Merge the PR 
# Update the PR merge number as needed
$ m=2 #  
$ gh pr merge $m --squash
# ✓ Squashed and merged pull request #2 (Adds Policy as Code)
```

[**Click here to jump back to the Table of Contents**](#table-of-contents)

## **Part 3** Add drift detection

### 🎯 Goal

Attendees will be able to programmatically identify when a drift has occurred in their infrastructure via an Actions cronjob.

### 📚 Concepts

*Drift* TODO 

*Drift detection* TODO 

*Reconciling the infrastructure* TODO

### 🎬 Steps

✅  Add a cronjob to your workflow

```bash
# Ensure you're in the project, `cicd-workshop-advanced`, directory

$ git checkout main

$ vi .github/workflows/drift.yml
#   paste the contents of drift.yml shown below
#   update `stack-name`
#   save the file.
```

```yaml
name: drift
on:
  schedule:
    # Runs at 06:00
    # Actions schedules run at most every 5 minutes.
    - cron: '0 6 * * *'
  workflow_dispatch: {}

env:
  PULUMI_ACCESS_TOKEN: ${{ secrets.PULUMI_ACCESS_TOKEN }}

jobs:
  main:
    runs-on: ubuntu-latest
    name: Drift Detection
    steps:
      - name: checkout repository
        uses: actions/checkout@v4
            
      - name: setup node 18
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install Dependencies
        working-directory: ./infra
        run: npm install
        
      - name: Install PaC Dependencies
        working-directory: ./infra/policypack
        run: npm install
        
      - name: pulumi preview
        uses: pulumi/actions@v5
        with:
          command: preview
          refresh: true
          stack-name: zephyr/cicd-workshop/test ## Update this
          expect-no-changes: true
          work-dir: ./infra
```

Alternatively, navigate to the [drift.yml](./solution/.github/workflows/drift.yml) file to copy its contents.

✅ Commit the changes 

```bash
# Ensure you're in the project, `cicd-workshop-advanced`, directory

# Commit your changes
$ git add .
$ git commit -m "add dd"

# Create a new feature branch
$ git checkout -b feature-dd

# Push the changes
$ git push --set-upstream origin feature-dd

# Create a PR 
$ gh pr create --base main --head feature-dd --title "Adds Drift Detection" --body ""
# Follow the link to see the Actions
# It can take a few minutes for the GHA Runner to complete

# Merge the PR 
# Update the PR merge number as needed
$ m=3 #  
$ gh pr merge $m --squash
```

✅ Run the drift detection action from the browser

<!-- https://github.com/desteves/cicd-workshop-advanced/actions/workflows/drift.yml-->

## **Part 4** Add dedicated environments with Review Stacks

### 🎯 Goal

Attendees will be able to configure ephemeral dedicated cloud environments to deploy the infrastructure using Pulumi Deployments Review Stacks.

### 📚 Concepts

*Test in isolation*

*Pulumi Deployments Review Stacks*

### 🎬 Steps

✅ [Install the Pulumi GitHub App](https://www.pulumi.com/docs/using-pulumi/continuous-delivery/github-app/#installation-and-configuration)

Check your repository has been added to the access list https://github.com/settings/installations/46735415

✅ Add Review Stacks

```bash 
# Ensure you're in the project, `cicd-workshop-advanced/infra`, directory

# Re-use these values from Part 1
$ owner=desteves 
$ repo=cicd-workshop-advanced

# Use a Pulumi template to configure your Review Stacks
$ pulumi new https://github.com/desteves/reviewstacks-typescript/infra --dir deployment-settings
# project name: cicd-workshop-advanced
# project description: (default)
# stack: deployment-settings
#
# repository: $owner/$repo
# branch: /refs/heads/feature-rs
# repoDir: infra
# projectRef: cicd-workshop
# stackRef: test

# Create the Pulumi Deployments Review Stacks configuration
$ pulumi up --yes --cwd deployment-settings
# wait for the resource to get created; this can take a couple of seconds
```

✅ Commit the changes 

```bash
# Ensure you're in the project, `cicd-workshop-advanced`, directory

# Commit your changes
$ git add .
$ git commit -m "add rs"

# Create a new feature branch
$ git checkout -b feature-rs

# Push the changes
$ git push --set-upstream origin feature-rs

# Create a PR 
$ gh pr create --base main --head feature-rs --title "Adds Review Stacks" --body ""
# Follow the link to see the Actions
# It can take a few minutes for the GHA Runners to complete

# Merge the PR 
# Update the PR merge number as needed
$ m=5 #  
$ gh pr merge $m --squash
```

[**Click here to jump back to the Table of Contents**](#table-of-contents)

## ✨ Summary

You introduced advanced elements to your continuous infrastructure pipeline to make it more robust. In particular, you:
- Added a Pulumi ESC environment to retrieve dynamic credentials for AWS;
- Added policy checks to test your infrastructure for compliance;
- Added a drift detection cron job to the pipeline; and
- Configured dedicated cloud environments with Review Stacks.

## 🚀 Next steps

At this point, you have completed this workshop. You have 
- a GitHub repository with a sample application; 
- AWS resources using Pulumi IaC; and
- a robust cloud infrastructure CI/CD pipeline to test any change automatically. 

We encourage you to modify your app or infra and watch the changes be tested programmatically. Possible changes:

- Deploy your application in two regions
- Add a new AWS policy

[**Click here to jump back to the Table of Contents**](#table-of-contents)
