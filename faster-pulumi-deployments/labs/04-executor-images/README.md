# Lab 4: Use a prebuilt executor image

Build inside Linux rather than copying host-platform artifacts into an image:

```bash
make image LANGUAGE=typescript
```

The [image builder](../../scripts/build-image.sh) chooses a language runtime base, then uses the [shared Dockerfile](../../images/Dockerfile). The default target is `linux/amd64`. Set `PLATFORM=linux/arm64` for ARM64 runners. Set `IMAGE=<registry>/<repository>:<release>` to choose the image name, and `RUNTIME_IMAGE` to override the base with a tested version or digest.

The build stage prepares the program and installs provider plugins. The final image includes the matching runtime and CLI, but excludes `Pulumi.yaml` and all stack files. Python installs its environment at `/opt/pulumi-program/.venv` inside the final image, using its prepared wheels. This avoids relocating a host virtual environment.

The builder creates `workspaces/image/<language>/Pulumi.yaml` outside the image. For a local check, configure a stack there, then mount that directory at `/workspace`. Pass backend credentials at execution time, not as build arguments:

```bash
docker run --rm --platform linux/amd64 \
    --env PULUMI_ACCESS_TOKEN \
    --mount "type=bind,source=$PWD/workspaces/image/typescript,target=/workspace" \
    faster-pulumi-deployments:typescript \
    preview --stack <org>/faster-pulumi-deployments/typescript-a
```

Match `--platform` to the build. If your backend uses a nondefault URL, also supply `PULUMI_BACKEND_URL`.

For Pulumi Deployments, publish the image, select its digest, and keep Git as the source of project and stack configuration. In `programs/<language>`, the tracked `Pulumi.image.yaml` contains the image's absolute program path. Use `cp Pulumi.image.yaml Pulumi.yaml` as a pre-run command, skip automatic dependency installation, and remove the artifact-download command from lab 3.

Registry authentication must work before the image starts. A pre-run command cannot authenticate the image pull that precedes it. Configure credentials supported by your runner installation; [custom executor image authentication](https://www.pulumi.com/docs/deployments/concepts/settings/custom-executor-images/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) documents the managed-runner constraints.

Deploy the same image digest to two stacks using separate configuration or ESC environments. Change one environment value and redeploy without rebuilding. Confirm that the selected stack changes while the other retains its configuration.

These images retain build tools to keep the sample understandable. Measure cold image pulls as well as warm runs before deciding whether a smaller runtime-only image is worth another iteration.

Continue to [lab 5](../05-kubernetes-cache/README.md) for customer-managed runners, or [lab 6](../06-rollout/README.md) for rollout control.
