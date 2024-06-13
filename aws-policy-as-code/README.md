# aws-policy-as-code

This document contains the sample code for the Policy as Code on AWS workshop.

## Compliance-Ready Policies Demo Script

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
