# AGENTS.md -- observability-as-code-otel-prometheus-grafana

Guidance for coding agents (and humans) working in this workshop folder of
`pulumi/workshops`.

## What this folder is

The material for "Observability as Code: OpenTelemetry, Prometheus and
Grafana on Kubernetes with Pulumi" -- see `README.md` for the layout, the
target platform, the open questions, and what has and has not been verified.

The repo carries what an attendee or a future presenter needs: the demo code
and these notes (the slide deck follows as a separate commit on this
branch). Presenter-only working documents stay off the repo; `.gitignore`
keeps every `*.md` out except `README.md`, the `AGENTS.md` files and
`slides/slides.md`. If you write a new working document, it is ignored by
default; that is deliberate, do not force-add it.

## Rules

- Stay inside this folder. Never modify other workshop folders in this repo.
- Facts about Prometheus, Grafana, OpenTelemetry and Tempo come from the
  docs listed under "Sources" in `README.md`, read fresh, never from memory.
  Facts about Pulumi resources and options come from
  https://www.pulumi.com/docs and https://www.pulumi.com/registry. If a doc
  is unclear, say so as an open question rather than guessing.
- Canonical names: Pulumi ESC, Pulumi Cloud, Pulumi IaC, Pulumi console
  (lowercase console). Never "Copilot", never "Pulumi Service".
- Every command on a slide (once the deck exists) must be one this demo
  actually runs, with the same flags.
- `02-metrics-stack` holds the only two `helm.v3.Release` resources in this
  workshop; see that folder's `AGENTS.md` before changing it.
- `06-alert-rule`'s `CustomResource` puts `spec` at the top level of the
  resource args, never nested under an `otherFields` wrapper -- that
  wrapper silently produces a CustomResource whose spec Kubernetes never
  sees.
- Credentials, `node_modules/`, `bin/`, kubeconfig files and Pulumi state
  never enter a commit.
