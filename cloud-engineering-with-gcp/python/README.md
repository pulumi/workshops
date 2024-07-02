---
author: Josh Kodroff
language: python
provider: gcp (classic)
use: both
last-ran: none
boilerplate: none
last-host: none
learn-content: none
original-repo: none
status: active
deck: unknown
---

# Google Cloud Platform with Pulumi Workshop

This workshops guides you through using Pulumi's [Google Cloud (GCP) Classic](https://www.pulumi.com/registry/packages/gcp/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) provider.

## Pre-requisites

### Tools

You will need the following to complete this workshop:

* A [Pulumi account and token](https://www.pulumi.com/docs/intro/pulumi-service/accounts/#access-tokens?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
  * If you don't have an account, go to the [signup page](https://app.pulumi.com/signup?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops).
* The [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
* [Python 3.9 or later](https://www.python.org/downloads/)
* The [gcloud CLI](https://cloud.google.com/sdk/docs/install)
* The [Docker Engine](https://docs.docker.com/engine/install/) installed and running, and the Docker CLI on your `PATH`.

### GCP Setup

You will need an Google Cloud Platform (GCP) account to deploy the infrastructure in this workshop. You may use your organization's subscription, or to create a free Google Cloud account, see [Get started with Google Cloud](https://cloud.google.com/docs/get-started).

Be sure to have administrative access to the subscription (or at least IAM admin in Cloud Run).

Ensure you are authenticated against your GCP account. For instructions, see [Authorize the gcloud CLI](https://cloud.google.com/sdk/docs/authorizing#authorizing_with_a_user_account).

Finally, you'll need an active GCP project to use when provisioning resources. You can use an existing project, or to create a new project, see [Creating and managing projects](https://cloud.google.com/resource-manager/docs/creating-managing-projects).
