# Supply Chain Signing as Code: Notation Image Signing, Kyverno Admission Enforcement and Kubescape Posture Scanning with Pulumi

A container that builds is not a container you should trust. This workshop provisions a signed image pipeline with Pulumi, watches a Kyverno admission policy reject an image that was never signed and admit one that was, then runs a Kubescape posture scan against the resulting cluster, start to finish, from one `pulumi up`.

> supply chain signing as code — container image signing with Notation, admission-time signature enforcement, and cluster posture scanning with Kubescape, all provisioned through Pulumi.
> — [Workshop brief](https://workprentice.ai/documents/0a1f7c46-3c0f-4d94-b8aa-ac088ef6ea87)

## What attendees learn

By the end of this session, a participant will have used Pulumi to provision a signed container image pipeline on AWS, will have watched an admission controller reject an unsigned image and accept a Notation-signed one, and will have run a Kubescape posture scan against the resulting cluster.

## Layout

```text
supply-chain-signing-as-code/
├── README.md
├── AGENTS.md
├── lib.sh
├── .gitignore
├── .shellcheckrc
├── 00-signing-key/
│   └── generate.sh
├── 01-platform/
│   ├── Pulumi.yaml
│   ├── Pulumi.dev.yaml
│   ├── index.ts
│   ├── kind-config.yaml
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
├── 02-image/
│   ├── Dockerfile
│   ├── build.sh
│   └── server.py
├── 03-sign-and-push/
│   └── push-and-sign.sh
├── 04-unsigned-image/
│   └── push-unsigned.sh
├── 05-admit-signed/
│   ├── apply.sh
│   └── pod.yaml.tmpl
├── 06-reject-unsigned/
│   ├── apply.sh
│   └── pod.yaml.tmpl
├── 07-kubescape-scan/
│   └── scan.sh
├── 08-teardown/
│   └── teardown.sh
└── scripts/
    ├── verify-offline.sh
    └── check-readme.sh
```

Folder roles: `00-signing-key` generates the local Notation test key and certificate (presenter pre-step); `01-platform` is the Pulumi TypeScript project (ECR repository, Signer profile, kind, Kyverno, ClusterPolicy); `02-image` holds the hello web server; `03` to `06` push, sign, admit and reject; `07` scans; `08` tears down; `scripts/` holds the two checks.

The numbered folders follow the demo flow one step at a time. Two steps from the brief are grouped rather than split into their own folder, each for a reason stated here rather than left implicit:

- **03-sign-and-push** covers both "sign the image" and "push the signed image" from the brief. A Notation signature is an OCI artifact attached to an image by its digest in the registry (see [Notary Project, signing](https://notaryproject.dev/docs/quickstart/), read 2026-10-02), so the image has to exist in the registry before `notation sign` has a digest to sign against. The script therefore pushes first and signs second, the reverse of the brief's stated step order, and says so in its own header comment.
- **07-kubescape-scan** covers both "run the scan" and "walk a finding" from the brief, because the second is a reading of the first's report, not a separate action against the cluster.

## Prerequisites

Participant prerequisites:

- Docker installed and running.
- `kind` installed (the default path in this folder), or an existing EKS cluster with `kubectl` configured, if you are running the EKS variant described in `01-platform`'s comments.
- AWS CLI installed and configured with credentials, this demo provisions a real AWS ECR repository.
- `notation` CLI installed, v1.3.2 or newer (see `lib.sh`).
- `kubescape` CLI installed, v4.0.15 or newer (see `lib.sh`).
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

## Verify without a cluster

`scripts/verify-offline.sh` type-checks `01-platform` and runs `pulumi preview` with the Kubernetes provider in render mode, a throwaway local backend and a stand-in certificate. `scripts/check-readme.sh` checks the layout tree above against the folder.

Registry credentials: steps 5 and 6 call `ecr_pull_secret` (in `lib.sh`) to create an `ecr-pull` secret from `aws ecr get-login-password`. The pods list it under `imagePullSecrets`, so the kubelet can pull and Kyverno (1.18 and later, which chart 3.9.1 installs) reuses the same secret to fetch the signature.

## Cost

Under $5 total for a 2-hour session on the default `kind` path: ECR storage for two small image layers plus negligible local compute. The EKS variant referenced in `01-platform`'s comments adds roughly $0.10/hour for the control plane, plus the cost of whatever worker nodes you attach, neither is provisioned by this folder's default configuration.

## Teardown

`08-teardown/teardown.sh` does three things, in order, because a tag pushed outside Pulumi's management (every tag this workshop pushes) is not always removed by `pulumi destroy` on its own:

1. Deletes the signed and unsigned images from the ECR repository directly via the AWS CLI.
2. Runs `pulumi destroy` in `01-platform/`, removing the ECR repository, the kind cluster, the Kyverno chart and the ClusterPolicy.
3. Removes the local Notation key material `00-signing-key/generate.sh` produced.

## Sources

- Brief: [Supply chain signing as code](https://workprentice.ai/documents/0a1f7c46-3c0f-4d94-b8aa-ac088ef6ea87) — read 2026-10-02.
- [Notary Project — quickstart / signing a container image](https://notaryproject.dev/docs/quickstart/) — read 2026-09-27 (not re-read in the 2026-10-02 rebuild).
- [`notation` CLI releases](https://github.com/notaryproject/notation/releases) — read 2026-10-02.
- [`kubescape` CLI releases](https://github.com/kubescape/kubescape/releases) — read 2026-10-02.
- [Kyverno Helm chart index](https://kyverno.github.io/kyverno/index.yaml) and [ArtifactHub listing](https://artifacthub.io/packages/helm/kyverno/kyverno) — read 2026-10-02.
- [Kyverno — Verify Images](https://kyverno.io/docs/writing-policies/verify-images/) — read 2026-10-02.
- [Pulumi AWS provider — `aws.ecr.Repository`](https://www.pulumi.com/registry/packages/aws/api-docs/ecr/repository/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) — read 2026-10-02.
- [Pulumi AWS provider — `aws.signer.SigningProfile`](https://www.pulumi.com/registry/packages/aws/api-docs/signer/signingprofile/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) — read 2026-10-02.
- [Pulumi Kubernetes provider — `helm.v4.Chart`](https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v4/chart/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) — read 2026-10-02.
- AWS Signer support for Notation-compatible container signing, cross-checked against [AWS Signer developer guide](https://docs.aws.amazon.com/signer/) — read 2026-09-27 (not re-read in the 2026-10-02 rebuild).
- [Kyverno — Verify Images (Notary)](https://kyverno.io/docs/policy-types/cluster-policy/verify-images/notary/), [Verify Images](https://kyverno.io/docs/policy-types/cluster-policy/verify-images/) and [installation flags](https://kyverno.io/docs/installation/customization/) — read 2026-10-02.
- [Pulumi Command provider — `local.Command`](https://www.pulumi.com/registry/packages/command/api-docs/local/command/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) — read 2026-10-02.
- [Pulumi Kubernetes provider — `apiextensions.CustomResource`](https://www.pulumi.com/registry/packages/kubernetes/api-docs/apiextensions/customresource/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) — read 2026-10-02.
