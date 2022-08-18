---
author: Lee B.
language: typescript
provider: gcp
use: first-party
last-ran: unknown
boilerplate: something
last-host: unknown
learn-content: none
original-repo: https://github.com/jaxxstorm/pulumi-gcp-workshop
status: unknown
---
# pulumi-gcp-worksgop

This workshops guides you through using Pulumi's [Google Cloud Platform](https://www.pulumi.com/docs/intro/cloud-providers/gcp/) provider.

Before you can use the workshop, there are some steps you need to take.

If you'd like to open the workshop in a preconfigured environment, you can open it with GitPod

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/jaxxstorm/pulumi-gcp-workshop)

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

### Google Cloud Project & SDK

You need an Google Cloud Platform account to deploy the components of the application. You may use your organization subscription, or create a free Google Cloud account [here](https://cloud.google.com/getting-started).

Please be sure to have administrative access to the subscription.

You will also use the command-line interface (CLI) tool to log in to an Google Cloud Platform account. You can install the SDK, as described [here](https://cloud.google.com/sdk/docs/install).

Once you've installed the GCloud SDK, you'll need to authenticate. You can find instructions on how to do that [here](https://cloud.google.com/sdk/docs/authorizing#authorizing_with_a_user_account)

Finally, you'll need an active GCP project to use when provisioning resources. You can use an existing project, or [create a new one](https://cloud.google.com/resource-manager/docs/creating-managing-projects).

### Pulumi

You will use Pulumi to depoy infrastructure changes using code. [Install Pulumi here](https://www.pulumi.com/docs/get-started/install/). After installing the CLI, verify that it is working:

```bash
$ pulumi version
v3.1.0
```

The Pulumi CLI will ask you to login to your Pulumi account as needed. If you prefer to signup now, [go to the signup page](http://app.pulumi.com/signup). Multiple identity provider options are available &mdash; email, GitHub, GitLab, or Atlassian &mdash; and each of them will work equally well for these labs.


