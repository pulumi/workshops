import * as pulumi from "@pulumi/pulumi";
import * as gitlab from "@pulumi/gitlab";
import * as fs from "fs";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
// Note: In a more prod-like scenario, this should be a required config value
// that uses an access token specifically for use with the Pulumi/GitLab
// integration, not a user's personal access token:
const pulumiAccessToken = config.get("pulumiAccessToken") ?? process.env["PULUMI_ACCESS_TOKEN"];

// For a private install, this would be e.g. "https://gitlab.example.com":
const audience = config.get("gitlabAudience") ?? "gitlab.com";

const project = new gitlab.Project("pulumi-gitlab-demo", {
  visibilityLevel: "public",
  defaultBranch: "main",
});

// Define an OIDC provider for GitLab
const AWS_OIDC_PROVIDER_THUMBPRINT = "9e99a48a9960b14926bb7f3b02e22da2b0ab7280";
const gitlabOidcProvider = new aws.iam.OpenIdConnectProvider("gitlab-oidc-provider", {
  clientIdLists: ["sts.amazonaws.com"], // Client ID for AWS
  url: `https://${audience}`,
  thumbprintLists: [AWS_OIDC_PROVIDER_THUMBPRINT],
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
          // TODO: Attempt to make the "gitlab.com" part configurable. This
          // might require some reflection since I don't think we can have
          // templated keys in static objects:
          StringEquals: {
            "gitlab.com:sub": pulumi.interpolate`project_path:${project.pathWithNamespace}:ref_type:branch:ref:*`
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

const projectHook = new gitlab.ProjectHook("project-hook", {
  project: project.id,
  url: "https://api.pulumi.com/workflow/gitlab",
  mergeRequestsEvents: true,
  enableSslVerification: true,
  token: pulumiAccessToken,
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

export const gitCloneCommand = pulumi.interpolate`git clone ${project.sshUrlToRepo}`;
