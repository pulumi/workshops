import * as pulumi from "@pulumi/pulumi";
import * as command from "@pulumi/command";
import * as aws from "@pulumi/aws";

const org = new pulumi.Config().require("org");
const baseInfraStackRef = new pulumi.StackReference(`${org}/workshop-aws-proton-base-infra/dev`);
const bucketName = baseInfraStackRef.getOutput("bucketName");

export const svcTemplateFileKey = "service-container.tar.gz";

const svcTemplateFile = new aws.s3.BucketObject("service-template-v1", {
  bucket: bucketName,
  key: svcTemplateFileKey,
  source: new pulumi.asset.FileAsset("../../.templates/service-container.tar.gz")
});

const createSvcTemplate = new command.local.Command("create-svc-template", {
  create: "aws proton create-service-template --name fargate-service --pipeline-provisioning CUSTOMER_MANAGED",
  triggers: [svcTemplateFile.versionId],
});

const envTemplateStackRef = new pulumi.StackReference(`${org}/workshop-aws-proton-env-template/dev`);
const envTemplateName = envTemplateStackRef.getOutput("envTemplateName");
const envMajorVersion = envTemplateStackRef.getOutput("majorVersion");

const createSvcTemplateVersion = new command.local.Command("create-svc-template-version", {
  create: pulumi.interpolate`aws proton create-service-template-version --template-name fargate-service --compatible-environment-templates majorVersion=${envMajorVersion},templateName=${envTemplateName} --source "s3={bucket=${bucketName},key=${svcTemplateFileKey}}"`,
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
    dependsOn: createSvcTemplateVersion,
  });
});
