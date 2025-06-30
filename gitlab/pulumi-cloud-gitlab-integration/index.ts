import * as pulumi from "@pulumi/pulumi";
import * as gitlab from "@pulumi/gitlab";
import * as fs from "fs";
import * as aws from "@pulumi/aws";
import * as pulumicloud from "@pulumi/pulumiservice";
import * as command from "@pulumi/command";
import * as random from "@pulumi/random";

const config = new pulumi.Config();

const gitlabGroup = config.require("gitlabGroup");

const group = gitlab.getGroup({
  fullPath: gitlabGroup,
});

const project = new gitlab.Project("pulumi-gitlab-demo", {
  visibilityLevel: "public",
  defaultBranch: "main",
  namespaceId: group.then(g => parseInt(g.id)),
});

const pulumiOrg = config.require("pulumiOrg");

const pulumiCloudOidc = aws.iam.getOpenIdConnectProviderOutput({
  url: "https://api.pulumi.com/oidc"
});

// In OIDC terminology, client IDs are the same thing as audiences. The name of
// the claim is "aud".
//
// There's no resource for an OIDC client ID, so we have to ensure the new
// Pulumi Org is added to the existing OIDC provider via the AWS CLI. Note that
// the create command is idempotent per the AWS CLI docs.
new command.local.Command("oidc-client-id", {
  create: pulumi.interpolate`aws iam add-client-id-to-open-id-connect-provider --open-id-connect-provider-arn ${pulumiCloudOidc.arn} --client-id ${pulumiOrg}`,
  delete: pulumi.interpolate`aws iam remove-client-id-from-open-id-connect-provider --open-id-connect-provider-arn ${pulumiCloudOidc.arn} --client-id ${pulumiOrg}`,
});

const policyDocument = pulumiCloudOidc.arn.apply(arn => aws.iam.getPolicyDocument({
  version: "2012-10-17",
  statements: [{
    effect: "Allow",
    actions: ["sts:AssumeRoleWithWebIdentity"],
    principals: [{
      type: "Federated",
      identifiers: [arn],
    }],
    conditions: [{
      test: "StringEquals",
      variable: "api.pulumi.com/oidc:aud",
      values: [pulumiOrg]
    }]
  }]
}));

const oidcRole = new aws.iam.Role("gitlab-cicd-admin-role", {
  assumeRolePolicy: policyDocument.json,
});

// Attach the AWS managed policy "AdministratorAccess" to the role.
new aws.iam.RolePolicyAttachment("gitlab-cicd-admin-role", {
  policyArn: "arn:aws:iam::aws:policy/AdministratorAccess",
  role: oidcRole.name,
});

const environmentYaml = oidcRole.arn.apply(arn => new pulumi.asset.StringAsset(`
values:
  aws:
    login:
      fn::open::aws-login:
        oidc:
          duration: 1h
          roleArn: ${arn}
          sessionName: pulumi-environments
          subjectAttributes:
            - currentEnvironment.name
            - pulumi.user.login
  environmentVariables:
    AWS_ACCESS_KEY_ID: \${aws.login.accessKeyId}
    AWS_SECRET_ACCESS_KEY: \${aws.login.secretAccessKey}
    AWS_SESSION_TOKEN: \${aws.login.sessionToken}
`));

new pulumicloud.Environment("aws-oidc-admin", {
  organization: pulumiOrg,
  name: "aws-oidc-admin2",
  yaml: environmentYaml
});

[
  "scripts/pulumi-preview.sh",
  "scripts/pulumi-up.sh",
  "scripts/setup.sh",
  ".gitlab-ci.yml",
].forEach(file => {
  const content = fs.readFileSync(`../repository-files/${file}`, "utf-8");

  new gitlab.RepositoryFile(file, {
    project: project.id,
    filePath: file,
    branch: "main",
    content: content,
    commitMessage: `Add ${file},`,
    encoding: "text",
  });
});

const randomString = new random.RandomString("org-token-suffix", {
  length: 6,
  lower: true,
  numeric: true,
});

const pulumiOrgToken = new pulumicloud.OrgAccessToken("pulumi-org-token", {
  name: pulumi.interpolate`gitlab-ci-cd-${randomString.result}`,
  organizationName: pulumiOrg,
  admin: false,
  description: "Used by GitLab CI/CD"
});

// GitLab hooks do not work with a Pulumi org token. See:
// https://github.com/pulumi/pulumi-service/issues/19501
//
// In a production scenario, this should be a required value and should be
// linked to a dummy user in GitLab.
//
// Once the above issue is resolved, we can remove this config value entirely
// and use the Pulumi Org token we create above.
const pulumiAccessToken = config.get("pulumiAccessToken") ?? process.env["PULUMI_ACCESS_TOKEN"] ?? "";

new gitlab.ProjectHook("project-hook-with-personal-token", {
  project: project.id,
  url: "https://api.pulumi.com/workflow/gitlab",
  mergeRequestsEvents: true,
  enableSslVerification: true,
  token: pulumiAccessToken,
  pushEvents: false,
});

// The Pulumi org token is used by GitLab CI/CD to authorize itself with Pulumi
// Cloud in order to open a Pulumi ESC environment and run Pulumi IaC commands:
new gitlab.ProjectVariable("pulumi-access-token", {
  project: project.id,
  key: "PULUMI_ACCESS_TOKEN",
  value: pulumiOrgToken.value,
  masked: true,
});

new gitlab.ProjectVariable("pulumi-org", {
  project: project.id,
  key: "PULUMI_ORG",
  value: pulumiOrg,
});


export const gitCloneCommand = pulumi.interpolate`git clone ${project.sshUrlToRepo}`;
export const pulumiNewCommand = pulumi.interpolate`pulumi new aws-typescript --stack ${pulumiOrg}/dev --force -y`;