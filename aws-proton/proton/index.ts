import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as command from "@pulumi/command";
import * as syncedFolder from "@pulumi/synced-folder";

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
  name: "aws-proton-workshop/pulumi-access-token",
  description: "A Pulumi access token",
});

new aws.secretsmanager.SecretVersion("pulumi-access-token-value", {
  secretId: secret.id,
  secretString: accessToken,
});

const bucket = new aws.s3.Bucket("proton-templates-bucket");


const rmNodeModules = new command.local.Command("rm-node-modules", {
  create: "rm -rf ../environment-vpc/v1/template/node_modules",
});

const folderSync = new syncedFolder.S3BucketFolder("proton-templates", {
  acl: aws.s3.PublicReadAcl,
  bucketName: bucket.bucket,
  path: "../proton-templates",
}, {
  dependsOn: rmNodeModules,
});

const createEnvTemplate = new command.local.Command("create-env-template", {
  create: "aws proton create-environment-template --name vpc"
});

const createEnvTemplateVersion = new command.local.Command("create-env-template-version", {
  create: pulumi.interpolate`aws proton create-environment-template-version --template-name vpc --source "s3={bucket=${bucket.bucket},key=environment-vpc}"`
}, {
  dependsOn: [folderSync, createEnvTemplate]
});

export const bucketName = bucket.bucket;