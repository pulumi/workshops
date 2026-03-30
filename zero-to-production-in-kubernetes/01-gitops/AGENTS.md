# AGENTS.md - GitOps Monorepo (01-gitops)

## Overview

Flux CD monorepo structure following the official Flux repository-structure guide.
Pure static YAML — no Pulumi. Flux Operator (installed by `00-infrastructure/`) reconciles
this directory tree from Git.

## Architecture

### Directory Layout

- `clusters/<name>/` — Per-cluster entry points. Each contains Flux Kustomization CRDs
  (`infrastructure.yaml` + `apps.yaml`) that point Flux at the correct overlay paths.
- `infrastructure/` — Cluster addons, controllers, platform tooling.
  - `base/` — Shared across all environments.
  - `host/` — Host-cluster-only resources (Flux Web UI config + LoadBalancer).
  - `production/`, `staging/`, `dev/` — Environment overlays referencing base + patches.
- `apps/` — Application workloads.
  - `base/` — Shared app definitions (HelmReleases, namespaces, HelmRepositories).
  - `production/`, `staging/`, `dev/` — Environment overlays with value patches.

### Reconciliation Order

1. Flux reconciles `clusters/<name>/infrastructure.yaml` first (infra controllers, configs)
2. Then `clusters/<name>/apps.yaml` (`dependsOn: infrastructure`) — apps only deploy after infra is ready

### Cluster-to-Overlay Mapping

| Cluster | Infrastructure | Apps |
|---------|---------------|------|
| host | host | production |
| platform-prod | production | production |
| platform-staging | staging | staging |
| team-frontend-dev | dev | dev |
| team-backend-dev | dev | dev |
| team-backend-staging | staging | staging |
| team-ml-dev | dev | ml-dev |
| team-ml-staging | staging | ml-staging |

### Web UI (Host Only)

- `infrastructure/host/flux-web-config.yaml` — Anonymous auth Secret for workshop
- `infrastructure/host/flux-web-lb.yaml` — AWS NLB LoadBalancer Service on port 80 -> 9080

## Adding a New Shared Infrastructure Component

1. Create the resource YAML in `infrastructure/base/` (e.g., `metrics-server.yaml`)
2. Add it to `infrastructure/base/kustomization.yaml` resources list
3. All clusters inherit it automatically via their overlay -> base reference
4. For environment-specific patches, add a `patches:` block in the overlay's `kustomization.yaml`

## Adding a New Application

1. Create a directory in `apps/base/<app-name>/` with:
   - `namespace.yaml` — App namespace
   - `repository.yaml` — HelmRepository source
   - `release.yaml` — HelmRelease with base values
   - `kustomization.yaml` — Lists the above resources
2. Add `- ./<app-name>` to `apps/base/kustomization.yaml` resources
3. Create environment-specific value patches in `apps/{production,staging,dev}/`:
   - `<app-name>-values.yaml` — HelmRelease patch with env-specific values
   - Add patch entry to the overlay's `kustomization.yaml`

## Boundaries

- **Always**: Use Kustomize overlays for env differences, never duplicate base resources
- **Never**: Put Pulumi code here — this is pure Flux YAML
- **Never**: Put secrets with real credentials — use SealedSecrets or ESC
- **Ask first**: Adding new environment overlays, changing reconciliation intervals
