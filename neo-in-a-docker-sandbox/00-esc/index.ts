import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as tls from "@pulumi/tls";
import * as pulumiservice from "@pulumi/pulumiservice";

// Bootstrap for the workshop demo. Creates, in this order:
//   1. an IAM OIDC identity provider for https://api.pulumi.com/oidc (or reuses one),
//   2. an IAM role that only Pulumi ESC environments of your org, in the
//      `neo-workshop` ESC project, can assume through OIDC,
//   3. a least-privilege inline policy for the demo (S3 buckets with the demo prefix),
//   4. the Pulumi ESC environment <org>/neo-workshop/aws-oidc that turns the
//      role into short-lived AWS credentials (fn::open::aws-login) and exposes
//      them as environment variables and as `aws:region` stack config.
//
// After `pulumi up`, ../02-app imports that environment in Pulumi.dev.yaml and
// never sees a static AWS key.

const cfg = new pulumi.Config();
const pulumiOrg = cfg.require("pulumiOrg");
const escProject = cfg.get("escProject") ?? "neo-workshop";
const escEnvironment = cfg.get("escEnvironment") ?? "aws-oidc";
const bucketPrefix = cfg.get("bucketPrefix") ?? "neo-workshop-";
const sessionDuration = cfg.get("sessionDuration") ?? "1h";
const existingOidcProviderArn = cfg.get("existingOidcProviderArn");
const region = aws.getRegionOutput().apply((r) => r.region);
const account = aws.getCallerIdentityOutput().apply((c) => c.accountId);

// 1. OIDC provider. Pulumi ESC presents tokens with audience `aws:<org>`. The
//    thumbprint is read from the live certificate chain (AWS also trusts the
//    public CAs directly, but the API still requires a thumbprint).
let oidcProviderArn: pulumi.Output<string>;
if (existingOidcProviderArn) {
    oidcProviderArn = pulumi.output(existingOidcProviderArn);
} else {
    const cert = tls.getCertificateOutput({ url: "https://api.pulumi.com/oidc" });
    const provider = new aws.iam.OpenIdConnectProvider("pulumi-esc", {
        url: "https://api.pulumi.com/oidc",
        clientIdLists: [`aws:${pulumiOrg}`],
        thumbprintLists: [cert.certificates.apply((c) => c[c.length - 1].sha1Fingerprint)],
        tags: { workshop: "neo-in-a-docker-sandbox" },
    });
    oidcProviderArn = provider.arn;
}

// 2. The role ESC assumes. Subject claims look like
//    pulumi:environments:org:<org>:env:<project>/<environment>; the condition
//    limits assumption to environments in the neo-workshop ESC project.
const role = new aws.iam.Role("neo-workshop-esc", {
    name: "neo-workshop-esc",
    description: "Assumed by Pulumi ESC (OIDC) for the Neo in a Docker Sandbox demo",
    maxSessionDuration: 3600,
    assumeRolePolicy: oidcProviderArn.apply((arn) =>
        JSON.stringify({
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: "Allow",
                    Principal: { Federated: arn },
                    Action: "sts:AssumeRoleWithWebIdentity",
                    Condition: {
                        StringEquals: { "api.pulumi.com/oidc:aud": `aws:${pulumiOrg}` },
                        StringLike: {
                            "api.pulumi.com/oidc:sub": `pulumi:environments:org:${pulumiOrg}:env:${escProject}/*`,
                        },
                    },
                },
            ],
        }),
    ),
    tags: { workshop: "neo-in-a-docker-sandbox" },
});

// 3. Least privilege by resource: only buckets that start with the demo prefix
//    (plus the account-wide list call the AWS provider makes). The action list is
//    a wildcard on purpose: the pulumi-aws bucket resource reads a dozen bucket
//    sub-configurations on every refresh and each one is its own IAM action.
new aws.iam.RolePolicy("neo-workshop-esc-s3", {
    role: role.id,
    policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
            {
                Sid: "DemoBuckets",
                Effect: "Allow",
                Action: ["s3:*"],
                Resource: [`arn:aws:s3:::${bucketPrefix}*`, `arn:aws:s3:::${bucketPrefix}*/*`],
            },
            {
                Sid: "ListAll",
                Effect: "Allow",
                Action: ["s3:ListAllMyBuckets", "s3:GetBucketLocation"],
                Resource: "*",
            },
        ],
    }),
});

// 4. The ESC environment. `fn::open::aws-login` exchanges the ESC OIDC token for
//    STS credentials when the environment is opened (by `pulumi up`, `pulumi env
//    open` or `pulumi env run`). Nothing static is stored.
const environmentYaml = pulumi.all([role.arn, region]).apply(
    ([roleArn, awsRegion]) => `# Managed by ../00-esc (pulumi up). Opened by ../02-app on every pulumi operation.
values:
  aws:
    region: ${awsRegion}
    login:
      fn::open::aws-login:
        oidc:
          duration: ${sessionDuration}
          roleArn: ${roleArn}
          sessionName: neo-in-a-docker-sandbox
  environmentVariables:
    AWS_REGION: \${aws.region}
    AWS_ACCESS_KEY_ID: \${aws.login.accessKeyId}
    AWS_SECRET_ACCESS_KEY: \${aws.login.secretAccessKey}
    AWS_SESSION_TOKEN: \${aws.login.sessionToken}
  pulumiConfig:
    aws:region: \${aws.region}
`,
);

const environment = new pulumiservice.Environment("aws-oidc", {
    organization: pulumiOrg,
    project: escProject,
    name: escEnvironment,
    yaml: environmentYaml.apply((y) => new pulumi.asset.StringAsset(y)),
});

export const oidcProvider = oidcProviderArn;
export const roleArn = role.arn;
export const awsAccount = account;
export const escEnvironmentPath = pulumi.interpolate`${pulumiOrg}/${escProject}/${escEnvironment}`;
export const tryIt = pulumi.interpolate`pulumi env run ${pulumiOrg}/${escProject}/${escEnvironment} -- aws sts get-caller-identity`;
export const environmentDefinition = environmentYaml;
export const environmentUrn = environment.urn;
