# az-oidc-setup

This Pulumi program configures OIDC and Pulumi Deployments for the default branch of a repository stored in GitHub.

## Setup

1. Ensure the Pulumi GitHub app is installed in your Pulumi org.
1. Create a GitHub repository in the GitHub org configured with the Pulumi GitHub App. (Note that only a single GitHub org can be targeted by the Pulumi GitHub App, and that the Pulumi GitHub App can only be installed in a single)

## Configuration

The following configuration values are required:

```bash
pulumi config set pulumiProject my-az-app # The name of the project for which you want to set up Deployments.
pulumi config set githubRepo org/repo # The GitHub repository in which the code for the project is stored.
```

The following configuration values are optional:

```bash
pulumi config set pulumiOrg my-pulumi-org # The Pulumi org in which your project's stacks live. Defaults to the user's default org.
pulumi config set defaultBranch master # The branch to which merge commits should trigger `pulumi deploy` in Deployments. Defaults to "main".
pulumi config set pulumiStack prod # The stack on which Deployments should be configured. Defaults to "dev".
```
