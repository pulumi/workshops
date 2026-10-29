# Validation status

The following checks were run on October 29, 2026, using Pulumi CLI 3.259.0 and Random provider 4.18.2. These are functional tests, not a cross-language performance benchmark.

| Track | Prepared artifact on macOS | Executor image on Linux ARM64 |
| --- | --- | --- |
| TypeScript | Built and deployed to two stacks | Built and deployed to two stacks |
| Python | Wheels prepared; destination environment installed offline; deployed to two stacks | Built and deployed to two stacks |
| Go | Built and deployed to two stacks | Built and deployed to two stacks |
| C#/.NET | Published and deployed to two stacks | Built and deployed to two stacks |
| Java | JAR packaged and deployed to two stacks | Built and deployed to two stacks |

Each pair used the same prepared output or image with different `environment` values. The returned values were checked against the expected configuration. The image tests used a read-only mount containing external project and stack configuration; no project or stack configuration was copied into the image.

Automatic provider acquisition was disabled during these runs. The matching Random plugin was installed explicitly before native execution and during image builds. The optional root YAML program also completed an update successfully.

The Go release archive and checksum were generated and verified. The archive contains the program, prebuilt project definition, provider manifest, and platform-matched plugin archive. Source stack files and virtual environments are excluded by the packaging script.

Checksum tests cover valid artifacts, changed contents, and manifests that attempt to select a parent-directory file. All test resources were destroyed after validation; empty stacks retain their update history.

The preceding blog validation also exercised S3 retrieval through ESC, configuration-only changes to a reused Go image, Kubernetes npm cache persistence, concurrent cache consumers, and queue consolidation. The exact new cross-language images were executed through the CLI, not through the managed Deployments service.

The image script defaults to Linux AMD64, but this matrix exercised its Linux ARM64 option. Linux AMD64 images, live VCS path filtering, Artifactory-specific authentication, representative performance benchmarks, and multi-node volume behavior require separate validation. The .NET example uses a framework-dependent DLL; Native AOT and Java native-image builds are not part of this workshop.

Repository-wide `make lint` reports existing UTM issues outside this workshop. Use `make lint` from this directory to run the same link check over the companion and validate its provider versions.
