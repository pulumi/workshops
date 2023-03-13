import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as command from "@pulumi/command";

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
});

new aws.secretsmanager.SecretVersion("pulumi-access-token-value", {
  secretId: secret.id,
  secretString: accessToken,
});

const bucket = new aws.s3.Bucket("proton-templates-bucket");

export const envTemplateFileKey = "environment-vpc.tar.gz";
const envTemplateName = "fargate-env";

const envTemplateFile = new aws.s3.BucketObject("environment-template-v1", {
  bucket: bucket.bucket,
  key: envTemplateFileKey,
  source: new pulumi.asset.FileAsset("../.templates/environment-vpc.tar.gz")
});


const createEnvTemplate = new command.local.Command("create-env-template", {
  create: `aws proton create-environment-template --name ${envTemplateName}`,
  triggers: [envTemplateFile.versionId],
});

const createEnvTemplateVersion = new command.local.Command("create-env-template-version", {
  create: pulumi.interpolate`aws proton create-environment-template-version --template-name ${envTemplateName} --source "s3={bucket=${bucket.bucket},key=${envTemplateFileKey}}"`,
  triggers: [Date.now()],
}, {
  dependsOn: [envTemplateFile, createEnvTemplate]
});

export const svcTemplateFileKey = "service-container.tar.gz";

const svcTemplateFile = new aws.s3.BucketObject("service-template-v1", {
  bucket: bucket.bucket,
  key: svcTemplateFileKey,
  source: new pulumi.asset.FileAsset("../.templates/service-container.tar.gz")
});

const createSvcTemplate = new command.local.Command("create-svc-template", {
  create: "aws proton create-service-template --name fargate-service",
  triggers: [svcTemplateFile.versionId],
});

createEnvTemplateVersion.stdout.apply(x => {
  const envCliOutput = JSON.parse(x);
  const envMajorVersion = envCliOutput.environmentTemplateVersion.majorVersion;
  const envMinorVersion = envCliOutput.environmentTemplateVersion.minorVersion;

  new command.local.Command("publish-env-template-version", {
    // We need to wait a few seconds for the Proton service to do initial
    // validation and change the status to DRAFT.
    create: `sleep 3 && aws proton update-environment-template-version --template-name ${envTemplateName} --major-version ${envMajorVersion} --minor-version ${envMinorVersion} --status PUBLISHED`,
  }, {
    dependsOn: createEnvTemplateVersion,
  });

  const createSvcTemplateVersion = new command.local.Command("create-svc-template-version", {
    create: pulumi.interpolate`aws proton create-service-template-version --template-name fargate-service --compatible-environment-templates majorVersion=${envMajorVersion},templateName=${envTemplateName} --source "s3={bucket=${bucket.bucket},key=${svcTemplateFileKey}}"`,
    triggers: [Date.now()],
  }, {
    dependsOn: [svcTemplateFile, createSvcTemplate]
  });

  createSvcTemplateVersion.stdout.apply(y => {
    const svcCliOutput = JSON.parse(y);
    const svcMajorVersion = svcCliOutput.serviceTemplateVersion.majorVersion;
    const svcMinorVersion = svcCliOutput.serviceTemplateVersion.minorVersion;

    new command.local.Command("publish-svc-template-version", {
      // We need to wait a few seconds for the Proton service to do initial
      // validation and change the status to DRAFT.
      create: `sleep 3 && aws proton update-service-template-version --template-name fargate-service --major-version ${svcMajorVersion} --minor-version ${svcMinorVersion} --status PUBLISHED`,
    }, {
      dependsOn: createEnvTemplateVersion,
    });
  });
});

export const bucketName = bucket.bucket;