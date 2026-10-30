# Lab 3: Release programs and plugins

Package the selected track from the workshop root:

```bash
make package LANGUAGE=typescript
```

The [packaging script](../../scripts/package.sh) builds an archive containing the program, runtime dependencies, project file, provider manifest, and provider archives. Python's virtual environment is excluded because it must be installed at the destination. Stack configuration and credentials are never included.

Outputs are `dist/releases/<language>/program.tar.gz` and its `.sha256` file. The [checksum tool](../../scripts/checksum.py) works on macOS and Linux. A checksum obtained from the same storage as its artifact checks integrity, not the publisher's identity.

The [plugin downloader](../../scripts/fetch-plugins.sh) defaults to the current platform. Use the same target platform as the program. Do not combine a macOS Go executable or Python wheel set with Linux plugins.

## Publish and retrieve

Build an artifact-runner image with the selected runtime, Pulumi CLI, AWS CLI, and checksum tools:

```bash
IMAGE_TARGET=artifact-runner make image LANGUAGE=typescript
```

This builds `faster-pulumi-deployments:typescript-tools` by default. Set `IMAGE` to your registry reference before building and publishing it. Match `PLATFORM` to your deployment runner; the default is Linux AMD64. This target supplies tools without embedding the program, which will be retrieved from the release store.

Choose a new immutable release prefix that identifies the source revision, language, and platform:

```bash
export RELEASE_URI="s3://<bucket>/releases/<revision>/typescript/linux-amd64"
pulumi env run <org>/build/artifact-publisher -- bash scripts/publish-s3.sh typescript
```

The bucket must exist, and the ESC environment must expose AWS credentials with the necessary publication permissions. Use a release path only once. The [upload script](../../scripts/publish-s3.sh) does not configure bucket immutability or permissions for you.

Configure the deployment's project directory as `faster-pulumi-deployments/programs/<language>`. Set `RELEASE_URI` to the published prefix, skip automatic package-manager installation, and use this pre-run command:

```bash
pulumi env run <org>/build/artifact-reader -- bash ../../scripts/prepare-release.sh
```

Select the published artifact-runner image in deployment settings. The [retrieval script](../../scripts/prepare-release.sh) verifies the archive, installs the provider archives, and replaces the source project's runtime definition with the artifact's prebuilt definition. Existing stack configuration files remain external. If you use another image, it needs the AWS CLI, Python 3.11+ for checksums, and the selected language runtime. Python artifacts additionally need Python 3.12 selected through `PYTHON` if `python3` is another version.

Run a deployment from a fresh execution environment and confirm that it uses the published artifact and expected provider version. Check an existing stack update as well as a first deployment; older state can require additional provider versions.

Artifactory can replace S3, but its client authentication and download commands need separate integration testing. The required artifact contents do not change.

Continue to [lab 4](../04-executor-images/README.md).
