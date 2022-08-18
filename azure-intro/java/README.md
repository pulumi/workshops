# pulumi-azurenative-workshop

This workshops guides you through using Pulumi's [Azure Native](https://www.pulumi.com/docs/intro/cloud-providers/azure/) provider.

Before you can use the workshop, there are some steps you need to take.

## Installing Prerequisites

This hands-on workshop will walk you through various tasks of managing Azure infrastructure with the focus on managed Azure services. The prerequisites listed below are required to successfully complete the steps herein.

### Java

You'll need to install the following in order to run Pulumi programs written in Java:

1. [Java 11 or later](https://docs.microsoft.com/en-us/java/openjdk/download)
1. [Apache Maven 3.6.1 or later](https://maven.apache.org/install.html)

After installing, verify that Java is working:

```bash
$ java --version
openjdk 18.0.1 2022-04-19
OpenJDK Runtime Environment Homebrew (build 18.0.1+0)
OpenJDK 64-Bit Server VM Homebrew (build 18.0.1+0, mixed mode, sharing)
```

Also verify that Maven is working:

```bash
$ mvn version
Apache Maven 3.8.5 (3599d3414f046de2324203b78ddcf9b5e4388aa0)
Maven home: /opt/homebrew/Cellar/maven/3.8.5/libexec
Java version: 18.0.1, vendor: Homebrew, runtime: /opt/homebrew/Cellar/openjdk/18.0.1/libexec/openjdk.jdk/Contents/Home
Default locale: en_US, platform encoding: UTF-8
OS name: "mac os x", version: "12.5", arch: "aarch64", family: "mac"
```

### Azure Subscription and CLI

You'll need an active Azure subscription to deploy the components of the application. You may use your developer subscription, or [create a free Azure subscription](https://azure.microsoft.com/free/).

Please be sure to have administrative access to the subscription.

You will also use the Azure command-line interface (CLI) tool to log in to an Azure subscription. For detailed instructions, see [How to install the Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest).

After you complete the installation, open a command prompt and type `az`. You should see the welcome message:

```bash
$ az
Welcome to Azure CLI!
---------------------
Use `az -h` to see available commands or go to https://aka.ms/cli.
```

### Pulumi

You will use Pulumi to deploy infrastructure changes using code. [Install Pulumi here](https://www.pulumi.com/docs/get-started/install/). After installing the CLI, verify that it is working:

```bash
$ pulumi version
v3.38.0
```

The Pulumi CLI will ask you to login to your Pulumi account as needed. If you prefer to signup now, [go to the signup page](http://app.pulumi.com/signup). Multiple identity provider options are available: email, GitHub, GitLab, or Atlassian. Any of these options will work equally well for these labs.
