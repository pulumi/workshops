import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const assumeRolePolicy = {
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Service": "codebuild.amazonaws.com"
    },
    "Action": "sts:AssumeRole"
  }]
};

const codeProvisioningRole = new aws.iam.Role("proton-codebuild-provisioning", {
  assumeRolePolicy: JSON.stringify(assumeRolePolicy),
});

// We give our provisioning role Full Access because many commonly used AWS
// resources like Lambda functions require the ability to create IAM principals.
// Only full administrators can create IAM principals.
new aws.iam.RolePolicyAttachment("proton-codebuild-fulladmin", {
  role: codeProvisioningRole.name,
  policyArn: "arn:aws:iam::aws:policy/AdministratorAccess",
});

const config = new pulumi.Config();
const accessToken = config.requireSecret("pulumiAccessToken");

const secret = new aws.secretsmanager.Secret("pulumi-access-token", {
  name: "aws-proton/pulumi-access-token",
  description: "A Pulumi access token",
  forceOverwriteReplicaSecret: true,
  recoveryWindowInDays: 0,
});

new aws.secretsmanager.SecretVersion("pulumi-access-token-value", {
  secretId: secret.id,
  secretString: accessToken,
});

const bucket = new aws.s3.Bucket("proton-templates-bucket");

export const bucketName = bucket.bucket;