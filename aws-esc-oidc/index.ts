import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
const pulumiOrg = config.get("pulumiOrg") ?? pulumi.getOrganization();

// The AWS backend will lower-case this value, which will cause a spurious diff,
// so we lower-case it here:
const AWS_OIDC_PROVIDER_THUMBPRINT = "990F4193972F2BECF12DDEDA5237F9C952F20D9E".toLowerCase();

const oidcProvider = new aws.iam.OpenIdConnectProvider("pulumi-cloud-oidc-provider", {
  clientIdLists: [pulumiOrg],
  url: "https://api.pulumi.com",
  thumbprintLists: [AWS_OIDC_PROVIDER_THUMBPRINT],
}, {
  deleteBeforeReplace: true, // URLs are unique identifiers and cannot be auto-named, so we have to delete before replace.
});

const role = new aws.iam.Role("escRole", {
  assumeRolePolicy: {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: {
          Federated: oidcProvider.arn,
        },
        Action: "sts:AssumeRoleWithWebIdentity",
        Condition: {
          StringEquals: {
            "api.pulumi.com/oidc:aud": pulumiOrg
          },
        },
      },
    ],
  },
});

new aws.iam.RolePolicyAttachment("gitlabAdminRolePolicy", {
  policyArn: "arn:aws:iam::aws:policy/AdministratorAccess",
  role: role.name,
});