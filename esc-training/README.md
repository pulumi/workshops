# ESC Training

## Demo: AWS OIDC

### Summary

- [Pulumi Template for AWS OIDC](https://github.com/pulumi/examples/tree/master/aws-ts-oidc-provider-pulumi-cloud)
- Creates the OIDC Provider, if it does not exist.
- Adds the current Pulumi org as an audience, if it does not exist.
- Creates the ESC Environment

### Pre-Live Steps

- **Step 1** Deploy the Pulumi IaC Program

### Live Steps

- **Step 1** Review the Pulumi IaC Program 

```bash
pulumi refresh
```

- **Step 2** Test the ESC Environment

```bash
pulumi up
```

  -  Test the ESC Environment created in the browser
    - Open https://app.pulumi.com/jkodrofftest/esc/dynamic-auth/aws
    - Click 'Open'
    - Toggle 'Show secrets'

- **Step 3** Load AWS OIDC credentials for AWS CLI commands

```bash
aws s3 ls --region us-west-2

esc run auth/aws -- aws s3 ls --region us-west-2
```


### Demo: AWS Secrets Manager

### Summary

- [Pulumi Example for AWS Secrets Manager](https://github.com/pulumi/examples/tree/master/aws-ts-oidc-provider-pulumi-cloud)

### Pre-Live Steps

- (Optional) A Slack sandbox org with a valid webhook url, all `@pulumi.com` employees should be able to join the `pulumi-sandbox` Slack org.

- **Step 1a** Create the AWS Secret

### Live Steps

- **Step 1b** Show AWS Secret

  ```bash
  ```

- **Step 2** Configure the ESC Environment

  ```bash
  ```

- **Step 3a** Consume the secret via the terminal

  ```bash
  esc run example/aws-ts-lambda-slack  -- sh -c 'curl -X POST -H "Content-type: application/json" --data \'{"text":"Hello, World!"}\' $SLACK_WEBHOOK_URL'
  ```

- **Step 3b** Consume the secret via a Pulumi IaC program
  - Browse the code and show:
  - `Pulumi.dev.yaml`

    ```yaml
    ```
  
  - Reference in the `index.ts` file
  - (Optional) Deploy the Pulumi IaC program

    ```bash
    pulumi up
    ```


## Stack References with Pulumi ESC

- The `vpc-infra` directory contains a VPC along with Pulumi stack outputs for the VPC ID, along with the public and private subnet IDs.
- The `eks-infra` directory contains an EKS cluster that uses the stack outputs from the VPC stack.

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

### Live Steps

Because the EKS stack takes a long time to spin up, a `pulumi preview` should be sufficient here to illustrate the point.

1. Highlight the lines of code that read the ids from a stack reference and run `pulumi preview`.
1. Comment out the lines of code that read the ids from a Pulumi stack reference object and uncomment the lines of code that read those values as configuration.
1. Run a `pulumi preview` to show that we don't have these values anymore.
1. Add the environment to `Pulumi.dev.yaml`:

    ```yaml
    environment:
      - esc-training-vpc-stack
    ```
