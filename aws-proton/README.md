# Platform Engineering with AWS Proton and Pulumi

This repo contains code for the Platform Engineering with AWS Proton and Pulumi workshop.

## Access Token

Proton requires a Pulumi access token in order to run Pulumi commands to deploy the templates.

If you want to use your local Pulumi token, run the following command:

```bash
pulumi config set pulumiAccessToken $(echo $PULUMI_ACCESS_TOKEN) --secret
```

**NOTE:** For production scenarios, you should _not_ reuse your personal token - use a separate token for Proton so that replacing your local personal token does not cause disruption in your organization's delivery pipelines.

## Repo Structure

The repo contains the following directories:

- `proton/` contains a Pulumi program to manage resources within AWS Proton itself, including CodeBuild provisioning, needed IAM roles, etc.
- `proton-templates/environment-vpc/v1` contains a Proton environment template which in turn contains a  Pulumi program to create a VPC and a shared EKS cluster.
- `proton-templates/service-container/v1` contains a Proton service template which in turn contains a  Pulumi program to create an EKS Fargate service and an associated load balancer.

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

## Troubleshooting

If a Proton template gets stuck in a bad state and cannot be torn down smoothly, log into the [Pulumi Service](https://app.pulumi.com), locate the stack, go to Settings, and follow the instructions there to delete the stack's resources (including generating a `Pulumi.yaml` and stack config file).

## Future Improvements

- Write a script that that fully converts `proton-inputs.json` to `Pulumi.$STACK.yaml`

## Stuff

```bash
aws proton create-environment-template-version --template-name vpc --source "s3={bucket=$(pulumi stack output bucketName),key=$(pulumi stack output vpcTemplateFileKey)}"
```

```bash
aws proton create-environment --name my-environment 
```
