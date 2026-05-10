<!-- FOR AI AGENTS - Human readability is a side effect, not a goal -->
<!-- Managed by agent: keep sections and order; edit content, not structure -->

# AGENTS.md — Getting Started with Kubernetes on Google Cloud

60-minute show-only workshop. Pulumi TypeScript provisions a
production-close GKE cluster; Flux reconciles the apps; ADK agent runs
on Vertex AI via Workload Identity. Slides in `slides/`.

## Layout

| Path | Purpose |
|---|---|
| `00-infrastructure/` | Pulumi consumer — VPC, Vertex IAM, Flux helm releases, dashboard |
| `01-gitops/` | Flux YAML (PSA, NetworkPolicies, CCNP, ResourceQuota, ADK agent + podinfo manifests) |
| `02-component/` | The `gke-workshop` ComponentResource — published as `lumitorch/gke-workshop@0.6.0` |
| `adk-agent/` | Source for `ghcr.io/dirien/adk-agent:latest` (Dockerfile + Google ADK demo agent) |
| `slides/` | Slidev deck (`@pulumi/slidev-theme` from GitHub Packages) |
| `README.md` | Workshop walkthrough |
| `DEMO.md` | Smoke-test runbook |

## Commands

| Task | Command |
|---|---|
| Deploy | `cd 00-infrastructure && pulumi up --stack lumitorch/dev` |
| Smoke test | follow `DEMO.md` |
| Slides preview | `cd slides && GITHUB_TOKEN=$(gh auth token) npm install && npm run dev` |
| Lint | `make lint` (from repo root — UTM check on `pulumi.com` URLs) |
| Component republish | tag `vX.Y.Z` on main, then `pulumi package publish https://github.com/pulumi/workshops/getting-started-with-kubernetes-google-cloud/02-component@X.Y.Z --publisher lumitorch` |

## Production-close patterns to preserve

Two non-obvious flags on the kubernetes Provider in `00-infrastructure/index.ts`:

| Flag | Why |
|---|---|
| `clusterIdentifier: cluster.clusterId` | Without it, the kubeconfig's 1h OAuth token rotates on every `pulumi up`, hashes as a Provider replacement, and cascades into `+ create` diffs for every dependent k8s resource. Pin to cluster ID so token changes are in-place updates. |
| `deleteUnreachable: true` | If the GKE API goes away mid-destroy (cluster deletion races ahead), kubernetes resources get dropped from state instead of erroring. |

Plus on both Helm releases:

| Flag | Why |
|---|---|
| `retainOnDelete: true` | Destroy removes the helm release from Pulumi state without calling `helm uninstall`. The release dies with the cluster, no FluxInstance finalizer hangs. |

## Heuristics

| When | Do |
|---|---|
| Editing `00-infrastructure/index.ts` Provider config | Keep `clusterIdentifier` and `deleteUnreachable`. |
| Editing kubernetes resources in `index.ts` | Keep `retainOnDelete: true` on Helm releases. |
| Editing `02-component/` | Bump version in `Pulumi.yaml` and ensure consumer's `Pulumi.yaml` `packages:` block points at the new tag. The TF-module SDK in `02-component/sdks/gke/` is committed (publish flow doesn't run `pulumi install`, so it must be self-contained). |
| Adding `pulumi.com` URL anywhere | UTM `?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops` (per root AGENTS.md). |
| Committing 00-infra | Don't commit `kubeconfig`, `node_modules/`, `sdks/`, `.claude/` — already gitignored. |
| Committing slides | Don't commit `node_modules/`, `.claude/`, or `pnpm-lock.yaml` (we use npm). |

## Boundaries

- **Always**: Use the published component reference (`@0.6.0`) in `00-infrastructure/Pulumi.yaml`, not a local subpath, unless explicitly developing the component.
- **Always**: Run the `DEMO.md` smoke tests after any infra change before declaring done.
- **Ask first**: Bumping `gke-workshop` component major version, changing GKE module version, modifying PSA / NetworkPolicy posture, switching to GKE Autopilot.
- **Never**: Commit `kubeconfig` files (contain short-lived tokens but still — gitignored). Never push to `main` directly. Never strip `clusterIdentifier` or `deleteUnreachable` without replacing the safety they provide.

## Common gotchas

| Symptom | Cause | Fix |
|---|---|---|
| `kubectl` returns Unauthorized / 401 | Cached OAuth token in kubeconfig expired | `pulumi up --skip-preview --yes` to re-mint, then re-export `KUBECONFIG` |
| `+ create` diff for resources that exist on the cluster | Provider replaced from kubeconfig hash change (only happens if `clusterIdentifier` is missing) | Add `clusterIdentifier` AND `import:` resource options once to re-adopt orphans |
| `pulumi destroy` hangs on Helm release | `retainOnDelete` missing OR cluster API offline | Verify the flag is set; if hung, `pulumi state delete <urn> --force` then retry destroy |
| `kubectl` falls back to a different cluster | `KUBECONFIG` env var dropped between shells | Re-run `export KUBECONFIG=$(pulumi stack output kubeconfig_path --stack lumitorch/dev)` |
| Slides won't `npm install` (401 from `npm.pkg.github.com`) | `@pulumi/slidev-theme` is on GitHub Packages | `GITHUB_TOKEN=$(gh auth token) npm install` (token needs `read:packages`) |
