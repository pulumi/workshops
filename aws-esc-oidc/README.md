# aws-esc-oidc

This example creates an OIDC provider in AWS and creates a role that is assumable via [Pulumi ESC](https://www.pulumi.com/docs/pulumi-cloud/esc/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops).

Demo instructions:

1. Deploy the infrastructure

    ```bash
    pulumi up
    ```

1. Grab the Pulumi ESC environment YAML:

    ```bash
    pulumi stack output environment | pbcopy
    ```

1. Paste into an Environment in the Pulumi Cloud UI.
1. Run a sample command to demonstrate the Environment, e.g.:

    ```bash
    $ esc env run $(pulumi org get-default)/my-demo-environment -- aws sts get-caller-identity
    {
      "UserId": "AROA446DDKKXQORUZUCK4:my-esc-session",
      "Account": "886783038127",
      "Arn": "arn:aws:sts::886783038127:assumed-role/esc-role-cf0356a/my-esc-session"
    }
    ```

1. Add the `environment:` key to a Pulumi stack config file to demonstrate automatically passing environments to Pulumi programs.
