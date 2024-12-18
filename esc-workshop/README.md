# ESC Workshop

This repo contains code to demonstrate the various capabilities of Pulumi ESC with an emphasis on integrations with AWS (although similar integrations exist for other public cloud providers).

These demo instructions omit things like showing particular screens to the audience (e.g. displaying the table editor in the Pulumi Cloud console) - this is left to the discretion of the presenter.

## Pre-Demo Setup

1. (Optional) Set up OIDC between your Pulumi Cloud organization and your AWS account if it has not yet been configured:

    ```bash
    mkdir aws-ts-oidc-provider-pulumi-cloud
    cd aws-ts-oidc-provider-pulumi-cloud
    pulumi new https://github.com/pulumi/examples/tree/master/aws-ts-oidc-provider-pulumi-cloud
    pulumi up -y
    ```

    This will add an OIDC audience for your current Pulumi org.

1. Deploy the EKS cluster (this takes a while - 15 minute or so):

    ```bash
    cd eks-cluster
    pulumi up -y
    ```

    Add OIDC credentials to the stack config if necessary.

1. Get a GitHub (personal, not fine-grained) token with read-only capabilities from the GH console. Add it to the setup config. It will be placed in AWS Secrets Manager and an ESC environment will be generated:

    ```bash
    cd aws-secrets/setup
    pulumi config set  --secret githubToken github_pat_blahblahblah # replace with your actual token value
    ```

1. Deploy the setup for the AWS Secrets Manager Demo:

    ```bash
    cd aws-secrets/setup
    pulumi up -y
    ```

1. TODO: Deploy instructions for Stack References demo. (We did not run this demo in December 2024, since EKS auth kinda covers the same concepts: stack outputs integration with ESC.)

## Demo: AWS CLI

1. Ensure that you do not have any AWS creds active:

    ```bash
    aws sts logout
    aws sts get-caller-identity
    ```

    (The latter command should fail.)

1. Show that the user can get credentials:

    ```bash
    pulumi env run aws/aws-oidc-admin -- aws sts get-caller-identity
    ```

## Demo: Environment Inheritance and EKS auth

Show that the import/combination of OIDC creds and a Kubeconfig (the stack output from the EKS cluster) can be used to run K8s administrative commands, e.g.:

```bash
pulumi env run esc-workshop/eks-cluster -- k9s
```

## Demo: AWS Secrets Manager

1. Install the npm dependencies for the AWS Secrets Manager Lambda function:

    ```bash
    cd aws-secrets/demo/lambda
    npm i
    ```

1. Deploy the secrets manager program (this will fail b/c it requires a GH token):

    ```bash
    cd ../setup
    pulumi up -y
    ```

1. Add the environment from the setup step to `Pulumi.dev.yaml` and run `pulumi up -y` again.
1. Execute the function by hitting the `functionUrlEndpoint` stack output. You should see output similar to the following:

    ```json
    {"message":"Successfully fetched user information","user":{"login":"jkodroff","name":"Josh Kodroff","publicRepos":48,"followers":62,"following":35}}
    ```

## Demo: Pulumi IaC Stack References with Pulumi ESC

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
