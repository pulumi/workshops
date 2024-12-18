import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as random from "@pulumi/random";
import * as pcloud from "@pulumi/pulumiservice";

const config = new pulumi.Config();

const gitHubToken = config.requireSecret("githubToken");

const secret = new aws.secretsmanager.Secret("github-token", {
  description: "GitHub token for ESC.",
  recoveryWindowInDays: 0
});

new aws.secretsmanager.SecretVersion("github-token", {
  secretId: secret.id,
  secretString: gitHubToken
});

export const envYaml = secret.name.apply(name => `
imports:
  - aws/aws-oidc-admin
values:
  aws:
    secrets:
      fn::open::aws-secrets:
        region: us-west-2
        login: \${aws.login}
        get:
          github-token:
            secretId: ${name}
  pulumiConfig:
    githubToken: \${aws.secrets.github-token}
`);

// TODO: Remove this random suffix once this is resolved:
// https://github.com/pulumi/pulumi-pulumiservice/issues/424
const suffix = new random.RandomString("env-name-suffix", {
  length: 6,
  special: false
});

const org = pulumi.getOrganization();
const escProject = "esc-workshop";
const envName = pulumi.interpolate`aws-secrets-${suffix.result}`;

export const command = pulumi.interpolate`pulumi config env add ${escProject}/${envName}`;

new pcloud.Environment("aws-secrets", {
  organization: org,
  project: escProject,
  name: envName,
  yaml: envYaml.apply(yaml => new pulumi.asset.StringAsset(yaml))
});
