/**
 * Inline Pulumi Automation API program that provisions a single tagged S3
 * bucket plus a TLS-only bucket policy.
 *
 * This is the one and only copy of the resource graph: it is imported by
 * both the scaffolder action handler (`../actions/createS3BucketAction.ts`)
 * and the offline preview driver (`../../test/preview.ts`), so testing the
 * driver exercises the exact code the action runs in production.
 *
 * Scope note: this program creates only `aws.s3.Bucket` and
 * `aws.s3.BucketPolicy`. The IAM role / OIDC provider that the workshop
 * brief mentions belongs to step 4 (04-esc-oidc), which bootstraps the
 * credentials this action's Backstage backend process assumes are already
 * available (via Pulumi ESC) -- it is deliberately not part of this
 * program.
 *
 * Deviation from the workshop plan, confirmed 2026-09-30: the workshop plan's
 * sources call the bucket resource `aws.s3.BucketV2`. The Pulumi registry
 * page for that resource (https://www.pulumi.com/registry/packages/aws/api-docs/s3/bucketv2/,
 * read 2026-09-30) now reads "Deprecated: s3.BucketV2 has been deprecated
 * in favor of s3.Bucket". This program uses `aws.s3.Bucket` instead.
 */
import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import type { PulumiFn } from '@pulumi/pulumi/automation';

/** Pulumi project name shared by every stack this action creates. */
export const PULUMI_PROJECT_NAME = 'backstage-s3-bucket';

/** Applied to every resource this program creates. */
const WORKSHOP_TAG = 'provisioning-infrastructure-from-a-backstage-catalog';

export interface S3BucketProgramArgs {
  /** Name of the S3 bucket to create. Must be a valid, globally-unique S3 bucket name. */
  bucketName: string;
  /** Value of the `team` tag. Omit it and the step 6 policy pack blocks the update. */
  team?: string;
}

/**
 * Builds the Automation API inline program function for a given bucket
 * name. The returned function is passed as `program` to
 * `LocalWorkspace.createOrSelectStack` and is executed in-process by the
 * Pulumi engine -- it is not a separate CLI invocation.
 */
export function createS3BucketProgram(args: S3BucketProgramArgs): PulumiFn {
  const { bucketName, team } = args;

  return async () => {
    const tags = {
      workshop: WORKSHOP_TAG,
      Name: `backstage-${bucketName}`,
      ...(team ? { team } : {}),
    };

    const bucket = new aws.s3.Bucket('scaffolded-bucket', {
      bucket: bucketName,
      tags,
    });

    const denyInsecureTransportPolicy = pulumi.jsonStringify({
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'DenyInsecureTransport',
          Effect: 'Deny',
          Principal: '*',
          Action: 's3:*',
          Resource: [bucket.arn, pulumi.interpolate`${bucket.arn}/*`],
          Condition: {
            Bool: { 'aws:SecureTransport': 'false' },
          },
        },
      ],
    });

    new aws.s3.BucketPolicy('scaffolded-bucket-policy', {
      bucket: bucket.id,
      policy: denyInsecureTransportPolicy,
    });

    return {
      bucketName: bucket.bucket,
      bucketArn: bucket.arn,
    };
  };
}
