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
