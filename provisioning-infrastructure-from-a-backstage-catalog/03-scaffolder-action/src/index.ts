/**
 * Backstage scaffolder backend module: provisions S3 buckets from the
 * `pulumi:s3-bucket` custom action (workshop step 3).
 *
 * @packageDocumentation
 */
export { createS3BucketAction } from './actions/createS3BucketAction';
export {
  createS3BucketProgram,
  PULUMI_PROJECT_NAME,
} from './pulumi/s3BucketProgram';
export { scaffolderModulePulumiS3Bucket as default } from './module';
