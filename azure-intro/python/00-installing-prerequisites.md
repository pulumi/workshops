# Installing Prerequisites

These hands-on labs will walk you through various cloud infrastructure tasks. The prerequisites listed below are required to successfully complete them.

Although Pulumi supports many clouds and many languages, you will use Microsoft Azure and C# on .NET Core for these labs. Prerequisites are all available on recent versions of Windows, macOS, and Linux.

## Pulumi

You will use Pulumi to deploy infrastructure changes using code. [Install Pulumi here](https://www.pulumi.com/docs/get-started/install/). After installing the CLI, verify that it is working:

```bash
$ pulumi version
v1.13.1
```

The Pulumi CLI will ask you to login to your Pulumi account as needed. If you prefer to signup now, [go to the signup page](http://app.pulumi.com/signup). Multiple identity provider options are available &mdash; email, GitHub, GitLab, or Atlassian &mdash; and each of them will work equally well for these labs.

## Azure Subscription

You need an active Azure subscription to deploy the components of the application. You may use your developer subscription, or create a free Azure subscription [here](https://azure.microsoft.com/free/).

Be sure to clean up the resources after you complete the workshop, as described at the last step of each lab.

## Azure CLI

You will use the command-line interface (CLI) tool to log in to an Azure subscription. You can install the CLI tool, as described [here](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest).

After you complete the installation, open a command prompt and type `az`. You should see the welcome message:

```
$ az
     /\
    /  \    _____   _ _  ___ _
   / /\ \  |_  / | | | \'__/ _\
  / ____ \  / /| |_| | | |  __/
 /_/    \_\/___|\__,_|_|  \___|


Welcome to the cool new Azure CLI!
```

## Python 

Pulumi will need the an installation of Python 3.6 or later

https://www.python.org/downloads/

  in order to run your Pulumi Python application.

Install Python 3.6 from [here](https://www.python.org/downloads/), or your preferred distribution.

Ensure that the `python` (**for windows**) or `python3` (**for mac or linux**) executable can be found in your terminal path after installation.

Instructions will refer to `python` for consistency, but if you are on mac or linux, use the appropriate command.

```bash
$ python --version 
Python 3.7.6
```

If you have trouble setting python up on your machine, see [Python 3 Installation and Setup Guide](https://realpython.com/installing-python/).

## Docker (Optional)

If you will be completing the container labs, [install Docker Community Edition](https://docs.docker.com/install). After doing so, verify that the `docker` CLI is operational:

```bash
$ docker --version
Docker version 19.03.1, build 74b1e89
```

## Kubernetes (Optional)

If you will be completing the Kubernetes labs, [install the kubectl CLI](https://kubernetes.io/docs/tasks/tools/install-kubectl/). It isn't necessary to configure it to speak to a cluster &mdash; you will do that during the appropriate labs that require it.
