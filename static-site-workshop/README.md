# Static Site Workshops

## Prerequisites

We'll walk through all of the process to install and get set up with Pulumi and the cloud provider we're working with today.

### Pulumi

You'll need a free Pulumi SaaS account, a Pulumi token, and the Pulumi CLI installed to complete this workshop.

1. To get your Pulumi account set up, head to [app.pulumi.com](https://app.pulumi.com/signup/?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops) and follow the sign-up process. If you already have a Pulumi account, continue to the next step.
1. [Get your access token](https://www.pulumi.com/docs/intro/pulumi-service/accounts/#access-tokens?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops). Save it somewhere safe like a password manager.
1. [Install the Pulumi CLI](https://www.pulumi.com/docs/get-started/install/?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops).
1. In a terminal, run `pulumi login` to link the CLI to your account using your access token.

### Language Setup

Check the workshop description for the language we're using, and find it in this list:

<details>
<summary><b>C#/F#/.NET</b></summary>

1. Install .NET6 or higher [here](https://www.pulumi.com/docs/intro/languages/dotnet/?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops).

</details>
<details>
<summary><b>Go</b></summary>

1. Install everything you need for Go [here](https://www.pulumi.com/docs/intro/languages/go/?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops)

</details>
<details>
<summary><b>Java</b></summary>

1. Install Java 11.x or higher [here](https://www.pulumi.com/docs/intro/languages/java/?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops).
1. Check the workshop description to know whether you'll need [Maven](https://maven.apache.org/install.html) or [Gradle](https://gradle.org/install/).

</details>
<details>
<summary><b>Python</b></summary>

1. Install Python 3.9.x [here](https://www.pulumi.com/docs/intro/languages/python/?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops).

</details>
<details>
<summary><b>TypeScript</b></summary>

1. Install the latest version of Node [here](https://www.pulumi.com/docs/intro/languages/javascript/?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops).

</details>
<details>
<summary><b>YAML</b></summary>

There's no special setup needed for YAML!

</details>
<br/>

### Cloud Provider

Check the workshop description for the cloud provider we're using, and find it in this list:

<details>
<summary><b>AWS</b></summary>

1. [Set up your local credentials](https://www.pulumi.com/registry/packages/aws/installation-configuration/#credentials) with the `aws` CLI.

</details>
<details>
<summary><b>Azure</b></summary>

1. [Set up your local credentials](https://www.pulumi.com/registry/packages/azure-native/installation-configuration/#credentials) with the `az` CLI.

</details>
<details>
<summary><b>GCP</b></summary>

1. [Set up your local credentials](https://www.pulumi.com/registry/packages/gcp/installation-configuration/#credentials) with the `gcloud` CLI.

</details>
<br/>

## Parts

* [Part 0: Overview](./part-0/)
* [Part 1: Getting settled with our first program](./part-1/)
* [Part 2: Using and understanding the CLI](./part-2/)
* [Part 3: Modifying infrastructure](./part-3/)
* [Part 4: Using language constructs](./part-4/)
* [Part 5: Cleaning up](./part-5/)