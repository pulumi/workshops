# pulumi-gitlab-integration

The repo contains a codebase to demonstrate the various points of integration between Pulumi Cloud and GitLab. The code in this repo is based upon the following primary sources:

* [https://www.pulumi.com/docs/using-pulumi/continuous-delivery/gitlab-ci]<https://www.pulumi.com/docs/using-pulumi/continuous-delivery/gitlab-ci/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops>
* [https://www.pulumi.com/docs/using-pulumi/continuous-delivery/gitlab-app]<https://www.pulumi.com/docs/using-pulumi/continuous-delivery/gitlab-app/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops>

The code creates a an GitLab project for use with a Pulumi IaC codebase with a GitLab CI/CD pipeline defined, along with supporting resources to allow the pipeline to use Pulumi ESC to grab temporary AWS credentials via OIDC.

## Prerequisites

1. Ensure you have a GitLab group created.
1. Ensure your SSH key is set up in GitLab.
1. Ensure you have Pulumi Org created which uses GitLab as its identity provider (a trial org will work), configured with your GitLab group as the identity source.

    **NOTE:** You must have a Pulumi org configured to use the GitLab Group as its identity provider or the GitLab webhook which shows preview results as Merge Request comments will not work. Since a Pulumi org can only use one source for identity, you may need to create a trial Pulumi org to run this demo.

1. Ensure you have AWS credentials per the provider setup.
1. The codebase assumes that the AWS environment already has an OIDC provider configured for Pulumi Cloud (`https://api.pulumi.com/oidc`). If your AWS environment does not have an OIDC provider configured, see [Configuring OpenID Connect for AWS](https://www.pulumi.com/docs/pulumi-cloud/oidc/provider/aws/).

    You do not need to add your Pulumi Cloud organization as a client ID (OIDC audience) - the code does that for you.

1. (Optional) Create an ESC environment named `gitlab`. This will be used to deploy the demo resources to GitLab and is a simple example of how to use ESC for both static secrets and config values:

    ```yaml
    values:
    gitlab:
        token:
            fn::secret: glpat-fjdsufidosufiodsu # Your actual GL token value goes here
        group: jkodroff # Your GitLab group name goes here
    environmentVariables:
        GITLAB_TOKEN: ${gitlab.token}
    pulumiConfig:
        gitlabGroup: ${gitlab.group}
    ```

    Be sure to add the environment to your stack config:

    ```yaml
    enviroment:
        - gitlab
    ```

## Required Configuration

### GitLab Group

Set the name of the GitLab group in which your repository will go:

```bash
pulumi config set gitlabGroup <your-gitlab-group-name>
```

### Pulumi Organization

Set the name of the Pulumi organization that will be used by the GitLab pipelines.

```bash
pulumi config set pulumiOrg some-other-org
```

## Demo steps

1. Deploy the AWS OIDC resources, GitLab repo, and files:

    ```bash
    cd pulumi-cloud-gitlab-integration
    pulumi up -y
    ```

1. Copy the git clone command:

    ```bash
    pulumi stack output gitCloneCommand | pbcopy
    ```

1. Clone the repo to a temporary directory:

    ```bash
    cd $(mktemp -d) && $(pbpaste)
    ```

1. Switch to a branch in the repo:

    ```bash
    git checkout -b my-branch
    ```

1. Add a Pulumi program to the repo. You can use the `pulumiNewCommand` output from the stack similar to `gitCloneCommand` above. The `aws-typescript` template creates a single S3 bucket.
1. Push the branch:

    ```bash
    git add -A && git commit -m "Add some infra." && git push
    ```

1. Create a Merge Request in the GitLab UI. This will trigger a `pulumi preview`. If the webhook is correctly configured (i.e. if the stack's Pulumi org is configured to use the corresponding GitLab group), you will see the results of the preview operation posted as a comment to your Merge Request.
1. Merge the branch. This will trigger a `pulumi up` operation.

From here, you may optionally want to add policy as code to the repo.

## Troubleshooting

Changes to `.gitlab-ci.yml` may lag behind by one commit. (Haven't tested in isolation to make sure, but the author seems to have observed this.)

If you get this error message:

```text
Failed to create GitLab Client from provider configuration: The provider failed to create a new GitLab Client from the given configuration: invalid character '<' looking for beginning of value
```

Your GitLab token is likely invalid (even though it may not show as expired). Generate a new one and reset the `GITLAB_TOKEN` env var.
