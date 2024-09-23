import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
const pulumiOrg = config.get("pulumiOrg") ?? pulumi.getOrganization();

const PULUMI_CLOUD_OIDC_THUMBPRINT = "9e99a48a9960b14926bb7f3b02e22da2b0ab7280";


const oidcProvider = new aws.iam.OpenIdConnectProvider("pulumi-cloud-oidc-provider", {
  clientIdLists: [pulumiOrg],
  url: "https://api.pulumi.com/oidc",
  thumbprintLists: [PULUMI_CLOUD_OIDC_THUMBPRINT],
}, {
  deleteBeforeReplace: true, // URLs are unique identifiers and cannot be auto-named, so we have to delete before replace.
});

const role = new aws.iam.Role("esc-role", {
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
          // This condition restricts requests to only your Pulumi org:
          StringEquals: {
            "api.pulumi.com/oidc:aud": pulumiOrg
          },
        },
      },
    ],
  },
});

new aws.iam.RolePolicyAttachment("pulumi-esc-role-attachment", {
  policyArn: "arn:aws:iam::aws:policy/AdministratorAccess",
  role: role.name,
});

const secret1 = new aws.secretsmanager.Secret("secret-1");
new aws.secretsmanager.SecretVersion("secret-1-version", {
  secretId: secret1.id,
  secretString: "my-super-secret-value",
});

const secret2 = new aws.secretsmanager.Secret("secret-2");
new aws.secretsmanager.SecretVersion("secret-2-version", {
  secretId: secret2.id,
  secretString: "my-other-secret-value",
});


export const environment = pulumi.interpolate`
values: # This is a reserved key.
  aws: # Arbitrary key
    creds: # Arbitrary key
      fn::open::aws-login: # https://www.pulumi.com/docs/pulumi-cloud/esc/providers/aws-login/
        oidc:
          duration: 1h
          roleArn: ${role.arn}
          sessionName: "my-esc-session"
    secrets:
      fn::open::aws-secrets:
        region: us-west-2
        login: \${aws.creds}
        get:
          my-secret:
            secretId: ${secret1.id}
          my-other-secret:
            secretId: ${secret2.id}
  environmentVariables: # Reserved key. Outputs the values as env vars with \`esc env run\`
    AWS_ACCESS_KEY_ID: \${aws.creds.accessKeyId}
    AWS_SECRET_ACCESS_KEY: \${aws.creds.secretAccessKey}
    AWS_SESSION_TOKEN: \${aws.creds.sessionToken}
    AWS_REGION: us-west-2
  pulumiConfig:
    my-secret: \${aws.secrets.my-secret}
    my-other-secret: \${aws.secrets.my-other-secret}
`;

