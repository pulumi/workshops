import * as pulumi from "@pulumi/pulumi";
import * as command from "@pulumi/command";
import * as aws from "@pulumi/aws";

const envTemplateFileKey = "environment-vpc.tar.gz";
export const envTemplateName = "fargate-env";

const org = new pulumi.Config().require("org");
const stackRef = new pulumi.StackReference(`${org}/workshop-aws-proton-base-infra/dev`);
const bucketName = stackRef.getOutput("bucketName");

const envTemplateFile = new aws.s3.BucketObject("env-template", {
  bucket: bucketName,
  key: envTemplateFileKey,
  source: new pulumi.asset.FileAsset("../../.templates/environment-vpc.tar.gz")
});

const createEnvTemplate = new command.local.Command("create-env-template", {
  create: `aws proton create-environment-template --name ${envTemplateName}`,
  triggers: [envTemplateFile.versionId],
});

const createEnvTemplateVersion = new command.local.Command("create-env-template-version", {
  create: pulumi.interpolate`aws proton create-environment-template-version --template-name ${envTemplateName} --source "s3={bucket=${bucketName},key=${envTemplateFileKey}}"`,
  triggers: [Date.now()],
}, {
  dependsOn: [envTemplateFile, createEnvTemplate]
});

const version = createEnvTemplateVersion.stdout.apply(x => {
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

  return {
    major: envMajorVersion,
    minor: envMinorVersion
  };
});

export const majorVersion = version.major;
export const minorVersion = version.minor;