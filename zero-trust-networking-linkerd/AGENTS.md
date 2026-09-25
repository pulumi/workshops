# AGENTS.md — zero-trust-networking-linkerd

Guidance for coding agents (and humans) working in this workshop folder of
`pulumi/workshops`.

## What this folder is

The material for the workshop "Zero-trust networking as code — mutual TLS
and traffic policy with Linkerd and Pulumi" (no session scheduled yet; see
the pull request description). Demo code plus, in a later pull request on
the same branch, a Slidev deck. See `README.md` for the layout and how to
run the demo end to end.

The repo carries what an attendee or a future presenter needs: the demo
code, the deck once it exists, and these notes. Presenter working documents
(a runbook, a rehearsal checklist, an open-questions log) stay off the
branch; `.gitignore` keeps every `*.md` out except `README.md`, the
`AGENTS.md` files and `slides/slides.md`. If you write a new working
document, it is ignored by default; that is deliberate, do not force-add it.

## Rules

- Stay inside this folder. Never modify other workshop folders in this repo.
- Facts about Linkerd and Pulumi Kubernetes come from the docs listed under
  "Sources" in `README.md`. If a doc is unclear, say so in the pull request
  rather than guessing.
- Canonical names: Pulumi ESC, Pulumi Cloud, Pulumi IaC, Pulumi console
  (lowercase console). Linkerd and Pulumi are both third-party/own product
  names used as-is; do not rename `Server`, `AuthorizationPolicy`, `kind`,
  or `kubectl`.
- Pin the Linkerd Helm chart version explicitly everywhere it appears
  (`02-trust-anchor` has no chart dependency; `03-control-plane` and
  `05-mtls-proof` do). Never "latest", never an unpinned edge tag. If a
  future run needs to move the pin forward, update the version constant,
  the README's "## Sources" entry, and the pull request description in the
  same change.
- Conventional Commits, scoped to this folder, e.g.
  `feat(zero-trust-networking-linkerd): …`,
  `docs(zero-trust-networking-linkerd): …`.
- Do not commit credentials, `node_modules/`, `dist/`, `bin/`, or
  recordings.

## Demo code

- No cloud account and no cloud spend: everything runs against a local
  `kind` cluster. Estimated cost is $0.00.
- `01-cluster/`: presenter setup, not live demo. Creates the `kind` cluster
  before the session.
- `02-trust-anchor/`, `03-control-plane/`, `04-meshed-services/`,
  `05-mtls-proof/`: Pulumi TypeScript projects, each its own stack. `npx tsc
  --noEmit` must pass in each. `pulumi preview` before `pulumi up`, always.
- `03-control-plane` reads `02-trust-anchor`'s certificate outputs through a
  Pulumi `StackReference` — confirmed working live against a local
  (`file://`) Pulumi backend this build, with the org placeholder
  `organization`. If a future session moves to Pulumi Cloud, update
  `03-control-plane/Pulumi.dev.yaml`'s `trustAnchorStack` value to the real
  organization name.
- `06-authorization-policy/`: `CustomResource`s for Linkerd's
  `policy.linkerd.io` CRDs (`Server` at `v1beta1`; `AuthorizationPolicy` and
  `MeshTLSAuthentication` at `v1alpha1`). Both `front` and `backend` in
  `04-meshed-services` have their own `ServiceAccount` specifically so this
  step's identity-based policy is meaningful — do not collapse them back to
  a shared/default ServiceAccount.
- `07-deny-in-action/`: a plain Kubernetes manifest and `kubectl` scripts,
  deliberately outside any Pulumi program, applied live.
- `08-teardown/teardown.sh`: destroys the five Pulumi stacks in reverse
  dependency order, then deletes the `kind` cluster. Run it at the end of
  every rehearsal and every real session.
- Chart and package versions are pinned exactly (never "latest") in each
  project's `package.json`/`index.ts`; see README "## Sources" for where
  each pin was confirmed and when.

## Slides (`slides/`)

Not yet built. A follow-up pull request on this branch adds `slides/` with
the deck; this AGENTS.md will be extended with its own rules once that
exists, following the pattern in
[`neo-in-a-docker-sandbox/slides/AGENTS.md`](../neo-in-a-docker-sandbox/slides/AGENTS.md).
