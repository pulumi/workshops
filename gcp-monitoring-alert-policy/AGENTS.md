# AGENTS.md: gcp-monitoring-alert-policy

Guidance for coding agents (and humans) working in this workshop folder of `pulumi/workshops`.

## What this folder is

The material for the workshop "Monitoring as code on Google Cloud": a Cloud Run service, a request-based SLO, burn-rate alert policies, a log-based metric and a dashboard, packaged as a Pulumi IaC component with a unit test and a Pulumi Policies rule. See `README.md` for the layout, the demo commands and what is not verified yet.

The repo carries what an attendee or a future presenter needs: the demo code and these notes (the deck follows in `slides/`). The presenter's working documents stay on the presenter's machine; `.gitignore` keeps every `*.md` out except `README.md`, the `AGENTS.md` files and `slides/slides.md`. A new working document is ignored by default. Do not force-add it.

## Rules

- Stay inside this folder. Never modify other workshop folders in this repo.
- Facts about Pulumi products come from the docs listed under "Sources" in `README.md`. If a doc is unclear, write the question down instead of guessing.
- Canonical names: Pulumi IaC, Pulumi ESC, Pulumi Cloud, Pulumi Policies, Pulumi console (lowercase console). Never "Copilot", "Pulumi Service", "Insights", "CrossGuard".
- Conventional Commits, scoped to this folder, for example `feat(gcp-monitoring-alert-policy): ...`.
- Do not commit credentials, `node_modules/`, `dist/`, `bin/`, `.state/` or recordings.
- Pins: `@pulumi/pulumi` 3.268.0, `@pulumi/gcp` 10.1.0, `@pulumi/policy` 1.21.0. Change them in all project folders together.
- Every command in `README.md` and on a slide is one the demo runs. If you change a script or a flag, change the docs in the same commit.
- The shell scripts must pass `shellcheck` (settings in `.shellcheckrc`).

## Demo flow

Folders `00` to `07` follow the demo steps. `03-inline` and `04-component` describe the same resources. `04-component` can take over an `03-inline` stack when `adoptInline` is `true`.

## Credentials

Pulumi ESC logs in to Google Cloud through OIDC (`01-esc/gcp-oidc.yaml`). Each `Pulumi.dev.yaml` imports `gcp-monitoring-workshop/gcp-oidc`. Never add a service account key, `gcp:credentials` or an access token to a config file or a script.
