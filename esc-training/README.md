# ESC Training

## Demo: AWS OIDC

### Summary

- [Pulumi Template for AWS OIDC](https://github.com/pulumi/examples/tree/master/aws-ts-oidc-provider-pulumi-cloud)
- Creates the OIDC Provider, if it does not exist.
- Adds the current Pulumi org as an audience, if it does not exist.
- Creates the ESC Environment

### Pre-Live Steps

- Deploy the Pulumi IaC Program

  ```bash
  mkdir dynamic-auth-aws
  cd dynamic-auth-aws
  pulumi new https://github.com/pulumi/examples/tree/master/aws-ts-oidc-provider-pulumi-cloud
  aws sso login --profile work  # <-- update to match yours, alternatively, load static env vars this one time.
  pulumi org set-default jkodrofftest
  AWS_PROFILE=work pulumi up
  ```

### Live Steps

- **Step 1** Review the Pulumi IaC Program 

  - Inspect [`dynamic-auth-aws/index.ts`](./dynamic-auth-aws/index.ts)
  - Deploy the stack

    ```bash
    aws sso login --profile work  # <-- update to match yours, alternatively, load static env vars this one time.
    pulumi org set-default jkodrofftest
    AWS_PROFILE=work pulumi up
    ```

- **Step 2** Test the ESC Environment

  - Open https://app.pulumi.com/jkodrofftest/esc/dynamic-auth/aws
  - Click 'Open'
  - Toggle 'Show secrets'

- **Step 3** Load AWS OIDC credentials for AWS CLI commands

  ```bash
  # this should fail, in a new terminal run:
  aws s3 ls --region us-west-2
  aws configure list

  # this works
  ENV_NAME=jkodrofftest/dynamic-auth/aws
  esc run ${ENV_NAME} -- aws s3 ls --region us-west-2
  ```

- **Step 4** Add your AWS OIDC credentials to __any__ Pulumi IaC program

  ```bash
  # in a new terminal, run
  mkdir aws-test-creds
  cd aws-test-creds
  pulumi new aws-typescript

  # this should fail, in a new terminal run:
  pulumi preview
  # error: ... No valid credential sources found.

  # this works
  vi Pulumi.dev.yaml
  ## Add this

  environment:
    - dynamic-auth/aws
  
  # this now works
  pulumi preview
  ```

### Demo: AWS Secrets Manager

### Summary

- [Pulumi Example for AWS Secrets Manager](https://github.com/pulumi/examples/tree/master/aws-ts-lambda-slack)


### Pre-Live Steps

- (Optional) A Slack sandbox org with a valid webhook url, all `@pulumi.com` employees should be able to join the `pulumi-sandbox` Slack org.

- Create the AWS Secret

  ```bash
  aws secretsmanager create-secret \
  --name slack-webhook-url-plaintext \
  --description "slack webhook url" \
  --secret-string "https://hooks.slack.com/services/****/***"
  ```

- Prep the Pulumi IaC Program (sans ESC)

  ```bash
  mkdir dynamic-secrets-aws
  cd dynamic-secrets-aws
  pulumi new https://github.com/pulumi/examples/tree/master/aws-ts-lambda-slack

  # without Pulumi ESC
  aws sso login --profile work
  AWS_PROFILE=work pulumi preview
  ```

### Live Steps

- **Step 1b** Show AWS Secret

  ```bash
  ENV_NAME=jkodrofftest/dynamic-auth/aws
  esc run ${ENV_NAME} --  aws secretsmanager get-secret-value \
  --secret-id slack-webhook-url-plaintext --region us-west-2
  ```

- **Step 2** Configure the ESC Environment

  - Create a new ESC Environment via the ESC CLI:

    ```bash
    ESC_ENV=jkodrofftest/dynamic-secrets/aws2
    esc env init ${ESC_ENV}
    esc env edit ${ESC_ENV}
    ```

  - Paste the following contents:

    ```yaml
    imports:
      - dynamic-auth/aws
    values:
      aws:
        secrets:
          fn::open::aws-secrets:
            region: us-west-2
            login: ${aws.login}
            get:
              esc-training:
                secretId: slack-webhook-url-plaintext
      pulumiConfig:
        slackWebhookURL: ${aws.secrets.esc-training}
    ```

    - Test open the ESC Environment

    ```bash
    ESC_ENV=jkodrofftest/dynamic-secrets/aws
    esc env open ${ESC_ENV}
    ```

- **Step 3** Consume the secret via a Pulumi IaC program

  - Update `Pulumi.dev.yaml` (see comments in file)
  - Update `index.ts` (see comments in file)
  - Deploy the changes

    ```bash
    pulumi org set-default jkodrofftest
    pulumi preview
    ```

## Stack References with Pulumi ESC

- The `vpc-infra` directory contains a VPC along with Pulumi stack outputs for the VPC ID, along with the public and private subnet IDs.
- The `eks-infra` directory contains an EKS cluster that uses the stack outputs from the VPC stack.
- The `k8s-infra` directory contains the resources to deploy NGINX on Kubernetes.

### Pre-Live Steps

1. Spin up the VPC:

    ```bash
    cd vpc-infra
    pulumi up -y
    ```

1. When the VPC has completed spinning up, create an environment in the Pulumi Cloud console called `esc-training-vpc-stack` with the following config:

    ```yaml
    values:
      stackRefs:
        fn::open::pulumi-stacks:
          stacks:
            vpcInfra:
              stack: esc-training-vpc-infra/dev
      pulumiConfig:
        vpcId: ${stackRefs.vpcInfra.vpcId}
        publicSubnetIds: ${stackRefs.vpcInfra.publicSubnetIds}
        privateSubnetIds: ${stackRefs.vpcInfra.privateSubnetIds}
    ```

1. Spin up the EKS cluster:

    ```bash
    cd eks-infra
    pulumi up -y
    ```

1. Create an Environment in the Pulumi Cloud UI with the following content:

    ```yaml
    values:
      stacks:
        fn::open::pulumi-stacks:
          stacks:
            eks-cluster:
              stack: esc-training-eks-infra/dev
      kubeconfig: {'fn::toJSON': "${stacks.eks-cluster.kubeconfig}"}
      pulumiConfig:
        kubernetes:kubeconfig: ${kubeconfig}
      files:
        KUBECONFIG: ${kubeconfig}
    ```

### Live Steps

Show how stack references (between the VPC and EKS clusteR) can be replaced with ESC:

1. Create a new stack for `eks-infra`. (We need to keep the dev stack because an EKS cluster takes too long to spin up live.)
1. Do a `pulumi preview` with the stack reference code.
1. Comment out the stack reference and uncomment the code that pulls the same values Pulumi config.
1. Do a `pulumi preview`. This should fail.
1. Show the environment file in Pulumi Cloud that has the VPC output.
1. Add the environment to the stack config file.
1. Do a `pulumi preview` again. This should pass because we have the environment plugged in.

Show how we can use ESC to pass Kubeconfig:

1. Do a `pulumi up -y` on the `k8s-infra` program. This should fail due to the lack of a Kubeconfig.
1. Add the environment to the `k8s-infra` program.
1. Do a `pulumi up -y`. This should succeed.
1. To demo using the `esc` CLI to get a Kubeconfig:

    ```bash
    esc run esc-training-kubernetes -- k9s
    ```

    Point out the NGINX service running in the k9s TUI.
