# Platform Engineering with AWS Proton and Pulumi

This repo contains code for the Platform Engineering with AWS Proton and Pulumi workshop.

## Quick Deployment instructions

To deploy and run the same code:

1. Change the hard-coded value for `PULUMI_ORG` in `proton-templates/environment-vpc/v1/infrastructure/manifest.yaml` and `proton-templates/service-container/v1/instance_infrastructure/manifest.yaml`. (This should be fixed soon to pull from an SSM parameter.)
1. Bundle the Proton templates: `make templates`
1. Deploy the base infra: `cd proton/base-infra && pulumi up -y` (You'll get prompted for any missing config values.)
1. Deploy the environment template: `cd proton/environment-template && pulumi up -y`
1. Deploy the service template: `cd proton/service-template && pulumi up -y`

Then, in the AWS Proton console, to demonstrate Proton's capabilities:

1. Deploy an environment using the deployed environment template. Be sure to specify the CodeBuild Provisioning Role, e.g.:
1. Deploy a service into the environment using the deployed service template. (Note that a the time of writing, Proton may not correctly validate that the `port` field is required when deploying the service template via the wizard in the AWS Console.)
1. In the Proton console, navigate to Service Instances, then the Service Instance you just deployed. Find the service's URI in the Outputs section.
1. Open the web browser to the deployed service's URI. Note that the URL may give an HTTP 503 error for a minute or two minutes until the load balancer detects the service as healthy.

## Access Token

Proton requires a Pulumi access token in order to run Pulumi commands to deploy the templates.

If you want to use your local Pulumi token, run the following command:

```bash
pulumi config set pulumiAccessToken $(echo -n $PULUMI_ACCESS_TOKEN) --secret
```

**NOTE:** For production scenarios, you should _not_ reuse your personal token - use a separate token for Proton so that replacing your local personal token does not cause disruption in your organization's delivery pipelines.

## Repo Structure

The repo contains the following elements:

- `Makefile` with the following notable targets:
  - `make templates` will bundle the Proton templates for distribution to an S3 bucket. This target must be run before deploying the Proton template Pulumi programs (see below).
- `proton/` contains a Pulumi programs to manage resources within AWS Proton itself, including CodeBuild provisioning, needed IAM roles, etc.
  - `base-infra/` contains the basic resources for AWS Proton: buckets, IAM roles, secrets, etc. This stack must be deployed first.
  - `environment-template/` contains resources to create a Proton environment template. This stack must be deployed second.
  - `service-template/` contains resources to create a Proton service template. This stack must be deployed third.
- `proton-templates/` contains the templates that are tar/gzipped, uploaded to S3, and deployed to Proton. Platform engineers would deploy the environment template and application teams would deploy the service template.
  - `environment-vpc/v1` contains a Proton environment template which in turn contains a Pulumi program to create a VPC, a shared EKS cluster, and a shared Application Load Balancer.
  - `service-container/v1` contains a Proton service template which in turn contains a Pulumi program to create an EKS Fargate service and the associated load balancing resources.
- `util/` contains Python scripts that use boto3 to fully delete all instances and versions of an environment template, as well as the template itself.
- `doc` contains sample JSON files that Proton passes to CodeBuild. They are included to enable local testing that emulates the way inputs are passed via Proton.

## Templates

For this demo, we bundle our environment and service templates locally and upload them to an S3 bucket provisioned in the Pulumi stack in the `proton` directory via the Pulumi [Synced Folder](https://www.pulumi.com/registry/packages/synced-folder/) component. For production scenarios, you should strongly consider using the [template repo sync](https://docs.aws.amazon.com/proton/latest/userguide/ag-template-sync-configs.html) feature of AWS Proton instead. (We use S3 sync here because it allows all of the code to be versioned in a single repo, which simplifies running the demo.)

To bundle the templates, run the following command at the repo root:

```bash
make templates
```

## Deploying Proton resources

In order to deploy the built template bundles along with the necessary Proton resources (IAM roles, S3 bucket, Proton environment, etc.), run the following command:

```bash
make deploy
```

This will run `pulumi deploy`.

## Teardown

Some Proton resources are not available for control via IaC and must be torn down in the AWS Console or via boto3.

1. Delete any deployed services in the AWS Console.
1. Delete any deployed environments in the AWS Console.
1. Delete all deployed service templates:

    ```bash
    cd util && python3 delete_service_template.py --name fargate-service
    ```

1. Delete all deployed environment templates:

    ```bash
    cd util && python3 delete_environment_template.py --name fargate-env
    ```

1. Tear down the base infrastructure:

    ```bash
    cd proton/base-infra && pulumi destroy
    ```

## Troubleshooting

If a Proton template deployment gets stuck in a bad state and cannot be torn down smoothly by the Proton service, log into the [Pulumi Service](https://app.pulumi.com), locate the stack, go to Settings, and follow the instructions there to delete the stack's resources (including generating a `Pulumi.yaml` and stack config file).

## Limitations/Potential Improvements

- We currently only support launching a single service per environment due to time constraints.
- Write a script that that fully maps `proton-inputs.json` to `Pulumi.$STACK.yaml` so we don't have to add a line for each input to `manifest.yaml`.
