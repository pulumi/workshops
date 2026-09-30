# 03-scaffolder-action

## What this is

A Backstage **scaffolder backend module**, not a standalone application. It
registers one custom scaffolder action, `pulumi:s3-bucket`, whose handler
uses the Pulumi Automation API to provision a real S3 bucket. It is meant to
be added as a dependency of a Backstage backend's `packages/backend`
(consuming its default export, `scaffolderModulePulumiS3Bucket`, via
`backend.add(...)`), not run on its own.

The template that invokes this action lives in `../02-template/template.yaml`
(the custom action ID `pulumi:s3-bucket` is the contract between the two).

## Layout

- `src/pulumi/s3BucketProgram.ts` -- the inline Pulumi Automation API program
  (`aws.s3.Bucket` + `aws.s3.BucketPolicy`, both tagged). This is the single
  source of truth for the resource graph: both the scaffolder action and the
  offline test driver import `createS3BucketProgram` from here.
- `src/actions/createS3BucketAction.ts` -- the `createTemplateAction`
  definition and its `handler`, which drives `LocalWorkspace` from
  `@pulumi/pulumi/automation`.
- `src/module.ts` -- the `createBackendModule` that registers the action
  against `scaffolderActionsExtensionPoint` (new Backstage backend system).
- `src/index.ts` -- package entry point; exports the module as `default`.
- `test/preview.ts` -- offline verification driver (see below). Not part of
  the published module; it exists only to prove the resource graph is
  structurally sound without needing AWS credentials.

## Building

```bash
npm install
npx tsc --noEmit
```

## What was actually verified in this build, and what was not

**`pulumi up` was never run against real AWS.** This workstation has no AWS
credentials and no Docker, so the action's `handler` has never been executed
against a real Backstage instance and no real S3 bucket has ever been
created by this code. The Backstage UI end-to-end flow (rendering the
template, clicking "Create", watching the task log) has also never been
exercised here, for the same reason -- there is no Docker available to run a
Backstage instance.

What **was** verified, honestly and directly against this code (not a copy
of it):

1. `npm install && npx tsc --noEmit` passes with no errors against the
   installed `@backstage/backend-plugin-api`, `@backstage/plugin-scaffolder-node`,
   `@pulumi/pulumi`, and `@pulumi/aws` type definitions.
2. `npx tsx test/preview.ts` runs `LocalWorkspace.createOrSelectStack` and
   `stack.preview()` (never `.up()`) against:
   - a local file-backed Pulumi state (`PULUMI_BACKEND_URL=file:///tmp/...`),
     so no Pulumi Cloud account is involved, and
   - dummy AWS credentials plus the AWS classic provider's
     `skipCredentialsValidation` / `skipMetadataApiCheck` /
     `skipRequestingAccountId` / `skipRegionValidation` config flags, so the
     provider plugin builds the resource graph without calling AWS.

   This produced a clean preview showing exactly the two resources this
   program declares (`aws:s3:Bucket` and `aws:s3:BucketPolicy`) as pending
   creates, with the `bucketName` output resolving correctly and no errors.
   It proves the program's shape (types, resource wiring, config keys) is
   correct; it does not prove AWS would accept the actual `CreateBucket` /
   `PutBucketPolicy` API calls.
3. `../02-template/template.yaml` parses as valid YAML and matches the
   `apiVersion: scaffolder.backstage.io/v1beta3` schema described in the
   Backstage docs.

Re-run the offline check yourself with:

```bash
npx tsx test/preview.ts
```

## Scope note: no IAM role in this program

The workshop brief's prose mentions an IAM role alongside the bucket and
bucket policy. This module's Pulumi program deliberately creates **only**
`aws.s3.Bucket` and `aws.s3.BucketPolicy`. The IAM role and OIDC provider
belong to workshop step 4 (`../04-esc-oidc/`), which bootstraps the
credentials this backend process assumes it already has (via Pulumi ESC) --
they are prerequisite infrastructure for this action to run, not resources
this action itself creates.

## Deviation from the brief: `aws.s3.Bucket`, not `aws.s3.BucketV2`

The workshop brief's sources call for `aws.s3.BucketV2`. As of 2026-09-30,
https://www.pulumi.com/registry/packages/aws/api-docs/s3/bucketv2/ states:
"Deprecated: s3.BucketV2 has been deprecated in favor of s3.Bucket". This
program uses `aws.s3.Bucket` throughout instead.
