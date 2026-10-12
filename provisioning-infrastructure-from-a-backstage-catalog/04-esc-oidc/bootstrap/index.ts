/**
 * One-time bootstrap for step 4 (04-esc-oidc). A presenter runs this once,
 * before the workshop. It does not run during the demo itself and it is not
 * part of the Backstage scaffolder action (03-scaffolder-action): that
 * action only ever creates `aws.s3.Bucket` / `aws.s3.BucketPolicy` resources
 * and assumes the trust relationship built here already exists.
 *
 * It creates the AWS-side half of an OIDC trust between Pulumi Cloud and
 * this AWS account:
 *   - an `aws.iam.OpenIdConnectProvider` for Pulumi Cloud's OIDC issuer
 *   - an `aws.iam.Role` that the `aws-login` ESC provider (../environment.yaml)
 *     assumes via `sts:AssumeRoleWithWebIdentity`, scoped to one Pulumi org
 *     and one ESC environment
 *   - an inline policy on that role granting only the S3 actions the demo
 *     needs, not `s3:*`
 *
 * Provider URL, audience format and trust-policy shape confirmed against
 * https://www.pulumi.com/docs/esc/guides/configuring-oidc/aws/ (read
 * 2026-09-30). That guide also documents an experimental one-command
 * alternative, `pulumi env setup aws`, which creates this same
 * provider/role/trust-policy and the ESC environment in a single step. This
 * program exists instead of that flag because the workshop wants the trust
 * policy's least-privilege S3 actions spelled out in reviewable code, not
 * generated implicitly.
 *
 * *** REPLACE BEFORE RUNNING ***
 * PULUMI_ORG below is a placeholder. It must become your real Pulumi
 * organization name before `pulumi up` produces a trust policy that
 * actually matches the tokens Pulumi Cloud issues for your org.
 */
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const PULUMI_ORG = "<your-pulumi-org>";

// Must match the ESC project/environment path used in ../environment.yaml
// and documented in ../AGENTS.md
// (`pulumi env init <org>/backstage-s3-bucket/backstage-demo`).
const ESC_PROJECT = "backstage-s3-bucket";
const ESC_ENVIRONMENT = "backstage-demo";

// Pulumi Cloud's OIDC issuer. Confirmed as exactly `https://api.pulumi.com/oidc`
// from the "Create the identity provider" section of the OIDC guide above,
// read 2026-09-30.
const PULUMI_OIDC_ISSUER_URL = "https://api.pulumi.com/oidc";

// The audience AWS checks in the trust policy's `aud` claim. The guide
// states: "the value is the name of your Pulumi organization prefixed with
// `aws:` (e.g. `aws:{org}`)" -- with one documented exception for the
// literal `default` project (not used here).
const PULUMI_OIDC_AUDIENCE = `aws:${PULUMI_ORG}`;

const oidcProvider = new aws.iam.OpenIdConnectProvider("pulumi-cloud", {
    url: PULUMI_OIDC_ISSUER_URL,
    clientIdLists: [PULUMI_OIDC_AUDIENCE],
    // No thumbprintLists: the guide's console flow does not collect one for
    // this provider, and the registry schema for this resource documents
    // that AWS auto-retrieves the intermediate CA thumbprint from the IdP's
    // own server certificate whenever thumbprintLists is omitted.
    tags: {
        workshop: "provisioning-infrastructure-from-a-backstage-catalog",
    },
});

// Scopes sts:AssumeRoleWithWebIdentity to exactly one Pulumi org and one ESC
// environment. The guide's own trust-policy example uses StringLike with a
// trailing `env:*` wildcard to allow any environment in the org; this
// narrows that to StringEquals on one subject, by path
// `<ESC_PROJECT>/<ESC_ENVIRONMENT>`, per the guide's "Subject claim
// customization" section (default subject shape:
// `pulumi:environments:org:<org>:env:<project>/<environment>`).
const trustPolicy = pulumi.jsonStringify({
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
                    "api.pulumi.com/oidc:aud": PULUMI_OIDC_AUDIENCE,
                    "api.pulumi.com/oidc:sub": `pulumi:environments:org:${PULUMI_ORG}:env:${ESC_PROJECT}/${ESC_ENVIRONMENT}`,
                },
            },
        },
    ],
});

const role = new aws.iam.Role("backstage-scaffolder-oidc", {
    description:
        "Assumed by Pulumi ESC (fn::open::aws-login) on behalf of the backstage-s3-bucket/backstage-demo environment. Grants only the S3 actions the scaffolder demo needs.",
    assumeRolePolicy: trustPolicy,
    // Matches ../environment.yaml's `duration: 1h` explicitly rather than
    // relying on AWS's own default (which is also one hour). The aws-login
    // troubleshooting guide warns that a `duration` above this role's
    // MaxSessionDuration fails at login time, so this keeps the two values
    // visibly tied together instead of leaving the match implicit.
    maxSessionDuration: 3600,
    tags: {
        workshop: "provisioning-infrastructure-from-a-backstage-catalog",
    },
});

// Least-privilege for this demo: the six S3 bucket-level actions the
// Automation API program in 03-scaffolder-action actually calls (create,
// tag, and policy the bucket; read back its policy/tags; delete it), and
// nothing else -- not `s3:*`. Resource is scoped to the S3 service, not to
// one fixed bucket name, because the Backstage form lets each attendee
// choose their own bucket name at request time, so this program cannot know
// it in advance. A production deployment of this pattern would typically
// also constrain Resource to a bucket-name prefix the organization reserves
// for scaffolded resources (e.g. "arn:aws:s3:::backstage-*"); this workshop
// does not enforce a naming prefix on the Backstage template (02-template),
// so that narrower Resource is not applied here.
new aws.iam.RolePolicy("backstage-scaffolder-s3-demo", {
    role: role.id,
    policy: pulumi.jsonStringify({
        Version: "2012-10-17",
        Statement: [
            {
                Effect: "Allow",
                Action: [
                    "s3:CreateBucket",
                    "s3:PutBucketPolicy",
                    "s3:PutBucketTagging",
                    "s3:DeleteBucket",
                    "s3:GetBucketPolicy",
                    "s3:GetBucketTagging",
                ],
                Resource: "arn:aws:s3:::*",
            },
        ],
    }),
});

export const oidcProviderArn = oidcProvider.arn;
export const roleArn = role.arn;
