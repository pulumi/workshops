import * as pulumi from "@pulumi/pulumi";
import * as gitlab from "@pulumi/gitlab";
import * as fs from "fs";
import * as aws from "@pulumi/aws";
import * as pulumicloud from "@pulumi/pulumiservice";

const config = new pulumi.Config();

// Note: In a more prod-like scenario, this should be a required config value
// that uses an access token specifically for use with the Pulumi/GitLab
// integration, not a user's personal access token:
const pulumiAccessToken = config.get("pulumiAccessToken") ?? process.env["PULUMI_ACCESS_TOKEN"] ?? "";

// For a private install, this would be e.g. "https://gitlab.example.com":
const audience = config.get("gitlabAudience") ?? "gitlab.com";

const gitlabGroup = config.require("gitlabGroup");

// TODO: Make this configurable and add instructions to set up a Pulumi org.
const group = gitlab.getGroup({
  fullPath: gitlabGroup,
});

const project = new gitlab.Project("pulumi-gitlab-demo", {
  visibilityLevel: "public",
  defaultBranch: "main",
  namespaceId: group.then(g => parseInt(g.id)),
});

// This value is obtained by following these instructions:
// https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc_verify-thumbprint.html
// A copy of the certificate at the time of writing from which we obtained this
// value is present in ../doc/gitlab.crt:
const GITLAB_OIDC_PROVIDER_THUMBPRINT = "B3DD7606D2B5A8B4A13771DBECC9EE1CECAFA38A".toLowerCase();

const gitlabOidcProvider = new aws.iam.OpenIdConnectProvider("gitlab-oidc-provider", {
  clientIdLists: [`https://${audience}`],
  url: `https://${audience}`,
  thumbprintLists: [GITLAB_OIDC_PROVIDER_THUMBPRINT],
}, {
  deleteBeforeReplace: true, // URLs are unique identifiers and cannot be auto-named, so we have to delete before replace.
});

// Define a role
const gitlabAdminRole = new aws.iam.Role("gitlabAdminRole", {
  assumeRolePolicy: {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: {
          Federated: gitlabOidcProvider.arn,
        },
        Action: "sts:AssumeRoleWithWebIdentity",
        Condition: {
          StringLike: {
            // Note: Square brackets around the key are what allow us to use a
            // templated string. See:
            // https://stackoverflow.com/questions/59791960/how-to-use-template-literal-as-key-inside-object-literal
            [`${audience}:sub`]: pulumi.interpolate`project_path:${project.pathWithNamespace}:ref_type:branch:ref:*`
          },
        },
      },
    ],
  },
});

// Attach the AWS managed policy "AdministratorAccess" to the role.
new aws.iam.RolePolicyAttachment("gitlabAdminRolePolicy", {
  policyArn: "arn:aws:iam::aws:policy/AdministratorAccess",
  role: gitlabAdminRole.name,
});

new gitlab.ProjectHook("project-hook", {
  project: project.id,
  url: "https://api.pulumi.com/workflow/gitlab",
  mergeRequestsEvents: true,
  enableSslVerification: true,
  token: pulumiAccessToken,
  pushEvents: false,
});

[
  "scripts/aws-auth.sh",
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

// The role ARN is consumed during the CI/CD process when we authenticate to AWS.
new gitlab.ProjectVariable("role-arn", {
  project: project.id,
  key: "ROLE_ARN",
  value: gitlabAdminRole.arn,
});

const pulumiOrg = config.get("pulumiOrg") ?? pulumi.getOrganization();
const pulumiOrgToken = new pulumicloud.OrgAccessToken("pulumi-org-token", {
  name: "GitLab CI/CD",
  organizationName: pulumiOrg,
  admin: false,
});

pulumiOrgToken.value.apply(x => {
  new gitlab.ProjectVariable("pulumi-access-token", {
    project: project.id,
    key: "PULUMI_ACCESS_TOKEN",
    value: x!,
    masked: true,
  });
});

new gitlab.ProjectVariable("pulumi-org", {
  project: project.id,
  key: "PULUMI_ORG",
  value: pulumiOrg,
});


export const gitCloneCommand = pulumi.interpolate`git clone ${project.sshUrlToRepo}`;
