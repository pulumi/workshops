# Platform Engineering with AWS Proton and Pulumi

This repo contains code for the Platform Engineering with AWS Proton and Pulumi workshop.

## Access Token

Proton requires a Pulumi access token in order to run Pulumi commands to deploy the templates.

If you want to use your local Pulumi token, run the following command:

```bash
pulumi config set pulumiAccessToken $(echo $PULUMI_ACCESS_TOKEN) --secret
```

**NOTE:** For production scenarios, you should _not_ reuse your personal token - use a separate token for Proton so that replacing your local personal token does not cause disruption in your organization's delivery pipelines.

## Templates Repo

Samples templates that contain infrastructure to be deployed by AWS Proton can be found at <https://github.com/pulumi/aws-proton-workshop-templates>. You can fork this repo and modify the templates to fit your organization's needs.

TODO: Add a config var to point to the templates repo (with a default).

## Repo Structure

The repo contains the following directories:

- `proton/` contains a Pulumi program to manage resources within AWS Proton itself, including CodeBuild provisioning, needed IAM roles, etc. This stack should be deployed first.
