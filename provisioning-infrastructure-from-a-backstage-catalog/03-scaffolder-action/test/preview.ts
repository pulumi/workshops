/**
 * Offline structural check for the `pulumi:s3-bucket` inline program.
 *
 * This does NOT create real AWS resources, does NOT call `stack.up()`, and
 * does NOT require AWS credentials or Pulumi Cloud. It runs `pulumi preview`
 * only, against:
 *
 *  - a local file-backed Pulumi state (`file://` backend) in a scratch
 *    temp directory, so no Pulumi Cloud account is needed, and
 *  - dummy AWS credentials plus the AWS classic provider's
 *    `skipCredentialsValidation` / `skipMetadataApiCheck` /
 *    `skipRequestingAccountId` / `skipRegionValidation` config flags, which
 *    tell the provider plugin to build the resource graph without ever
 *    calling out to AWS.
 *
 * It imports `createS3BucketProgram` from `../src/pulumi/s3BucketProgram`,
 * the exact function the real scaffolder action handler calls -- this is
 * not a reimplementation, so a passing preview here is evidence about the
 * production code path.
 *
 * Run with: npx tsx test/preview.ts
 */
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { LocalWorkspace } from '@pulumi/pulumi/automation';
import {
  createS3BucketProgram,
  PULUMI_PROJECT_NAME,
} from '../src/pulumi/s3BucketProgram';

async function main() {
  const backendDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'backstage-s3-bucket-pulumi-state-'),
  );
  const backendUrl = `file://${backendDir}`;
  const stackName = 'offline-preview';
  const bucketName = 'demo-backstage-preview-bucket';

  console.log(`Local state backend: ${backendUrl}`);
  console.log(`Stack: ${PULUMI_PROJECT_NAME}/${stackName}`);
  console.log(`Bucket name under test: ${bucketName}\n`);

  const stack = await LocalWorkspace.createOrSelectStack(
    {
      stackName,
      projectName: PULUMI_PROJECT_NAME,
      program: createS3BucketProgram({ bucketName }),
    },
    {
      envVars: {
        PULUMI_BACKEND_URL: backendUrl,
        PULUMI_CONFIG_PASSPHRASE: '',
        PULUMI_SKIP_UPDATE_CHECK: 'true',
      },
    },
  );

  await stack.setAllConfig({
    'aws:region': { value: 'us-east-1' },
    'aws:accessKey': { value: 'dummy' },
    'aws:secretKey': { value: 'dummy' },
    'aws:skipCredentialsValidation': { value: 'true' },
    'aws:skipMetadataApiCheck': { value: 'true' },
    'aws:skipRequestingAccountId': { value: 'true' },
    'aws:skipRegionValidation': { value: 'true' },
  });

  console.log('Running `pulumi preview` (no `up`, no real AWS calls)...\n');

  try {
    const previewResult = await stack.preview({
      onOutput: message => process.stdout.write(message),
    });

    console.log('\n--- changeSummary ---');
    console.log(JSON.stringify(previewResult.changeSummary, null, 2));
  } finally {
    await stack.workspace.removeStack(stackName);
    fs.rmSync(backendDir, { recursive: true, force: true });
  }
}

main().catch(err => {
  console.error('Preview driver failed:', err);
  process.exitCode = 1;
});
