---
author: Jonathan Davenport
language: typescript, python, go, csharp, java, yaml
provider: random
use: first-party
status: draft
---

# Faster Pulumi deployments

This is the runnable companion to the [deployment tutorial series](https://github.com/pulumi/docs/pull/22569). The articles explain the platform-engineering decisions; this directory contains the complete programs, build recipes, and lab instructions.

The scenario is a platform team deploying reusable infrastructure across many accounts. Build preparation should be reusable, while configuration stays specific to each stack. You can apply that separation without rewriting your programs in Go.

Each language implements the same small program: read `environment`, create one Random provider resource with that prefix, and export the environment and generated name. These examples do not provision AWS resources. They exercise configuration, language SDKs, provider plugins, and release packaging; they are not representative performance benchmarks.

## Choose your language

| Track | Build prerequisite | Prepared output | Runtime requirement |
| --- | --- | --- | --- |
| [TypeScript](programs/typescript) | Node.js 22 and npm | JavaScript and installed production dependencies | Node.js |
| [Python](programs/python) | Python 3.12 and uv 0.9.24+ | Locked requirements and platform-specific wheels | Python 3.12 and a virtual environment installed at its destination |
| [Go](programs/go) | Go 1.25+ | Native executable | Matching OS and architecture |
| [C#/.NET](programs/dotnet) | .NET SDK 8 | Published DLL, runtime configuration, and dependency files | .NET runtime 8 |
| [Java](programs/java) | JDK 17+ and Maven 3.9+ | Runnable JAR with dependencies | Java 17+ on `PATH` |

Every track also needs the Pulumi CLI and the matching Random provider plugin. The common scripts require Bash, Python 3.11+, curl, and tar. Docker is required only for the image lab. The image recipes pin Pulumi CLI 3.259.0 by default; use the same version throughout a comparison.

The root `Pulumi.yaml` is an optional YAML version of the baseline program. YAML and Java do not have Pulumi-managed dependency caching; the artifact and image techniques remain useful.

## Start with a local artifact

From this directory, select a track:

```bash
make build LANGUAGE=typescript
make config LANGUAGE=typescript
bash scripts/fetch-plugins.sh
bash scripts/install-plugins.sh
```

Build outputs go under `dist/<language>/`. Stack configuration stays separately under `workspaces/<language>/`, so rebuilding does not delete it or package it into the release. The Python output needs one additional installation step, described in [lab 2](labs/02-build-once/README.md).

Authenticate to your Pulumi backend, then run the prepared program. Replace the organization and stack names:

```bash
cd workspaces/typescript
pulumi stack init <org>/faster-pulumi-deployments/typescript-a
pulumi config set environment development --stack <org>/faster-pulumi-deployments/typescript-a
pulumi up --stack <org>/faster-pulumi-deployments/typescript-a
```

Create a second stack with a different `environment` value and run the same prepared files. Both stacks should succeed and export their own environment values. Do not rebuild between those runs.

Use distinct stack names for different language tracks. All programs intentionally share the project name `faster-pulumi-deployments` and the same resource shape.

## Labs

1. [Measure and cache](labs/01-measure-and-cache/README.md): record setup and operation timings before changing the process.
1. [Build or prepare once](labs/02-build-once/README.md): produce the artifact appropriate to your language.
1. [Release programs and plugins](labs/03-release-artifacts/README.md): package and retrieve a complete release.
1. [Use a prebuilt executor image](labs/04-executor-images/README.md): keep program dependencies in the image and configuration outside it.
1. [Persist Kubernetes runner caches](labs/05-kubernetes-cache/README.md): retain downloaded packages between job Pods.
1. [Control rollout work](labs/06-rollout/README.md): test triggers, queue consolidation, and concurrency.

Each lab links to complete files rather than requiring you to reconstruct a script from article snippets. [Validation notes](VALIDATION.md) distinguish tested behavior from remaining integration work.

The [controlled timing report](benchmarks/results/2026-10-29-controlled/README.md) includes phase breakdowns, preparation costs, and reproducible data from 29 managed deployments. Warm caching produced the largest repeated-update improvement in this small Go fixture. The results do not rank languages or predict production performance.

Run `make lint` from this directory to check the companion's links and provider-version agreement.

## Release boundaries

`make build` prepares a local-platform artifact. Go executables and Python wheels must match the deployment platform. Native Node.js packages can have the same requirement; this fixture uses JavaScript dependencies and disables package lifecycle scripts during preparation. A real application that requires those scripts needs its own preparation step.

`make image` builds inside Linux images for the requested Docker platform. It retains the SDK/tool image as the runtime base to keep the example understandable. Removing build tools is a separate optimization, not a prerequisite for testing a prebuilt program.

The SDK versions are pinned in each program. npm, Go, .NET, and uv resolution files are committed; the Maven POM pins its direct dependencies and build plugins. These files do not claim cryptographic verification of every upstream artifact. The archive checksum detects content changes during transfer; trusted publication and immutable storage remain part of your release process.

## Cleanup

Destroy only the stacks you created for these labs:

```bash
pulumi destroy --stack <org>/faster-pulumi-deployments/typescript-a
pulumi stack rm <org>/faster-pulumi-deployments/typescript-a
```

Repeat for your other test stacks. Remove any dedicated runner pool, local Kubernetes cluster, artifact bucket, or image repository you created. Keep deployment logs if you need them for comparison.

## References

- [Pulumi runtime options](https://www.pulumi.com/docs/iac/concepts/projects/project-file/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops#runtime-options)
- [Pulumi Deployments](https://www.pulumi.com/docs/deployments/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
- [Use ESC with Pulumi IaC](https://www.pulumi.com/docs/esc/guides/pulumi-iac/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
