# AGENTS.md: deployment-settings

Optional code path for step 6. The README step uses the Pulumi Cloud console
(stack Settings > Deploy); this project sets the same toggles with
`pulumiservice.DeploymentSettings`.

- Keep it a separate Pulumi project. The Pulumi docs advise against defining
  DeploymentSettings for a stack inside that same stack.
- `DeploymentSettings` has no property for an ESC environment. The ESC
  environment reaches the deployment through the `environment:` block in
  `Pulumi.dev.yaml` of the main project.
- Check: `npm install && npx tsc --noEmit`. It cannot be previewed without a
  Pulumi Cloud login and the GitHub app installed.
