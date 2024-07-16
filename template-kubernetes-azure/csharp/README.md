---
author: Josh Kodroff
language: csharp
provider: Azure Native
use: both
last-ran: 2022-11-03
boilerplate: none
last-host: Josh Kodroff
learn-content: none
original-repo: none
status: active
deck: unknown
---

# Kubernetes on Azure

This workshop will guide you through Pulumi's [Kubernetes Cluster in Azure](https://www.pulumi.com/templates/kubernetes/azure/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) template. We'll deploy an AKS Kubernetes cluster on Azure, deploy NGINX as a Kubernetes deployment, and add a `LoadBalancer` service to expose our NGINX service for outside access.

## Pre-requisites

### Tools

You will need the following to complete this workshop:

* A [Pulumi account and token](https://www.pulumi.com/docs/intro/pulumi-service/accounts/#access-tokens?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
  * If you don't have an account, go to the [signup page](https://app.pulumi.com/signup?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops).
* The [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
* [.NET 6](https://dotnet.microsoft.com/en-us/download)
* [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
* [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)
* [kubelogin](https://github.com/Azure/kubelogin#setup-homebrew)

### Azure Setup

#### Subscription

You'll also need an active Azure subscription to deploy the components of the application. You may use your developer subscription, or [create a free Azure subscription](https://azure.microsoft.com/en-us/free/).

Please be sure to have administrative access to the subscription.

#### Active Directory group

Access to our AKS cluster will be integrated with [Azure Active Directory](https://azure.microsoft.com/en-ca/products/active-directory/). In order to authenticate with our Kubernetes cluster, you'll need to ensure that your Azure user ID is in an Active Directory group. Make note of the group ID - we'll use it soon.

Let's begin with [Creating a New Project](module-01/README.md).
