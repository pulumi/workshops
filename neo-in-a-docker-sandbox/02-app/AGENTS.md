# neo-workshop-app

Pulumi TypeScript project: one S3 bucket (`aws.s3.Bucket`, logical name `demo`)
in `index.ts`. It is the demo target of the "Neo in a Docker Sandbox" workshop.

## How to work here

- Stack: `dev` (config in `Pulumi.dev.yaml`). It imports a Pulumi ESC
  environment that mints short-lived AWS credentials at run time. Do not add
  AWS keys, profiles or `aws:accessKey` config.
- `aws:region` in `Pulumi.dev.yaml` is pinned to the one region this sandbox is
  allowed to reach. Do not change it, and do not set a region on a provider or
  a resource: any other region's endpoint is blocked by the network policy and
  fails with `unable to validate AWS credentials` (STS 403).
- Always run `pulumi preview` before `pulumi up`.
- Keep `protect: true` on the bucket, and do **not** add it to resources you
  create: teardown is a human's job on the host, and protecting the new
  resources makes the reset harder. Never run `pulumi destroy`,
  `pulumi stack rm`, `pulumi state delete` or `pulumi state unprotect`; the
  sandbox guard blocks them and a human runs teardown from the host.
- Prefer the `@pulumi/aws` v7 sub-resources when hardening the bucket:
  `aws.s3.BucketVersioning`, `aws.s3.BucketServerSideEncryptionConfiguration`,
  `aws.s3.BucketPublicAccessBlock`. Tag every resource with
  `workshop: neo-in-a-docker-sandbox`.
- `npm install` is already done in the sandbox image workflow; run it again if
  `node_modules/` is missing.
