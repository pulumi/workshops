# aws-policy-as-code

This document contains the sample code for the Policy as Code on AWS workshop.

## Compliance-Ready Policies Demo Script

The `compliance-ready-policies/infra` directory contains a very simple Pulumi program that contains an EC2 instance that has a PCI-DSS violation (a public IP address on an EC2 instance, which is insecure in most use cases). Note that the stack is not intended to be actually deployed - we only run `pulumi preview` operations during the demo. During this demo, we'll show how Compliance Ready Policies will catch this condition and show how to change the attributes of the instance to get the policy to pass.

1. Initialize a Compliance Ready policy pack:

    ```bash
    cd compliance-ready-policies/policy
    pulumi policy new --force # --force to ignore the .gitkeep file
    # Select the pcidss option for AWS
    ```

1. Run the policy pack and watch it fail:

    ```bash
    cd ../infra
    pulumi preview --policy-pack ../policy
    ```

1. Add the following attribute to the EC2 instance:

    ```typescript
    associatePublicIpAddress: false
    ```

1. Run the policy pack again and watch it pass:

    ```bash
    pulumi preview --policy-pack ../policy
    ```

## Snyk Container Scanning Demo Script

Prerequisites:

1. Install the Snyk CLI
1. Ensure Docker Desktop is running

Demo steps:

1. Initialize the Pulumi policy pack:

    ```bash
    cd snyk-policy-scanning/policy
    pulumi policy new snyk-typescript
    ```

1. Run the policy and watch it fail:

    ```bash
    cd ../infra
    pulumi preview --policy-pack ../policy
    ```

1. Change the Dockerfile to `FROM alpine:latest`

1. Run the policy and watch it pass.

## Server-side Policy Enforcement

The `snyk-policy-scanning/infra` directory contains a simple Pulumi program with a simple `docker.Image` resource that uses an obsolete and insecure version of Alpine Linux that contains critical CVEs. In this demo, we'll show how the Snyk container scanning policy template can be used to catch these issues.

Note: This demo requires a Pulumi organization on the Business Critical SKU. You can create a trial organization to get access to these features.

Ensure that the Docker image is set back to using the old version of Alpine, e.g.

```dockerfile
FROM alpine:3.7
```

1. Publish the Snyk policy pack:

    ```bash
    cd snyk-policy-scanning/policy
    pulumi policy publish
    ```

    Note that you may need to increment the version number in `snyk-policy-scanning/policy/package.json` in order to avoid a collision with a previously published policy version.

1. In the Pulumi Cloud UI, create a new policy group. You can also use the default policy group, but note that any policies added to this group will affect all stacks in your organization and will therefore affect all Pulumi policy operations.
1. Show how the policy can be configured, e.g. by setting the policy to be `advisory` instead of `mandatory`, or by changing the minimum level of violation.
1. Run a Pulumi operation without the `--policy-pack` flag, e.g.:

    ```bash
    cd ../infra
    pulumi preview
    ```
