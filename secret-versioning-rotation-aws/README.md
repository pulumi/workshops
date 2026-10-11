# Secret versioning and rotation patterns on AWS

A 90-minute workshop (30 minutes of slides, 50 of demo, 10 of questions). You make an AWS Secrets Manager secret rotate on its own, read its current and previous version through Pulumi ESC without a static key, rotate an IAM user's access keys with the ESC `aws-iam` rotator, and block secrets that do not rotate before they deploy.

This workshop has no scheduled date yet. The slides are added on this branch by a later change.

## What attendees learn

- How Secrets Manager version labels work: `AWSCURRENT`, `AWSPENDING`, `AWSPREVIOUS`.
- How to wire a rotation Lambda and a `SecretRotation` with Pulumi IaC in TypeScript.
- How a Pulumi ESC environment reads the current and previous version with `aws-login` (OIDC) and `aws-secrets`.
- How the ESC `aws-iam` rotator rotates IAM user access keys.
- How a Pulumi policy pack fails a preview for a secret that has no rotation.

## Layout

```
secret-versioning-rotation-aws/
  README.md
  AGENTS.md
  .gitignore
  .shellcheckrc
  01-setup/
    check-prereqs.sh
  02-rotating-secret/
    .gitignore
    Pulumi.yaml
    package.json
    package-lock.json
    tsconfig.json
    index.ts
    foundation.ts
    rotatingSecret.ts
    lambda/
      rotation.py
    tests/
      test_rotation.py
  05-trigger-rotation/
    rotate.sh
  06-esc-environment/
    app-secrets.yaml
    create-env.sh
  07-env-run/
    run-app.sh
  08-iam-rotator/
    iam-keys.yaml
    rotate.sh
  09-require-rotation/
    .gitignore
    PulumiPolicy.yaml
    package.json
    package-lock.json
    tsconfig.json
    index.ts
    rules.ts
    test/
      rules.test.ts
  10-teardown/
    teardown.sh
```

One Pulumi project covers demo steps 2 to 4, so those three steps share the folder `02-rotating-secret/`. The config value `demoStep` stages it: `2` creates the foundation, `3` adds the secret, `4` adds the rotation.

## Prerequisites

- Pulumi CLI 3.268 or newer, logged in to Pulumi Cloud (`pulumi login`).
- Node.js 22, npm, `jq`.
- AWS CLI v2 and an AWS account you can create IAM, Lambda and Secrets Manager resources in. The AWS CLI needs its own credentials for steps 5, 8 and 10 (for example `aws sso login`). Pulumi itself gets credentials from your environment for steps 2 to 4.
- A Pulumi Cloud organization with Pulumi ESC.

Run `./01-setup/check-prereqs.sh` to check all of it.

## Run the demo

Replace `<org>` with your Pulumi organization.

```bash
# 1. check tools and logins
./01-setup/check-prereqs.sh

# 2-4. foundation, secret, rotation (stage with demoStep)
cd 02-rotating-secret
npm install
pulumi stack init dev
pulumi config set aws:region us-east-1
pulumi config set escOrg <org>
pulumi config set demoStep 2 && pulumi up
pulumi config set demoStep 3 && pulumi up
pulumi config set demoStep 4 && pulumi up
cd ..

# 5. rotate now and watch the labels move
./05-trigger-rotation/rotate.sh

# 6. ESC environment with the current and previous version
./06-esc-environment/create-env.sh <org>

# 7. use the secret without an AWS key
./07-env-run/run-app.sh <org>

# 8. rotate the IAM user's access keys with the ESC rotator
./08-iam-rotator/rotate.sh <org>

# 9. block a secret without rotation
cd 09-require-rotation && npm install && cd ../02-rotating-secret
pulumi config set extraSecret unrotated
pulumi preview --policy-pack ../09-require-rotation      # fails
pulumi config set extraSecret rotated
pulumi preview --policy-pack ../09-require-rotation      # passes
cd ..

# 10. clean up
./10-teardown/teardown.sh <org>
```

If the AWS account already has an IAM OIDC provider for `https://api.pulumi.com/oidc`, set `pulumi config set existingOidcProviderArn <arn>`. IAM allows one provider per URL.

## What was checked

Checked offline: both TypeScript projects compile, the rotation Lambda passes a unit test against a fake client, `pulumi preview` runs for `demoStep` 2, 3 and 4, and the policy pack fails the preview for an unrotated secret and passes for a rotated one. The scripts pass `shellcheck`.

Not checked yet: `pulumi up` and `pulumi destroy` on AWS, the AWS CLI steps (5, 8, 10), and the ESC environments (`pulumi env open`, `run`, `rotate`). These need a live account and a rehearsal before delivery.

## Sources

Read on 2026-10-11:

- https://www.pulumi.com/docs/esc/providers/aws-login/
- https://www.pulumi.com/docs/esc/providers/aws-secrets/
- https://www.pulumi.com/docs/esc/providers/rotators/aws-iam/
- https://www.pulumi.com/docs/esc/guides/configuring-oidc/aws/
- https://www.pulumi.com/docs/iac/cli/commands/pulumi_env_rotate/
- https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/
- https://www.pulumi.com/registry/packages/aws/api-docs/secretsmanager/secretrotation/
- https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets_lambda-functions.html
