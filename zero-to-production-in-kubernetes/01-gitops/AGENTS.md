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

## OpenClaw Configuration

OpenClaw runs as a Kubernetes operator + CRD (`OpenClawInstance`).

### Key Files

| File | Purpose |
|------|---------|
| `infrastructure/base/openclaw-operator/` | Helm-based operator (v0.24.2) |
| `apps/base/openclaw/instance.yaml` | OpenClawInstance CR with model config |
| `apps/base/openclaw/secret.yaml` | `OLLAMA_API_KEY` secret (placeholder — update before deploy) |

### Model Provider: Ollama Cloud

- **API mode**: `openai-completions` (NOT `ollama` — native mode breaks tool calling)
- **Base URL**: `https://ollama.com/v1` (OpenAI-compatible endpoint)
- **Auth**: Explicit `headers.Authorization: "Bearer ${OLLAMA_API_KEY}"` (the `apiKey` field doesn't reliably send auth headers — known bug)
- **Model**: `qwen3.5:cloud` (good tool calling support; `nemotron-3-super:cloud` and `minimax-m2.7:cloud` do not work well with tools)

### Config Gotchas

| Gotcha | Detail |
|--------|--------|
| `mergeMode` must be `merge` | Default `overwrite` wipes UI-set config on every pod restart |
| No `"anthropic": { "enabled": false }` | Schema requires `baseUrl` + `models` — just omit the provider and set a non-Anthropic `agents.defaults.model.primary` |
| `sandbox` and `tools` need gateway restart | Hot-reload only applies `model` and `models` — sandbox/tools changes require pod restart |
| Stuck sessions | If the main lane gets stuck, delete `/home/openclaw/.openclaw/agents/main/sessions/` and restart the pod |

### Working Raw Config Template (for UI testing)

```json
{
  "models": {
    "providers": {
      "ollama": {
        "baseUrl": "https://ollama.com/v1",
        "api": "openai-completions",
        "headers": { "Authorization": "Bearer <OLLAMA_API_KEY>" },
        "models": [{
          "id": "qwen3.5:cloud",
          "name": "Qwen 3.5 Cloud",
          "reasoning": false,
          "input": ["text"],
          "contextWindow": 131072,
          "maxTokens": 131072,
          "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 }
        }]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": { "primary": "ollama/qwen3.5:cloud", "fallbacks": [] },
      "models": { "ollama/qwen3.5:cloud": { "alias": "Qwen 3.5" } },
      "sandbox": { "mode": "off" }
    }
  },
  "tools": { "profile": "full", "allow": ["*"], "deny": [], "exec": { "security": "full" } }
}
```

## Notebooks

Workshop demo notebooks live in `notebooks/`.

| File | Purpose |
|------|---------|
| `notebooks/llm-api-demo.ipynb` | LLM API demo (chat, streaming, tool calling, multi-turn) — runs on JupyterHub |

- **Default provider**: OpenAI (`gpt-4.1-nano`). Ollama Cloud free tier times out.
- **Deployment**: Download the raw notebook from GitHub into JupyterHub (hosted on ml-dev / ml-staging clusters only).
- **API key**: Users paste their own OpenAI key into the config cell; never commit real keys.

## JupyterHub

JupyterHub is deployed **only** on ML clusters (`team-ml-dev`, `team-ml-staging`) via dedicated app overlays.

| Component | Location |
|-----------|----------|
| Base chart | `apps/base/jupyterhub/` (HelmRepository + HelmRelease v4.3.2) |
| ML-dev overlay | `apps/ml-dev/jupyterhub-values.yaml` (DummyAuth, GPU+CPU profiles, 5Gi storage) |
| ML-staging overlay | `apps/ml-staging/jupyterhub-values.yaml` (DummyAuth, GPU+CPU profiles, 10Gi storage) |

### Gotchas

| Gotcha | Detail |
|--------|--------|
| Image registry | All images overridden to Docker Hub (`jupyterhub/k8s-hub` etc.) — quay.io has had outages |
| Pre-puller disabled | Hook and continuous pre-puller both disabled to avoid orphaned Jobs/DaemonSets |
| Access | LoadBalancer Service — get external hostname from `kubectl get svc -n jupyterhub` |

## Boundaries

- **Always**: Use Kustomize overlays for env differences, never duplicate base resources
- **Never**: Put Pulumi code here — this is pure Flux YAML
- **Never**: Put secrets with real credentials — use SealedSecrets or ESC
- **Ask first**: Adding new environment overlays, changing reconciliation intervals
