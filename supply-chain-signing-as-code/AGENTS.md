# AGENTS.md — supply-chain-signing-as-code

Guidance for coding agents (and humans) working in this workshop folder of
`pulumi/workshops`.

## What this folder is

The material for the workshop "Supply chain signing as code, Notation image
signing, admission enforcement and Kubescape posture scanning with Pulumi".
No event date is scheduled yet. Demo code only in this run; the Slidev deck
follows on the same branch in a later run. See `README.md` for the layout and
how to run the demo.

The repo carries what an attendee or a future presenter needs: the demo code,
the deck (once built) and these notes. Presenter-only working documents stay
off the branch; `.gitignore` keeps every `*.md` out except `README.md`, the
`AGENTS.md` files and `slides/slides.md`. If you write a new working document,
it is ignored by default; that is deliberate, do not force-add it.

## Rules

- Stay inside this folder. Never modify other workshop folders in this repo.
- Facts about Pulumi products come from the docs listed under "Sources" in
  `README.md`, read the day this was built. If a doc is unclear, say so in the
  pull request description rather than guessing.
- Canonical names: Pulumi IaC, Pulumi Cloud, Pulumi console (lowercase
  console), Pulumi Policies. Never "CrossGuard".
- Conventional Commits, scoped to this folder, e.g.
  `feat(supply-chain-signing-as-code): …`, `docs(supply-chain-signing-as-code): …`.
- Do not commit credentials, `node_modules/`, `dist/`, Pulumi state, Notation
  key material, or rendered-YAML verification output.

## Signing mechanism — provisioned via AWS Signer, exercised via a local key

The brief asks for a Notation signing/verification policy "per the Notary
Project + AWS Signer pattern," and separately, in its presenter-setup section,
for a pre-generated local Notation signing key pair. Those are two different
signing mechanisms: AWS Signer holds the private key in a managed,
HSM-backed profile (`aws.signer.SigningProfile`, `platformId:
"Notation-OCI-SHA384-ECDSA"`, confirmed against AWS's own Signer docs and
Pulumi's AWS provider docs, see README's Sources), a local key pair does not
touch AWS at all.

`01-platform/index.ts` provisions the `aws.signer.SigningProfile` as code, so
the brief's provisioning requirement is met literally. The **live demo signs
with the local Notation test key** from `00-signing-key/`, not the Signer
profile, because the brief's own presenter-setup section calls for a
pre-generated local key and explicitly avoids live key generation or a live
AWS Signer round trip during the session. This workstation also cannot reach
AWS to exercise the Signer profile end to end. The open question this leaves,
called out in the pull request: whether a future revision should route the
live signing step through the provisioned Signer profile instead of the local
key, which would need a rehearsal against a real AWS account to confirm the
`notation` CLI's AWS Signer plugin invocation.

## Demo code

- `01-platform/`: the one Pulumi TypeScript project this workshop's single
  `pulumi up` runs, the AWS ECR repository, the `kind` cluster (via
  `@pulumi/command` `local.Command`, since `kind` has no native Pulumi
  provider), the Kyverno Helm chart, and the Kyverno `ClusterPolicy` that
  verifies Notation signatures against the certificate `00-signing-key/`
  produced. `npx tsc --noEmit` must pass.
- `00-signing-key/`: presenter pre-step, not part of `pulumi up`. Generates the
  local Notation key pair and self-signed certificate that both `03-sign-and-push/`
  and `01-platform/`'s `ClusterPolicy` consume. Run this before `01-platform/`'s
  `pulumi up`, the certificate has to exist before the policy that embeds it
  can be created.
- `02-image/` through `08-teardown/`: shell scripts, macOS and Linux,
  shellcheck clean (`.shellcheckrc` in this folder). `03-sign-and-push/` and
  `04-unsigned-image/` are grouped because a Notation signature is a
  registry-side OCI artifact attached by digest, the image has to exist in
  the registry first. `07-kubescape-scan/` groups the scan and the finding
  walkthrough because the second is a reading of the first's report, not a
  separate action.
- Kyverno's `ClusterPolicy`-based `verifyImages` is marked deprecated in
  Kyverno's own current docs in favor of the CEL-based `ImageValidatingPolicy`.
  This build still uses `ClusterPolicy` because it is the syntax the existing
  `pulumi/workshops` Kyverno pattern (draft PR #237) already established and
  because it remains documented and functional; the deprecation is called out
  in the README as a known caveat for a future revision.
