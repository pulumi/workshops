/**
 * Registers the `pulumi:s3-bucket` scaffolder action with a Backstage
 * backend running the new backend system.
 *
 * Pattern confirmed 2026-09-30 against the real, published
 * `@backstage/plugin-scaffolder-backend-module-github` source
 * (https://github.com/backstage/backstage/blob/master/plugins/scaffolder-backend-module-github/src/module.ts),
 * which is the concrete example the "Using Core Services in Custom Actions"
 * section of https://backstage.io/docs/features/software-templates/writing-custom-actions/
 * (read 2026-09-30) elides with `...`: `createBackendModule({ pluginId,
 * moduleId, register({ registerInit }) { registerInit({ deps, init }) } })`,
 * with `scaffolderActionsExtensionPoint` imported from
 * `@backstage/plugin-scaffolder-node`.
 */
import {
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node';
import { createS3BucketAction } from './actions/createS3BucketAction';

export const scaffolderModulePulumiS3Bucket = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'pulumi-s3-bucket',
  register({ registerInit }) {
    registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
      },
      async init({ scaffolder }) {
        scaffolder.addActions(createS3BucketAction());
      },
    });
  },
});
