# ESC Training

## Demos

- [AWS OIDC](https://github.com/pulumi/examples/tree/master/aws-ts-oidc-provider-pulumi-cloud)

  - Create the OIDC Provider, if it does not exist.
  - Add the current Pulumi org as an audience, if it does not exist.
  - Create the Environment.

- [AWS Secrets Manager](TODO)

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
