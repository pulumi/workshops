---
author: Lee B.
language: TypeScript
provider: azure-native
use: first-party
last-ran: unknown
boilerplate: something
last-host: unknown
learn-content: none
original-repo: https://github.com/jaxxstorm/pulumi-azurenative-workshop
status: unknown
---
# pulumi-azurenative-workshop

This workshops guides you through using Pulumi's [Azure Native](https://www.pulumi.com/docs/intro/cloud-providers/azure/) provider.

Before you can use the workshop, there are some steps you need to take.

If you'd like to open the workshop in a preconfigured environment, you can open it with GitPod

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/jaxxstorm/pulumi-azurenative-workshop)

## Installing Prerequisites

The hands-on workshop will walk you through various tasks of managing Azure infrastructure with the focus on serverless compute and managed Azure services. The prerequisites listed below are required to successfully complete them.

### Node.js

You will need Node.js version 10 or later to run Pulumi programs written in [TypeScript](https://www.typescriptlang.org/).
Install your desired LTS version from [the Node.js download page](https://nodejs.org/en/download/) or
[using a package manager](https://nodejs.org/en/download/package-manager/).

After installing, verify that Node.js is working:

```bash
$ node --version
v12.10.0
```

Also verify that the Node Package Manager (NPM) is working:

```bash
$ npm --version
6.10.3
```

### Azure Subscription and CLI

You need an active Azure subscription to deploy the components of the application. You may use your developer subscription, or create a free Azure subscription [here](https://azure.microsoft.com/free/).

Please be sure to have administrative access to the subscription.

You will also use the command-line interface (CLI) tool to log in to an Azure subscription. You can install the CLI tool, as described [here](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest).

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

If you are running this workshop in Gitpod, use the command `az login --use-device-code` to log into your Azure subscription.

### Pulumi

You will use Pulumi to depoy infrastructure changes using code. [Install Pulumi here](https://www.pulumi.com/docs/get-started/install/). After installing the CLI, verify that it is working:

```bash
$ pulumi version
v3.1.0
```

The Pulumi CLI will ask you to login to your Pulumi account as needed. If you prefer to signup now, [go to the signup page](http://app.pulumi.com/signup). Multiple identity provider options are available &mdash; email, GitHub, GitLab, or Atlassian &mdash; and each of them will work equally well for these labs.


