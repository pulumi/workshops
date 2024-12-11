# AWS CDK on Pulumi

Pulumi just recently released version 1.0 of our AWS CDK adaptor, and this has greatly expanded compatibility with all CDK features. You can learn more about the update by checking out the [1.0 release of AWS CDK on Pulumi blog post](https://www.pulumi.com/blog/aws-cdk-on-pulumi-1.0/).

## Prerequisites

To deploy the code for this workshop, you will need the following:

- A [Pulumi Cloud account](https://app.pulumi.com/signup) and [access token](https://www.pulumi.com/docs/pulumi-cloud/access-management/accounts/#access-tokens)
- The [Pulumi CLI](https://www.pulumi.com/docs/iac/download-install/)
- An [AWS Account](https://aws.amazon.com/)
- The [AWS CLI](https://aws.amazon.com/cli/) installed and [configured for use with Pulumi](https://www.pulumi.com/docs/iac/get-started/aws/begin/#configure-pulumi-to-access-your-aws-account)
- [Node.js](https://www.pulumi.com/docs/iac/languages-sdks/javascript/) installed

## Deployment Steps

1. Clone this repo locally to your machine and navigate to the `aws-immersion-day-platform-eng/pulumi-cdk-interop` folder.
    ```
    git clone https://github.com/pulumi/workshops.git && cd workshops/aws-immersion-day-platform-eng/pulumi-cdk-interop
    ```
2. Create a new Pulumi stack:
    ```
    $ pulumi stack init dev
    ```
3. Set your desired region:
    ```
    # any valid AWS region will work
    $ pulumi config set aws:region us-east-1 
    $ pulumi config set aws-native:region us-east-1 
    ```
4. Install requirements:
    ```
    npm install
    ```
5. Run `pulumi up -y`. Once the program completes, it will have deployed a VPC and Security Group using CDK constructs and an EC2 instance using Pulumi Typescript.