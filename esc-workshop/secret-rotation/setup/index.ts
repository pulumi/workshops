import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as pcloud from "@pulumi/pulumiservice";
import * as random from "@pulumi/random";

// Create the first IAM user
const user1 = new aws.iam.User("user1", {
    name: "user1",
    path: "/",
});

export const envYaml = user1.arn.apply(
    arn => `
  values:
    rotated-creds:
        fn::rotate::aws-iam:
            inputs:
                region: us-west-1
                login: \${environments.aws.aws-oidc-admin.aws.login}
                userArn: ${arn}
  `,);

const org = pulumi.getOrganization();
const escProject = "esc-workshop";
const envName = "aws-secrets-rotation";

new pcloud.Environment("aws-rotate-user1", {
    organization: org,
    project: escProject,
    name: envName,
    yaml: envYaml.apply((yaml) => new pulumi.asset.StringAsset(yaml)),
  });
  