/**
 * Custom scaffolder action `pulumi:s3-bucket` (workshop step 3).
 *
 * Provisions a single Amazon S3 bucket, tagged and with a TLS-only bucket
 * policy, by driving the Pulumi Automation API against the inline program
 * in `../pulumi/s3BucketProgram.ts`.
 *
 * Input/output schema style and the `createTemplateAction` shape are
 * confirmed against https://backstage.io/docs/features/software-templates/writing-custom-actions/
 * (read 2026-09-30), which shows a Zod-based `schema.input`/`schema.output`
 * (each field a `z => z.<type>({ description })` builder function) rather
 * than a plain JSON Schema object.
 */
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { LocalWorkspace } from '@pulumi/pulumi/automation';
import {
  createS3BucketProgram,
  PULUMI_PROJECT_NAME,
} from '../pulumi/s3BucketProgram';

export const createS3BucketAction = () => {
  return createTemplateAction({
    id: 'pulumi:s3-bucket',
    description:
      'Provisions a tagged Amazon S3 bucket and a TLS-only bucket policy via the Pulumi Automation API.',
    schema: {
      input: {
        bucketName: z =>
          z.string({
            description: 'Globally-unique name of the S3 bucket to create.',
          }),
      },
      output: {
        bucketName: z =>
          z.string({ description: 'Name of the created S3 bucket.' }),
        bucketArn: z =>
          z.string({ description: 'ARN of the created S3 bucket.' }),
      },
    },
    async handler(ctx) {
      const { bucketName } = ctx.input;

      ctx.logger.info(
        `Provisioning S3 bucket "${bucketName}" via the Pulumi Automation API`,
      );

      // Region and stack/project naming per the workshop's fixed contract.
      // Credentials are not configured here: this action assumes the
      // Backstage backend process already has AWS/Pulumi Cloud access,
      // bootstrapped in steps 4-5 of this workshop (ESC + OIDC).
      // Step 6 toggle: set WORKSHOP_OMIT_TEAM_TAG=true on the Backstage
      // backend to request a bucket without the `team` tag.
      const team =
        process.env.WORKSHOP_OMIT_TEAM_TAG === 'true'
          ? undefined
          : process.env.WORKSHOP_TEAM ?? 'platform';

      const stack = await LocalWorkspace.createOrSelectStack({
        stackName: bucketName,
        projectName: PULUMI_PROJECT_NAME,
        program: createS3BucketProgram({ bucketName, team }),
      });

      // Step 4: short-lived AWS credentials come from an ESC environment
      // (<org>/backstage-s3-bucket/backstage-demo) linked to the stack.
      const escEnvironment = process.env.PULUMI_ESC_ENVIRONMENT;
      if (escEnvironment) {
        await stack.addEnvironments(escEnvironment);
      }

      // Step 6: a local policy pack path turns on policy checks at up().
      const policyPack = process.env.PULUMI_POLICY_PACK_PATH;

      await stack.setConfig('aws:region', { value: 'us-east-1' });

      const upResult = await stack.up({
        ...(policyPack ? { policyPacks: [policyPack] } : {}),
        onOutput: message => ctx.logger.info(message.trimEnd()),
      });

      const createdBucketName = String(
        upResult.outputs.bucketName?.value ?? bucketName,
      );
      const createdBucketArn = String(upResult.outputs.bucketArn?.value ?? '');

      ctx.logger.info(
        `Pulumi update ${upResult.summary.result}: created bucket ${createdBucketName} (${createdBucketArn})`,
      );

      ctx.output('bucketName', createdBucketName);
      ctx.output('bucketArn', createdBucketArn);
    },
  });
};
