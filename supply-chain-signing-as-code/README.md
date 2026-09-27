# Supply Chain Signing as Code: Notation Image Signing, Kyverno Admission Enforcement and Kubescape Posture Scanning with Pulumi

A container that builds is not a container you should trust. This workshop provisions a signed image pipeline with Pulumi, watches a Kyverno admission policy reject an image that was never signed and admit one that was, then runs a Kubescape posture scan against the resulting cluster — start to finish, from one `pulumi up`.

> supply chain signing as code — container image signing with Notation, admission-time signature enforcement, and cluster posture scanning with Kubescape, all provisioned through Pulumi.
> — [Workshop brief](https://workprentice.ai/documents/0a1f7c46-3c0f-4d94-b8aa-ac088ef6ea87)

## What attendees learn

By the end of this session, a participant will have used Pulumi to provision a signed container image pipeline on AWS, will have watched an admission controller reject an unsigned image and accept a Notation-signed one, and will have run a Kubescape posture scan against the resulting cluster.

## Layout

```
supply-chain-signing-as-code/
├── README.md            this file
├── AGENTS.md             conventions for agents (and humans) editing this folder
├── lib.sh                shared script helpers and pinned tool versions, sourced by every numbered folder's scripts
├── 00-signing-key/       presenter pre-step: generate the local Notation test key pair and certificate
├── 01-platform/          the Pulumi TypeScript project — ECR repository, kind cluster, Kyverno chart, image-verification ClusterPolicy
├── 02-image/             the demo "hello" web server: Dockerfile, source, build script
├── 03-sign-and-push/     push the built image to ECR, then sign it with the local Notation key
├── 04-unsigned-image/    push a second, unsigned variant of the same image
├── 05-admit-signed/      apply a manifest referencing the signed image — Kyverno admits it
├── 06-reject-unsigned/   apply a manifest referencing the unsigned image — Kyverno rejects it
├── 07-kubescape-scan/    run a Kubescape posture scan and read at least one finding
└── 08-teardown/          pulumi destroy, explicit ECR image deletion, and local key cleanup
```

The numbered folders follow the demo flow one step at a time. Two steps from the brief are grouped rather than split into their own folder, each for a reason stated here rather than left implicit:

- **03-sign-and-push** covers both "sign the image" and "push the signed image" from the brief. A Notation signature is an OCI artifact attached to an image by its digest in the registry (see [Notary Project — signing](https://notaryproject.dev/docs/quickstart/), read 2026-09-27), so the image has to exist in the registry before `notation sign` has a digest to sign against. The script therefore pushes first and signs second — the reverse of the brief's stated step order — and says so in its own header comment.
- **07-kubescape-scan** covers both "run the scan" and "walk a finding" from the brief, because the second is a reading of the first's report, not a separate action against the cluster.

## Prerequisites

Participant prerequisites:

- Docker installed and running.
- `kind` installed (the default path in this folder), or an existing EKS cluster with `kubectl` configured, if you are running the EKS variant described in `01-platform`'s comments.
- AWS CLI installed and configured with credentials — this demo provisions a real AWS ECR repository.
- `notation` CLI installed, v1.3.2 or newer (see `lib.sh`).
- `kubescape` CLI installed, v4.0.14 or newer (see `lib.sh`).
- Pulumi CLI installed and authenticated.
- Node.js and npm for the TypeScript Pulumi program in `01-platform/`.

Presenter setup steps:

- Run `00-signing-key/generate.sh` before the session; do not generate keys live unless demonstrating that step deliberately.
- Run `02-image/build.sh` ahead of time as a backup in case a live rebuild runs long.
- Verify AWS account quota and IAM permissions for ECR ahead of time.
- Dry-run the full demo end-to-end within 24 hours of the session to catch drift in the pinned tool versions above.

## Run the demo

Set it up once, then repeat the middle steps as often as you like:

```bash
# 0. once: generate the local Notation signing key and certificate
00-signing-key/generate.sh

# 1. once per cluster lifetime: provision the ECR repository, the kind
#    cluster, the Kyverno Helm chart and the image-verification ClusterPolicy
cd 01-platform && pulumi up && cd -

# 2. build the demo image (repeat whenever the app changes)
02-image/build.sh

# 3. push the signed variant to ECR and sign it with the local key
03-sign-and-push/push-and-sign.sh

# 4. push a second, unsigned variant of the same image
04-unsigned-image/push-unsigned.sh

# 5. apply the signed manifest — Kyverno admits it
05-admit-signed/apply.sh

# 6. apply the unsigned manifest — Kyverno rejects it; read the message it prints
06-reject-unsigned/apply.sh

# 7. scan the cluster with Kubescape and walk through a finding
07-kubescape-scan/scan.sh

# 8. between runs: repeat steps 2-7, or reset entirely:
08-teardown/teardown.sh
```

## Cost

Under $5 total for a 2-hour session on the default `kind` path: ECR storage for two small image layers plus negligible local compute. The EKS variant referenced in `01-platform`'s comments adds roughly $0.10/hour for the control plane, plus the cost of whatever worker nodes you attach — neither is provisioned by this folder's default configuration.

## Teardown

`08-teardown/teardown.sh` does three things, in order, because a tag pushed outside Pulumi's management (every tag this workshop pushes) is not always removed by `pulumi destroy` on its own:

1. Deletes the signed and unsigned images from the ECR repository directly via the AWS CLI.
2. Runs `pulumi destroy` in `01-platform/`, removing the ECR repository, the kind cluster, the Kyverno chart and the ClusterPolicy.
3. Removes the local Notation key material `00-signing-key/generate.sh` produced.

## Sources

- Brief: [Supply chain signing as code](https://workprentice.ai/documents/0a1f7c46-3c0f-4d94-b8aa-ac088ef6ea87) — read 2026-09-27.
- [Notary Project — quickstart / signing a container image](https://notaryproject.dev/docs/quickstart/) — read 2026-09-27.
- [`notation` CLI releases](https://github.com/notaryproject/notation/releases) — read 2026-09-27.
- [`kubescape` CLI releases](https://github.com/kubescape/kubescape/releases) — read 2026-09-27.
- [Kyverno Helm chart index](https://kyverno.github.io/kyverno/index.yaml) and [ArtifactHub listing](https://artifacthub.io/packages/helm/kyverno/kyverno) — read 2026-09-27.
- [Kyverno — Verify Images](https://kyverno.io/docs/writing-policies/verify-images/) — read 2026-09-27.
- [Pulumi AWS provider — `aws.ecr.Repository`](https://www.pulumi.com/registry/packages/aws/api-docs/ecr/repository/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) — read 2026-09-27.
- [Pulumi AWS provider — `aws.signer.SigningProfile`](https://www.pulumi.com/registry/packages/aws/api-docs/signer/signingprofile/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) — read 2026-09-27.
- [Pulumi Kubernetes provider — `helm.v4.Chart`](https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v4/chart/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) — read 2026-09-27.
- AWS Signer support for Notation-compatible container signing, cross-checked against [AWS Signer developer guide](https://docs.aws.amazon.com/signer/) — read 2026-09-27.
