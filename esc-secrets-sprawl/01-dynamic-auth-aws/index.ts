// Copyright 2024, Pulumi Corporation.  All rights reserved.

import * as aws from "@pulumi/aws";
import * as command from "@pulumi/command";
import * as pulumi from "@pulumi/pulumi";
import * as pulumiservice from "@pulumi/pulumiservice";
import * as tls from "@pulumi/tls";

// Configurations
const audience = pulumi.getOrganization();
const oidcIdpUrl: string = "https://api.pulumi.com/oidc";

// Get TLS thumbprint for OIDC Provider
const certs = tls.getCertificateOutput({
  url: oidcIdpUrl,
});
const thumbprint = certs.certificates[0].sha1Fingerprint;

function getProviderArn() {
  console.log("Creating OIDC Provider ...");
  const provider = new aws.iam.OpenIdConnectProvider("oidcProvider", {
    // clientIdLists: [audience],
    clientIdLists: [`aws:${audience}`], // New format after namespace update
    url: oidcIdpUrl,
    thumbprintLists: [thumbprint],
    tags: {
      "pulumi:organization": audience
    }
  }, {
    protect: false,
  });
  return provider.arn;
}

export const arn: pulumi.Output<string> = getProviderArn();

const policyDocument = arn.apply(arn => aws.iam.getPolicyDocument({
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
      variable: `api.pulumi.com/oidc:aud`,
      // values: [audience],
      values: [`aws:${audience}`], // New format after namespace update
    }],
  }],
}));

// Create a new role that can be assumed by the OIDC provider
const role = new aws.iam.Role("role", {
  name: 'pulumi',
  description: 'Access privileges for the Pulumi OIDC integration',
  maxSessionDuration: 3600,
  assumeRolePolicy: policyDocument.json,
});

// Attach the AWS managed policy "AdministratorAccess" to the role.
const rpa = new aws.iam.RolePolicyAttachment("policy", {
  policyArn: "arn:aws:iam::aws:policy/AdministratorAccess",
  role: role.name,
});

const envJson = pulumi.jsonStringify({
  "values": {
    "aws": {
      "login": {
        "fn::open::aws-login": {
          "oidc": {
            "duration": "1h",
            "roleArn": role.arn,
            "sessionName": "pulumi-sbx",
          },
        },
      },
      "secrets": {
        "fn::open::aws-secrets": {
          "region": "us-east-1",
          "login": "${aws.login}",
          "get": {
            "slackWebhookURL": {
              "secretId": "slack-webhook-url-plaintext"
            }
          }
        }
      }
    },
    "environmentVariables": {
      "AWS_ACCESS_KEY_ID": "${aws.login.accessKeyId}",
      "AWS_SECRET_ACCESS_KEY": "${aws.login.secretAccessKey}",
      "AWS_SESSION_TOKEN": "${aws.login.sessionToken}",
    },
    "pulumiConfig": {
      "aws:region": "us-east-1",
      "environment": "sbx",
      "slackWebhookURL": "${aws.secrets.slackWebhookURL}"
    }
  },
});

const envAsset = envJson.apply(json => new pulumi.asset.StringAsset(json));

// Create a new environment
const env = new pulumiservice.Environment("aws-sbx", {
  name: "sbx",
  project: "aws",
  organization: audience,
  yaml: envAsset,
});

// Set team permissions
const adminPermissions = new pulumiservice.TeamEnvironmentPermission("admin", {
  organization: audience,
  project: env.project,
  environment: env.name,
  team: "Admin",
  permission: pulumiservice.EnvironmentPermission.Admin
});

const platformPermissions = new pulumiservice.TeamEnvironmentPermission("platform", {
  organization: audience,
  project: env.project,
  environment: env.name,
  team: "Platform",
  permission: pulumiservice.EnvironmentPermission.Write
});

const cicdPermissions = new pulumiservice.TeamEnvironmentPermission("cicd", {
  organization: audience,
  project: env.project,
  environment: env.name,
  team: "cicd",
  permission: pulumiservice.EnvironmentPermission.Open
});