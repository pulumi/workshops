# pulumi-gitlab-integration

The repo contains a codebase to demonstrate integration between Pulumi Cloud and GitLab. The code in this repo is based upon the following primary sources:

* <https://www.pulumi.com/docs/using-pulumi/continuous-delivery/gitlab-ci/>
* <https://www.pulumi.com/docs/using-pulumi/continuous-delivery/gitlab-app/>

## TODOs

* Does the build get triggered by the initial add of files?
* Can we confirm that changes to .gitlab-ci.yml lag behind by one commit?
* GitLab SSO for previews on the webhook

## Optional Configuration

To deploy the infrastructure stack (that is, the code that gets added to the repo that serves as a demo for CI/CD) in a different org than the GitLab and AWS OIDC resources:

```bash
pulumi config set pulumiOrg some-other-org
```

To use this codebase with a GitLab private installation (i.e. not gitlab.com):

```bash
pulumi config set gitlabAudience "gitlab.example.com"
```

**NOTE:** This codebase is not tested with private GitLab installs and will likely require debugging if not run against gitlab.com.

## Demo steps

1. Pre-requisites:
    1. Ensure your SSH key is set up in GitLab.
    1. Ensure your have a `GITLAB_TOKEN` set in your environment.
    1. Ensure you have a `PULUMI_ACCESS_TOKEN` set in your environment
    1. Ensure you have AWS credentials per the provider setup.
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

1. Add a Pulumi program to the repo, e.g.:

    ```bash
    pulumi new container-aws-typescript --force # The force option must be set because there are already files in the repo.
    ```

Optional:

## Notes

*
