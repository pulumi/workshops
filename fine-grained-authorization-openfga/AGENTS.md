# AGENTS.md — fine-grained-authorization-openfga

Guidance for coding agents (and humans) working in this workshop folder of
`pulumi/workshops`.

## What this folder is

The material for the workshop "Fine-grained authorization as code — OpenFGA
relationship-based access control with Pulumi": demo code and these notes.
No date is scheduled for this workshop yet; it was queued from a demand
signal, not a booked session. The slides are a separate, later piece of
work on this same branch.

The repo carries what an attendee or a future presenter needs: the demo
code, the deck (once built) and these notes. Presenter-only working
documents stay off the repo; `.gitignore` keeps every `*.md` out except
`README.md`, the `AGENTS.md` files and `slides/slides.md`. If you write a
new working document, it is ignored by default; that is deliberate, do not
force-add it.

## Rules

- Stay inside this folder. Never modify other workshop folders in this
  repo.
- Facts about Pulumi and OpenFGA come from the docs listed under "Sources"
  in `README.md`, read on the dates given there. If a doc is unclear, do
  not guess: leave it as an open question.
- Canonical names: Pulumi Cloud, Pulumi IaC. This workshop does not use
  Pulumi Neo, Pulumi ESC or policy as code; do not introduce them.
  OpenFGA's own names: OpenFGA, the OpenFGA HTTP API, a store, an
  authorization model, a relationship tuple, a `Check` call. Never call a
  store a "database" or a tuple a "row".
- Conventional Commits, scoped to this folder, e.g.
  `feat(fine-grained-authorization-openfga): …`,
  `docs(fine-grained-authorization-openfga): …`.
- Do not commit credentials, `venv/`, `node_modules/`, `dist/`, `.state/`,
  recordings.

## Pulumi has no dedicated OpenFGA provider

Verified against the Pulumi Registry (registry.pulumi.com/packages,
2026-09-26): no `openfga` package exists there. `01-stack/openfga_dynamic.py`
closes the gap with three Pulumi dynamic resource providers that call the
OpenFGA HTTP API directly (`openfga.dev/api/service`). If a native provider
appears later, that is a real change worth revisiting this workshop for;
until then, the dynamic-provider pattern is the documented, supported way
to bring an API-only service under Pulumi's lifecycle (see
pulumi.com/docs/iac/concepts/resources/dynamic-providers/).

## Layout

```
fine-grained-authorization-openfga/
├── README.md            this file's sibling — attendee/presenter facing
├── AGENTS.md             this file
├── 01-stack/             Pulumi Python program: container, store, model, tuples (steps 1-4, 6)
├── 02-checks/            Check-call script against the running stack (steps 5, 7)
├── 03-teardown/          teardown verification (step 8)
└── slides/               Slidev deck, built to match the demo steps 1-8
```

## Verification commands, by area

- Python syntax: `python3 -m py_compile 01-stack/__main__.py 01-stack/openfga_dynamic.py`.
- Pulumi: `cd 01-stack && pulumi preview` (stops at the first Docker daemon
  call without a running Docker; report that as the expected stopping
  point, not a pass).
- Shell: `shellcheck --rcfile .shellcheckrc 02-checks/check.sh 03-teardown/verify-teardown.sh`.
- Model JSON: `python3 -c "import json; json.load(open('01-stack/model.json'))"`.
- Repo-wide UTM lint: `make lint` from the repo root (warns only, always
  exits 0 — read the warnings, do not trust the exit code).
