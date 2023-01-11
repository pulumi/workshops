# tailscale

This folder contains code for the Pulumi/Tailscale workshop last given on 2023-01-13 by Josh Kodroff.

The code has the following structure:

- The `vpc` folder contains an AWSX VPC and an EC2 instance residing in a private subnet. The EC2 instance is an example of a host we want to connect to, but can't because it's not publicly accessible.
- The `subnet-router` folder contains an EC2 instance to be deployed to the private subnet. Its userdata installs [Tailscale](https://tailscale.com/) and configures the host as a [Subnet Router](https://tailscale.com/kb/1019/subnets/), which allows us to access any of the hosts in the private subnet as if they were in our own network.

## Prerequisites

1. Sign up for and install [Tailscale](https://tailscale.com/) on your development machine.
1. In the [Tailscale admin UI](https://login.tailscale.com/admin), under [Access Controls](https://login.tailscale.com/admin/acls), add the following to your default ACL:

    ```json
      // Allow any member of this Tailnet to create hosts with the bastion tag:
      "tagOwners": {
        "tag:bastion": ["autogroup:members"],
      },
      // Allow hosts with the bastion tag to advertise routes to our VPC's CIDR block:
      "autoApprovers": {
        "routes": {
          "10.0.0.0/16": ["tag:bastion"],
        },
      },
    ```

1. [Create a Tailnet API Key](https://login.tailscale.com/admin/settings/keys) and store its value in the environment variable `TAILSCALE_API_KEY`.
1. [Note your Tailnet's name](https://login.tailscale.com/admin/settings/general) (under Organization) and store its value in the environment variable `TAILSCALE_TAILNET`.
1. Ensure your AWS credentials are configured.

## Instructions

1. Deploy the VPC and private host:

    ```bash
    cd vpc && pulumi deploy -y
    ```

1. Output the private key to a local file. We'll use this to SSH into the host once we get our Tailnet set up:

    ```bash
    pulumi stack output sshPrivateKey --show-secrets > private_key
    chmod 600 private_key
    ```

1. Deploy the `subnet-router` stack:

    ```bash
    cd ../subnet-router && pulumi up -y
    ```

1. Connect to the private instance via:

    ```bash
    cd ../vpc
    ssh -o "IdentitiesOnly=yes" -i private_key ec2-user@$(pulumi stack output privateInstanceIp)
    ```
