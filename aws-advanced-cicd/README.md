# Advanced CI/CD for AWS using Pulumi and GitHub Actions

Last revision: May 2024.

> [!IMPORTANT]
> This is an advanced workshop that builds upon the [Getting Started workshop](../aws-getting-started-cicd/). Please make sure you finish that workshop before proceeding.

In this workshop, you will learn advanced topics that make up a robust infrastructure CI/CD pipeline through guided exercises. You will use Pulumi tooling to take your cloud infrastructure pipeline one step closer to production.

This workshop introduces users to advanced DevOps best practices. You will add compliance checks via policies, drift detection, and isolated test environments to an existing GitHub Actions pipeline. This will help accelerate your AWS projects with the code examples provided.

## Learning Objectives

- Learn how to build an advanced CI pipeline to enforce compliance and correct drift.
- Add dynamic credentials to your stack by configuring Pulumi ESC.
- Add policy checks to test your infrastructure before each deployment.
- Add a cron job to the pipeline to check for changes periodically (drift)
- Configure a dedicated cloud environment with Review Stacks

## Table of Contents

<!-- TOC start (generated with https://github.com/derlin/bitdowntoc) -->

- [Advanced CI/CD for AWS using Pulumi and GitHub Actions](#advanced-cicd-for-aws-using-pulumi-and-github-actions)
  - [Learning Objectives](#learning-objectives)
  - [Table of Contents](#table-of-contents)
  - [🧰 Prerequisites](#-prerequisites)
    - [Pulumi](#pulumi)
    - [GitHub](#github)
    - [AWS](#aws)
  - [**Part I** Set up your Pulumi project with Pulumi ESC](#part-i-set-up-your-pulumi-project-with-pulumi-esc)
    - [🎯 I. Goal](#-i-goal)
    - [📚 I. Concepts](#-i-concepts)
    - [🎬 I. Steps](#-i-steps)
  - [**Part II** Add compliance with Policy as Code](#part-ii-add-compliance-with-policy-as-code)
    - [🎯 II. Goal](#-ii-goal)
    - [📚 II. Concepts](#-ii-concepts)
    - [🎬 II. Steps](#-ii-steps)
  - [**Part III** Add drift detection](#part-iii-add-drift-detection)
    - [🎯 III. Goal](#-iii-goal)
    - [📚 III. Concepts](#-iii-concepts)
    - [🎬 III. Steps](#-iii-steps)
  - [**Part IV** Add dedicated environments with Review Stacks](#part-iv-add-dedicated-environments-with-review-stacks)
    - [🎯 IV. Goal](#-iv-goal)
    - [📚 IV. Concepts](#-iv-concepts)
    - [🎬 IV. Steps](#-iv-steps)
  - [✨ Summary](#-summary)
  - [🚀 Next steps](#-next-steps)

<!-- TOC end -->

## 🧰 Prerequisites

To go through this workshop with us, here is what you need:

### Pulumi

- A Pulumi Cloud account, head to [app.pulumi.com](https://app.pulumi.com/signup/?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops) and follow the sign-up process.
- An [access token](https://www.pulumi.com/docs/intro/pulumi-service/accounts/#access-tokens?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops) from your Pulumi Cloud account.
- The [Pulumi CLI]((https://www.pulumi.com/docs/get-started/install/?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops)) is installed in your development environment.

### GitHub

- A [GitHub](https://github.com/join) account.
- The [GitHub CLI](https://cli.github.com/), [`gh`](https://cli.github.com/) is installed in your development environment.
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) is installed in your development environment.

### AWS

- The [`aws` CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) is installed in your development environment.
- [Set up your local AWS credentials](https://www.pulumi.com/registry/packages/aws/installation-configuration/#credentials).

[**Click here to jump back to the Table of Contents**](#table-of-contents)

## **Part I**. Set up your Pulumi project with Pulumi ESC

This workshop picks up right where the [Getting Started](../aws-getting-started-cicd/) workshop left off, so we'll start with a sample application and a basic pipeline already in hand.

### 🎯 I. Goal

Attendees will be able to authenticate using Dynamic Credentials by adding a Pulumi ESC Environment with an AWS OIDC configuration.

### 📚 I. Concepts

**Dynamic Credentials**: Unlike static credentials, which remain constant over time, dynamic credentials are generated on the fly and have a short validity period, enhancing security by reducing the risk of unauthorized access from credential theft or misuse. It also eliminates the need for developers to manage the lifecycle of individual access keys for instances.

**OIDC**:  OpenID Connect (OIDC) is an authentication protocol built on top of the OAuth 2.0 framework. enables clients to authenticate users with a high degree of confidence while supporting single sign-on (SSO) and other identity-related functionalities.

**Pulumi ESC**: Pulumi ESC enables you to define Environments, which contain collections of secrets and configurations. Each Environment can be composed of multiple environments. An Environment may be used to store dynamic credentials from an OIDC IdP such as Pulumi Cloud to connect to your AWS.

### 🎬 I. Steps

<details>
<summary> ✅ Clone the Getting Started workshop solution </summary>

Presenter: Do this step beforehand and go over what you have in the repo.

```bash
# !!! Update the owner value to your GitHub handle
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

</details>

<details>
<summary> ✅ Add a GitHub secret to store your Pulumi access token to be used by Actions. </summary>

Presenter: Have a token already created and ready to paste.

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

</details>

<details>
<summary> ✅ Use a Pulumi ESC Environment to configure AWS Dynamic Credentials in your Pulumi Stack </summary>

Presenter Notes:

 - If your AWS Account already has an OIDC IDP for Pulumi Cloud, this will **not** work. Instead, just update your existing one's audience for the AWS IAM Identity Provider and also add the name of your Pulumi Org to the Trust Relationship JSON in the corresponding AWS IAM Role.
- The reference Pulumi template will change in the very near future, once [this GitHub Issue](https://github.com/pulumi/pulumi-pulumiservice/issues/225) is resolved.
- Complete this step beforehand.

```bash
# Ensure you're in ./infra

# Use a Pulumi template to create AWS OIDC Resources
$ pulumi new https://github.com/desteves/aws-oidc-typescript/infra --dir aws-oidc
# Go through the wizard and update the defaults as necessary

$ pulumi up --yes --cwd aws-oidc  --stack dev
# wait for the resources to get created; this can take a couple of minutes

# Obtain the name of the ESC Environment
$ e=$(pulumi stack output escEnv --cwd aws-oidc)

# Add the ESC Environment to your Stack
$ pulumi config env add ${e}

# Test the changes locally
$ pulumi preview
```

</details>

<details>
<summary> ✅ Commit the changes </summary>

```bash
# Commit your changes
$ git add .
$ git commit -m "add esc"

# Create a new feature branch
$ git checkout -b feature-esc

# Push the changes
$ git push --set-upstream origin feature-esc

# Create a PR
$ gh pr create --title "Adds Pulumi ESC for AWS OIDC" --body ""
# Follow the link to see the Actions
# It can take a few minutes for the GHA Runner to complete

# Merge the PR
# !!! Update the PR merge number as needed
$ m=1 
$ gh pr merge $m --squash

$ git checkout main
```

</details>

[**Click here to jump back to the Table of Contents**](#table-of-contents)

## **Part II**. Add CIS compliance with Policy as Code

### 🎯 II. Goal

Attendees will be able to add compliance checks to the CI/CD pipeline using [Pulumi CrossGuard](https://www.pulumi.com/crossguard/).

### 📚 II. Concepts

**Cloud compliance**: refers to the process of ensuring that cloud-based systems, services, and data storage adhere to relevant laws, regulations, standards, and best practices governing security, privacy, and data protection.

**Policy as Code**: involves codifying policy definitions, which allows for their automated enforcement and evaluation within various stages of IT operations and development pipelines. This method leverages version control systems, automation tools, and continuous integration/continuous deployment (CI/CD) pipelines to ensure that policies governing security, compliance, resource usage, and access controls are consistently applied across the entire ecosystem.

**Built-in packs**: bundle compliance policies that are easily extendable to speed up development and ensure best practices from day one.

### 🎬 II. Steps

By adding a default policy pack, your workflow will automatically ensure your stack is not violating any cloud infrastructure best practices.

<details>
<summary> ✅ Add the CIS compliance framework to your Pulumi program </summary>

Center for Internet Security (CIS)

```bash
# Ensure you're in the project, `cicd-workshop-advanced/infra`, directory

# Add the policy under the aws-cis/ folder
$ pulumi policy new aws-cis-compliance-policies-typescript  --dir aws-cis

# Add deps for GHA
# $ cd aws-cis
# # $ npm update --save
# # $ npm install @pulumi/policy @pulumi/compliance-policy-manager @pulumi/aws-compliance-policies
# $ pulumi up --yes
# $ cd ../

# Test locally
$ pulumi preview --policy-pack aws-cis --stack dev
# Policies:
#    ✅ aws-cis-compliance-ready-policies-typescript@v0.0.1 (local: aws-cis)

# Test programmatically
# Modify the workflow file
$ vi .github/workflows/branch.yml
#   edit the last step as shown below
#   save the file.
```

`branch.yml` code snippet:

```yaml
      - name: Install PaC Dependencies
        working-directory: ./infra/aws-cis
        run: npm install

      - name: Create the resources
        uses: pulumi/actions@v5
        with:
          command: up
          stack-name: pulumi-sandbox-diana/workshop/dev # !!! UPDATE THIS
          work-dir: ./infra
          policyPacks: aws-cis
        env:
          PULUMI_ACCESS_TOKEN: ${{ secrets.PULUMI_ACCESS_TOKEN }}
```

<!-- Note to presenter: run pulumi up ahead to save time. -->

</details>

<details>
<summary> ✅ Commit the changes as a merged PR </summary>

```bash
# Ensure you're in the project, `cicd-workshop-advanced`.

# Commit your changes
$ git add .
$ git commit -m "add pac"

# Create a new feature branch
$ git checkout -b feature-pac

# Push the changes
$ git push --set-upstream origin feature-pac

# Create a PR
$ gh pr create --title "Adds Policy as Code" --body ""
# Follow the link to see the Actions
# It can take a few minutes for the GHA Runner to complete

# Merge the PR
# !!! Update the PR merge number as needed
$ m=2
$ gh pr merge $m --squash
```

</details>

[**Click here to jump back to the Table of Contents**](#table-of-contents)

## **Part III**. Add drift detection

### 🎯 III. Goal

Attendees will be able to programmatically identify when a drift has occurred in their infrastructure via an Actions cronjob.

### 📚 III. Concepts

**Drift** refers to the phenomenon where the actual state of your infrastructure diverges from the expected or declared state as defined in your code. This can occur for a variety of reasons, such as manual changes made directly to the infrastructure (outside of the IaC processes), external processes modifying the environment, or discrepancies in the execution of IaC scripts.

**Drift detection** refers to the process of identifying discrepancies between the actual state of your infrastructure and its expected state as defined by your IaC configurations. This process is crucial for maintaining consistency, reliability, and security in cloud environments, where infrastructure components are dynamically provisioned and managed through code.

**Reconciling the infrastructure** Once a drift is detected, the next step is to reconcile the infrastructure, which means resolving the differences between the actual state and the intended state. Reconciliation can be approached in different ways but two common approaches are to update the infrastructure to match the code or update the code to reflect the detected changes.

Both drift detection and infrastructure reconciliation are fundamental to the practice of infrastructure as code, allowing teams to maintain control over their environments and ensure that their infrastructure remains in a known, good state.

### 🎬 III. Steps

<details>
<summary> ✅  Add a cronjob to your workflow that detects drift </summary>

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
    # Actions schedules runs every 5 minutes.
    - cron: '*/5 * * * *'
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

      - name: install dependencies
        working-directory: ./infra
        run: npm install

      - name: preview
        uses: pulumi/actions@v5
        with:
          command: preview
          refresh: true
          stack-name: pulumi-sandbox-diana/workshop/dev ## !!!! Update this
          expect-no-changes: true
          work-dir: ./infra
```

</details>

<details>
<summary> ✅ Commit the changes </summary>

```bash
# Ensure you're in the project, `cicd-workshop-advanced`.

# Commit your changes
$ git add .
$ git commit -m "add dd"

# Create a new feature branch
$ git checkout -b feature-dd

# Push the changes
$ git push --set-upstream origin feature-dd

# Create a PR
$ gh pr create --title "Adds Drift Detection" --body ""
# Follow the link to see the Actions
# It can take a few minutes for the GHA Runner to complete

# Merge the PR
# Update the PR merge number as needed
$ m=3 # 
$ gh pr merge $m --squash
```

</details>

<details>
<summary> ✅ Test the drift detection action </summary>

- Run from the broswer
- Make a change:

```bash
aws sso login --profile work
aws s3api put-bucket-tagging --bucket bucket-fe728d3 --tagging 'TagSet=[{Key=drift,Value=away}]' --region us-west-2
```

- Re-run from the broswer

</details>

## **Part IV** Add ephemral environments with Review Stacks

### 🎯 IV. Goal

Attendees will be able to configure ephemeral cloud environments to deploy the infrastructure using Pulumi Deployments Review Stacks.

### 📚 IV. Concepts

**Test in isolation** refers to the practice of testing components or units of an application without interference from other parts of the system.

**Pulumi Deployments Review Stacks** An ephemeral isolated Pulumi Stack to test your IaC via a number of configurations.

### 🎬 IV. Steps


✅ [Install the Pulumi GitHub App](https://www.pulumi.com/docs/using-pulumi/continuous-delivery/github-app/#installation-and-configuration)

Check your repository has been added to the [access list](https://github.com/settings/installations/46735415)

[Link to Pulumi ORG](https://app.pulumi.com/pulumi-sandbox-diana/settings/integrations)

<details>
<summary> ✅ Add Review Stacks by using a Pulumi template </summary>

```bash
# Ensure you're in `./infra`.

# Re-use these values from Part 1
owner=desteves
repo=live-workshop
branch=feature-rs

# Use a Pulumi template to configure your Review Stacks
git checkout -b ${branch}
pulumi new https://github.com/desteves/reviewstacks-typescript/tree/main/infra --dir deployment-settings
# project name: (default)
# project description: (default)
# stack: (default)
#
# branch: /refs/heads/feature-rs
# projectRef: workshop   # This needs to match the 
# repository: desteves/live-workshop
# repoDir: infra
# stackRef: dev #!!!!!!! UPDATE THIS VALUE AND PULUMI UP CHANGES

# Create the Pulumi Deployments Review Stacks configuration
cd deployment-settings
pulumi config env add aws-oidc-env-done
pulumi up --yes  --stack dev
# wait for the resource to get created; this can take a couple of seconds
```

</details>
<details>
<summary> ✅ Commit the changes </summary>

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
$ gh pr create --title "Adds Review Stacks" --body ""
# Follow the link to see the Actions
# It can take a few minutes for the GHA Runners to complete

# Merge the PR
# Update the PR merge number as needed
$ m=5 # 
$ gh pr merge $m --squash
```

</details>

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
