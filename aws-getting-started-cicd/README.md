# Getting started with CI/CD for AWS using Pulumi and GitHub Actions

In this workshop, you will learn the fundamentals of an infrastructure ci/cd pipeline through guided exercises. You will be introduced to Pulumi, an infrastructure-as-code platform designed to provision modern cloud infrastructure using familiar programming languages.

This workshop introduces new users to DevOps best practices. You will become familiar with the core concepts needed to deploy cloud resources _continuously_. Walk through configuring Pulumi GitHub Actions to deploy AWS resources programmatically and accelerate your cloud projects with the skeleton code provided.

## Learning Objectives 

- The basics of the Pulumi programming model
- The key components of a continuous pipeline
- How to build your own infrastructure CI/CD pipeline
- Configuring the Pulumi GitHub Actions to deploy AWS resources

## Table of Contents  <!-- no toc -->

TODO: Regen
<!-- `cat tmp.md | ./gh-md-toc -` -->

## Prerequisites

To go through this workshop with us, here is what you need

### Pulumi

1. A Pulumi Cloud account, head to [app.pulumi.com](https://app.pulumi.com/signup/?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops) and follow the sign-up process.
2. An [access token](https://www.pulumi.com/docs/intro/pulumi-service/accounts/#access-tokens?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops) from your Pulumi Cloud account.
3. The [Pulumi CLI]((https://www.pulumi.com/docs/get-started/install/?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops)) installed in your development environment.

### GitHub

1. A [GitHub](https://github.com/join) account.
2. The [GitHub CLI](https://cli.github.com/), [`gh`](https://cli.github.com/) installed in your development environment.
3. [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) installed in your development environment.

### AWS

1. The [`aws` CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) installed in your development environment.
2. [Set up your local AWS credentials](https://www.pulumi.com/registry/packages/aws/installation-configuration/#credentials).

## Part 1 - Using the Pulumi template

### Overview  

#### Goal

Attendees will be able to practice configuring the basics of the Pulumi programming model:
* project; 
* program; and
* stack in Pulumi.

#### Concepts

The *Pulumi programming model* is centered around defining infrastructure using familiar programming languages. 

A *Pulumi template* refers to a configuration and infrastructure-as-code (IaC) project created using the Pulumi programming model so that it may be easily reused. At Pulumi, we have curated a list of 100s of out-of-the-box templates for the most popular providers at https://github.com/pulumi/templates. These are directly integrated with the CLI via `pulumi new`. Users can also create templates.

### Steps

You will add cloud infrastructure to a Hello World web app so that it runs in an Amazon S3 bucket.

#### Make a new directory

The Pulumi program needs an empty directory. Oftentimes, this is a subfolder within your application's repository named something along the lines of 'infra'. However, because Pulumi templates are standalone full-working solutions, you'll see the app folder nested. 

```bash
mkdir infra
```

### Using a template

We're going to use a Pulumi template to generate our program's scaffolding. Run the following command in your terminal.

```bash
# To walk through the prompts
$ cd infra
$ pulumi new
#   Select 'template'
#   Select `static-website-aws-typescript`
#   Project name: iac-workshop   
#   Description: <Enter> to select the default
#   Stack name: local
#   Select defaults for the remaining prompts


# Or, using advance settings
$ pulumi new static-website-aws-typescript --dir infra --template-mode  --stack local  --name iac-workshop --yes --non-interactive
# Note: The --dir specificed will be created, if it doesn't exist.
```

### Explore the program

Each time you create a new Pulumi program, you'll see the following:

1. `Pulumi.yaml` contains the project and top-level configuration settings.
2. A `Pulumi.<stackName>.yaml` file for each stack within your program. This is the stack configuration file, e.g., `Pulumi.local.yaml`
3. A language-specific Pulumi program entrypoint. This is `index.ts` in our example.
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

Inspect your `local` stack.

> [!TIP] 
> *Stacks*: Stacks are logical environments within your Pulumi project. Each stack can have its own configuration and resources. For example, you might have a development stack and a production stack within the same project.

```bash
$ cat Pulumi.local.yaml        
config:
  aws:region: us-west-2
  iac-workshop:errorDocument: error.html
  iac-workshop:indexDocument: index.html
  iac-workshop:path: ./www
```


Inspect the `index.ts` file to identify its key elements.

> [!TIP] 
> *Pulumi program entrypoint*: Your Pulumi program starts with an entry point, typically a function written in your chosen programming language. This function defines the infrastructure resources and configurations for your project.

The key elements in the Pulumi program entrypoint file are defined below.

* **Providers** are a crucial part of Pulumi's infrastructure as code (IaC) framework, as they enable you to define and deploy resources in your target environment using familiar programming languages. There are over [150+ providers available](https://www.pulumi.com/registry/) that allow you to interact with and manage resources in a specific cloud or infrastructure environment, such as AWS, Azure, or Google Cloud. 
* **Configurations**. Pulumi allows you to configure your infrastructure by setting variables. These variables can be set via command-line arguments, environment variables, configuration files (e.g., Pulumi.local.yaml), or secrets. This flexibility makes it easy to manage different configurations for different environments.
* **Resources** represent cloud infrastructure components, like virtual machines, databases, networks, etc. You define resources using constructors specific to the cloud provider you're working with. For instance, in AWS, you might create an S3 bucket resource.
* **Outputs**  You can define outputs in your Pulumi program to expose information about your infrastructure. These outputs can be used for debugging, integration with other services, or to provide information to other parts of your application. 

```bash
$ cat -n index.ts
```

> [!IMPORTANT] 
> *Pulumi is declarative*: Pulumi allows you to define your desired infrastructure state using code in a declarative manner. In a declarative approach to infrastructure management, you **specify what you want** the infrastructure to look like, and the underlying system (Pulumi in this case) takes care of figuring out how to achieve that desired state.

### First deployment

Let's deploy our Pulumi program using `local` stack via the terminal.

```bash
# Check you're logged into Pulumi Cloud
$ pulumi whoami
# If not logged in, run
$ pulumi login
# Provide your access token at the prompt to connect to your Pulumi Cloud account



# A preview of the changes will be printed on the screen
$ pulumi up
# Select 'yes' to confirm the changes and wait a few seconds

# Or, using advance settings to skip the preview
$ pulumi up --yes --skip-preview --non-interactive --stack dev
```

🎉 **Congratulations**! 🎉  Your application is now up and running!

Access the `url` Output to confirm your website is accessible.

```bash
# To view all your stack outputs
$ pulumi stack output 
# To view an output
$ pulumi stack output url

# Validate the app has a working endpoint!
$ curl $(pulumi stack output url)
```

## Part 2 - Automating our deployment

### Overview  

In [Part 1](TODO), you manually ran commands using the Pulumi CLI to get your application and cloud infrastructure running. In a DevOps fashion, however, you would deploy everything *programmatically*. 

#### Goal

Attendees will be able to understand and configure the three stages of an infrastructure ci/cd pipeline.

#### Concepts

An **Infrastructure CI/CD pipeline** is a set of automated processes and tools designed to manage and deploy infrastructure as code (IaC) in a consistent, efficient, and reliable manner. It's an essential part of modern DevOps practices and is used to streamline the provisioning and maintenance of infrastructure resources, such as servers, networks, and cloud services. 

### Steps

#### Add secrets to your GitHub repo

Actions needs a valid Pulumi access token to run.

```ts
todo-todo-todo
```

And let's do the same for the `aws` credentials

```ts
todo-todo-todo
```

#### Add Pulumi GitHub Actions

TODO-TODO-TODO

```ts
todo-todo-todo
```

#### Create a PR

TODO-TODO-TODO

```ts
todo-todo-todo
```

#### Review the Workflow

TODO-TODO-TODO

```ts
todo-todo-todo todo-todo-todo
```

#### Merge the PR

TODO-TODO-TODO

```bash
todo-todo-todo
```

## Part 4 - Make a fun PR!

### Overview  

At this point, you have 

- a GitHub repository with a sample application; 
- AWS cloud infrastructure defined as code; and
- a CI/CD pipeline to test any change automatically. 

#### Goal

Attendees will be able to further enhance the pipeline:

### Suggestions

We encourage you to modify your app or infra and watch the changes be tested programmatically. Possible changes:

- Add a `/healthcheck` endpoint to the application and redeploy it.
- Add a new stack, `test`, to the Pulumi program that updates upon a successful merge to `main`
- (Advanced) Enforce an AWS policy

## Next steps

Ready for more? Follow the [Advanced CI/CD for AWS using Pulumi and GitHub Actions](../aws-advanced-cicd/) to take your infrastructure pipeline to the next level with AWS Policies, Secrets Management, and Review Stacks.
