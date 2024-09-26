# AWS Securing Pipelines

This folder contains a Pulumi program to demonstrate creating CI/CD pipelines in GitHub to deploy AWS infrastructure with ESC for credentials.

## Demo Steps

1. (Optional) Set up OIDC between Pulumi Cloud and AWS if it has not yet been configured:

    ```bash
    mkdir aws-ts-oidc-provider-pulumi-cloud
    cd aws-ts-oidc-provider-pulumi-cloud
    pulumi new https://github.com/pulumi/examples/tree/master/aws-ts-oidc-provider-pulumi-cloud
    pulumi up -y
    ```

    This will add an OIDC audience for your current org.

1. (Optional) Create an ESC environment that contains your GitHub provider configuration, e.g.:

    ```yaml
    values:
      pulumiConfig:
        github:owner: jkodroff # Replace this with your personal GH username
        github:token:
          fn::secret: gh_abc123 # Replace this with the value of a GH token that has repo scope and workflow scope (beacuse we are pushing workflow files)
    ```

    and add the environment to your `Pulumi.dev.yaml`:

    ```yaml
    environment:
      - github-jkodroff # or whatever you named the environment in Pulumi cloud
    ```

1. Deploy the prerequisite infrastructure (the VPC, the GitHub repo, and the ESC environment that contains its stack outputs):

    ```bash
    cd prereq-infra
    git push
    ```

1. When the operation has completed, clone the GitHub repo to a throwaway directory as indicated in the stack outputs, e.g.

    ```bash
    cd ~/tmp
    jkodroff/aws-securing-pipelines-infra-db5721f
    ```

1. Create a new branch in the repo:

    ```bash
    git checkout -b first-pr
    ```

1. Initialize a new Pulumi program in the repo

    ```bash
    pulumi new typescript --force
    ```

1. Add the following code and any necessary dependencies:

    ```typescript
    import * as pulumi from "@pulumi/pulumi";
    import * as aws from "@pulumi/aws";

    const config = new pulumi.Config();

    const vpcId = config.require("vpcId");
    const privateSubnetIds = config.requireObject<string[]>("privateSubnetIds");

    const nameTagValue = "aws-securing-pipelines";

    const sg = new aws.ec2.SecurityGroup("security-group", {
      vpcId: vpcId,
      description: "Allow all outbound traffic and no inbound traffic",
      egress: [{
        protocol: "-1",
        fromPort: 0,
        toPort: 0,
        cidrBlocks: ["0.0.0.0/0"],
      }],
      tags: {
        Name: nameTagValue
      }
    });

    const ami = aws.ec2.getAmiOutput({
      mostRecent: true,
      owners: ["amazon"],
      filters: [{
        name: "name",
        values: ["amzn2-ami-hvm-*-x86_64-gp2"],
      }],
    });

    new aws.ec2.Instance("my-server", {
      subnetId: privateSubnetIds[0],
      instanceType: aws.ec2.InstanceType.T3_Micro,
      ami: ami.id,
      vpcSecurityGroupIds: [sg.id],
      associatePublicIpAddress: true,
      tags: {
        Name: nameTagValue,
      },
    });
    ```

1. Commit the code and push the branch:

    ```bash
    git add -A
    git commit -m "Add some infra"
    git push
    ```

1. In the GH UI, create a pull request for the branch you just pushed. This will trigger the pull request GitHub Actions workflow that runs `pulumi preview`. It should fail because of the missing required configuration values and a lack of AWS credentials.
1. Add the default AWS region and the needed environments to `Pulumi.dev.yaml` (which you will need to create):

    ```yaml
    config:
      aws:region: us-west-2
    environment:
      - aws-oidc-env
      - aws-securing-pipelines/vpc-stackref
    ```
