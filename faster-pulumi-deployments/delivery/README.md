# Pulumi Delivery examples

These programs run the [executor image](../labs/04-executor-images/README.md) approach as [Pulumi Delivery](https://www.pulumi.com/docs/delivery/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) pipelines instead of a separate CI system. They use the released `@pulumi/delivery` provider, version 0.2.0. Delivery is in public preview, so the SDK and behavior can change.

| Directory | Pulumi project | What it does |
| --- | --- | --- |
| `build/` | `fpd-build-delivery` | Pipeline. Builds the executor image once, publishes its reference as an artifact, deploys it to `delivery-dev`, then waits at a manual gate before `delivery-prod`. |
| `image/` | `fpd-image-delivery` | Stack program that the `build` stage runs. Creates an Amazon ECR Public repository, builds [`images/Dockerfile`](../images/Dockerfile) for one language with Docker Build, pushes it tagged with the commit, and exports its digest reference. |
| `deploy/` | `fpd-deploy-delivery` | Second pipeline. Starts when the build pipeline's `build` stage publishes a release, and deploys the same image to `delivery-staging`. |

## How the pipeline uses the image

1. The `image` stack builds the Go program, its provider plugins, and the Pulumi CLI into one image, and pushes it by commit tag. It reads and writes a BuildKit registry cache at `<repository>:buildcache-go`, so layers whose inputs didn't change are reused even though each Delivery runner starts empty.
1. The pipeline reads the image stack's `imageRef` output, which is a digest reference, and sets it as the `image` of each later stack entry.
1. Each stack entry checks out `programs/go` at the run's commit and runs `cp Pulumi.image.yaml Pulumi.yaml` as a pre-run command, so the Go language host runs the prebuilt binary at `/opt/pulumi-program/infra` instead of compiling the program.

Every stage of a run deploys the image built from the same commit, and a later stage never rebuilds it.

## Why Amazon ECR Public

Pulumi-managed runners pull a custom image before any pre-run command runs, and they authenticate only with a static username and password. A private Amazon ECR repository's password is a token that expires after 12 hours, so a release that waits overnight at the manual gate couldn't pull its image.

Anyone can pull from ECR Public without credentials, so the stack entries need no registry secret. The image stack pushes with short-lived credentials from the `aws/pulumi-ce` ESC environment, which signs in to AWS with OIDC. The image holds only this workshop's sample program, public provider plugins, and the Pulumi CLI, so publishing it is safe.

For an image that contains proprietary code, use a private registry that accepts a long-lived token, such as Docker Hub, GitHub Container Registry, or Artifactory, and set `image.credentials` on each stack entry.

## What Delivery doesn't do yet

- **Stack entries always install dependencies.** Delivery runs `pulumi install` before pre-run commands and has no setting to skip it. For Go, that downloads the modules even though the image already contains the compiled program. Compare the install step's duration with a [Pulumi Deployments](https://www.pulumi.com/docs/deployments/concepts/settings/skip-dependency-installation/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) stack that skips installation.
- **No dependency caching on stack entries.** Delivery doesn't use a stack's Pulumi Deployments settings, including [dependency caching](https://www.pulumi.com/docs/deployments/concepts/settings/dependency-caching/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops).
- **No persistent build cache for the image build.** The registry cache keeps image layers. It doesn't keep Go's module and build caches, so a change to `go.sum` rebuilds the program without them.
- **Static registry credentials.** Pulumi-managed runners can't pull with OIDC or an IAM role, which is why these examples use a public registry.
- **Hosted runners only.** Delivery doesn't run on [customer-managed runners](../labs/05-kubernetes-cache/README.md) yet.
- **Target stacks must exist** before the first run.

## Set up

You need the Pulumi CLI 3.277.0 or later and an ESC environment that signs in to AWS. The examples use `aws/pulumi-ce`; to use another, change [`image/Pulumi.go.yaml`](image/Pulumi.go.yaml). The examples assume a fork or branch of this repository that Delivery can read.

1. Create the target stacks. Delivery doesn't create them.

    ```bash
    pulumi stack init <org>/fpd-image-delivery/go --cwd delivery/image
    for s in dev staging prod; do
        pulumi stack init "<org>/faster-pulumi-deployments/delivery-$s" --cwd programs/go
    done
    ```

1. Allow the pipeline to open the ESC environment. The image stack runs as the pipeline's service principal, which needs the **Open** permission on `aws/pulumi-ce`.

1. Configure the build pipeline.

    ```bash
    cd delivery/build
    pulumi stack init <org>/fpd-build-delivery/main
    pulumi config set branch <branch>
    ```

1. Register the pipeline with `pulumi delivery register`. It records the repository and program directory as `delivery:source` in `Pulumi.main.yaml`. The pipeline tracks the repository's default branch, so set `delivery:source.branch` to your branch if it differs.

1. Delivery reads the pipeline's stack configuration from Git. Commit `Pulumi.main.yaml` with `git add -f`, because this workshop ignores stack files. Then push a change under `programs/go/` to start a run.

1. Configure and register `delivery/deploy` the same way. Set `buildPipeline` if the build pipeline isn't `<org>/fpd-build-delivery/main`.

## Measure

Record these from each stage's logs, and compare them with the [benchmark](../benchmarks/README.md) results for Pulumi Deployments:

- The image stack's total time, with and without a warm registry cache. Change `main.go` for a warm run, and `go.mod` for a cold one.
- Each stack entry's image pull, `pulumi install`, and `pulumi up` durations.
