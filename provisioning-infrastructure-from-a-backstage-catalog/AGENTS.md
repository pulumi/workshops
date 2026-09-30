# AGENTS.md — provisioning-infrastructure-from-a-backstage-catalog

Guidance for coding agents (and humans) working in this workshop folder of
`pulumi/workshops`.

## What this folder is

The material for the workshop "Provisioning real infrastructure from a
Backstage catalog with Pulumi": a Backstage software template whose "Create"
button runs a custom scaffolder action, which drives the Pulumi Automation API
inline to provision a real, tagged, policy-checked AWS S3 bucket, using
short-lived credentials from a Pulumi ESC OIDC environment. See `README.md`
for the layout, the prerequisites and how to run the whole flow end to end.

The repo carries what an attendee or a future presenter needs: the demo code
and these notes (slides follow in a later run on this same branch). Working
documents — brief drafts, fact-check logs, open questions — stay off this
branch; `.gitignore` keeps every `*.md` out except `README.md` and the
`AGENTS.md` files. If you write a new working document, it is ignored by
default; that is deliberate, do not force-add it.

## Rules

- Stay inside this folder. Never modify other workshop folders in this repo.
- Facts about Backstage and Pulumi products come from the docs listed under
  "Sources" in `README.md`, read the day this folder was built. If a doc is
  unclear or a brief's claim does not match the current docs, say so in the
  pull request rather than guessing or silently following the brief.
- Canonical names: Pulumi Neo (or Neo), Pulumi ESC, Pulumi Cloud, Pulumi IaC,
  Pulumi Policies, pulumi console (lowercase console). Never "Copilot",
  "Pulumi Service", "Insights", or "CrossGuard" as a product name.
- Conventional Commits, scoped to this folder, e.g.
  `feat(provisioning-infrastructure-from-a-backstage-catalog): …`,
  `docs(provisioning-infrastructure-from-a-backstage-catalog): …`.
- Do not commit credentials, `node_modules/`, `dist/`/`bin/`, `.state/`,
  recordings, or the scaffolded Backstage `app/` directory.

## Slides (`slides/`)

Not built yet. This run covers demo code only; slides are a separate,
subsequent run on this same branch, built from the demo flow documented here.

## Demo code

- `01-backstage-host/`: Docker Compose (Backstage + Postgres). Check:
  `docker compose config` must parse without error (Docker itself was not
  available on the build workstation; this is the furthest check that could
  run there — see the pull request for what was and was not verified).
- `02-template/`: `template.yaml`. Check: parses as valid YAML with
  `apiVersion: scaffolder.backstage.io/v1beta3`, `kind: Template`, and a step
  whose `action` matches the custom action ID registered in
  `03-scaffolder-action`.
- `03-scaffolder-action/`: TypeScript scaffolder backend module. Check:
  `npm install && npx tsc --noEmit` must pass, and
  `npx tsx test/preview.ts` (offline Automation API preview, dummy AWS
  credentials, no real cloud calls) must complete with no errors.
- `04-esc-oidc/bootstrap/`: TypeScript Pulumi program, run once by a presenter
  against their own AWS account. Check: `npm install && npx tsc --noEmit`
  must pass. `pulumi up` was not run against real AWS in this build (no
  credentials on the build workstation).
- `04-esc-oidc/environment.yaml`: ESC environment definition. Check: valid
  YAML; the `aws-login` provider's fields (`roleArn`, `sessionName`,
  `duration`) match the current ESC docs, not the brief's assumed field name.
- `05-pulumi-cloud/`: no code, a presenter walkthrough only.
- `06-policy/`: Pulumi Policies pack. Check: `npm install && npx tsc --noEmit`
  must pass, and `npx tsc && node bin/test/rules-test.js` must report
  `failed=0` (or the project's equivalent invocation — see its own
  `AGENTS.md`).
- `07-teardown/`: `teardown.sh`. Check: `shellcheck teardown.sh` must be
  clean against this folder's `.shellcheckrc`.
