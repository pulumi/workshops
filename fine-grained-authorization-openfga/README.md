# Fine-grained authorization as code — OpenFGA relationship-based access control with Pulumi

A 90-minute workshop on relationship-based access control (ReBAC): modeling
and provisioning an OpenFGA store, authorization model and relationship
tuples as Pulumi code, then checking access for both a human user and an AI
agent principal against that model.

> Your RBAC system can't cleanly answer "can this AI agent deploy to
> production?" Relationship-based access control can. This workshop
> provisions an OpenFGA authorization model as Pulumi code, then proves it:
> a deny for an under-privileged agent, a one-line diff, an allow.
>
> No workshop page exists yet — this topic has no delivery scheduled. It
> was queued from a demand signal (see "Why now" below), not a booked
> session.

## Sessions and speakers

| Session | Date | Length |
|---|---|---|
| — | not scheduled | 90 min (planned) |

Speakers: unknown — not yet assigned.

## Why now

Five independent sources converged on the same gap: existing RBAC and
simple OIDC scopes do not express who-can-do-what-to-which-resource
relationships cleanly, and that gap is now surfacing for AI agents acting
as principals, not only humans.

- A KubeCon EU 2026 session (2026-03-26, Tetrate and Okta) demonstrated
  fine-grained authorization at the Envoy Gateway level using OpenFGA.
- Arcade.dev (2026-06-23) described OpenFGA, built on Google's Zanzibar
  model, as formalizing AI agents as first-class principals alongside
  human users.
- Three further, independently-published pieces (JAVAPRO on OpenFeature,
  Debezium and NetEye on Keycloak/OIDC) corroborate that the identity and
  access layer is getting fresh attention across the ecosystem, though
  they are adjacent topics rather than ReBAC itself.

See "Sources" below for links and read dates. No coverage of this topic
existed in `pulumi/workshops` or the delivery schedule as of 2026-09-26.

## What attendees learn

1. Explain the relationship-based access control (ReBAC) model and how it
   differs from RBAC, in terms of the Zanzibar tuple model (object,
   relation, user).
2. Write a Pulumi program that provisions an OpenFGA store, an
   authorization model, and a set of relationship tuples.
3. Run an OpenFGA `Check` call against a deployed model and correctly
   predict allow/deny for a given tuple set.
4. Add an AI agent as a distinct principal type in the authorization
   model, alongside a human user, and grant it a narrower set of
   relations.
5. Tear down the full stack with `pulumi destroy` and verify no orphaned
   containers or state remain.

## Layout

```
fine-grained-authorization-openfga/
├── README.md            this file
├── AGENTS.md            conventions for agents (and humans) editing this folder
├── 01-stack/            Pulumi Python program: OpenFGA container, store, authorization model, tuples
│   ├── __main__.py      the program itself (steps 1-4, 6)
│   ├── openfga_dynamic.py   the three OpenFGA dynamic resource providers
│   └── model.json       the authorization model (also the presenter's pre-validated fallback)
├── 02-checks/           check.sh — runs an OpenFGA Check call against the running stack (steps 5, 7)
├── 03-teardown/         verify-teardown.sh — confirms `pulumi destroy` left nothing behind (step 8)
└── slides/              Slidev deck, built to match the demo steps 1-8
```

## Prerequisites

Participant:

- Docker installed and running locally.
- The Pulumi CLI installed and logged in to a local or free Pulumi Cloud
  backend.
- Python 3.10+ (the `01-stack` project manages its own virtualenv via
  `pulumi up`, per `Pulumi.yaml`).
- An HTTP client (curl, httpie, or Postman) for manual verification,
  optional but recommended — `02-checks/check.sh` does this for you.
- Basic familiarity with the Pulumi Python runtime; no prior OpenFGA
  experience assumed.

Presenter, done in advance:

- Pull `openfga/openfga:v1.21.0` ahead of time (`docker pull
  openfga/openfga:v1.21.0`); do not rely on a live pull during the
  session.
- Pre-validate `01-stack/model.json` against a running OpenFGA instance —
  a malformed model is a silent, hard-to-debug failure live. It could not
  be validated against a live server while this demo was built (no Docker
  on the build workstation); validate it once, on a machine with Docker,
  before the first rehearsal.
- Dry-run the full sequence below at least once on the presentation
  machine, not just a dev laptop, to catch environment drift.
- Have a terminal font size and window pre-sized for the room/stream.
- Fallback for a container that fails to start (port conflict, image pull
  failure, resource limits): keep a second, pre-started container in a
  second terminal tab and narrate against it if the live one fails.
- Fallback for a hung `Check` call (unlikely on localhost, but possible
  under load from other demos on the same machine): have terminal output
  from a successful earlier dry run saved as a screenshot or recording to
  show if a live call hangs for more than ~15 seconds.

## Run the demo

Once, before the room:

```bash
cd 01-stack
pulumi stack init dev
pulumi up --yes    # container, store, authorization model, tuples
```

The live sequence (steps 1-8), from a fresh `pulumi up`:

```bash
# Steps 1-4 already ran above: container, store, model, tuples
# (agent:deploy-bot has viewer only — deliberately not deployer yet).

# Step 5: the deny case.
cd ../02-checks
./check.sh agent:deploy-bot can_deploy stack:production   # allowed: false

# Step 6: the live edit. In 01-stack/__main__.py, uncomment the line
# granting agent:deploy-bot the deployer relation, then:
cd ../01-stack
pulumi up --yes    # incremental: only the new tuple is written

# Step 7: the allow case, and the contrast that never changed.
cd ../02-checks
./check.sh agent:deploy-bot can_deploy stack:production   # now allowed: true
./check.sh user:alice can_deploy stack:production          # allowed: true throughout

# Step 8: teardown.
cd ../01-stack
pulumi destroy --yes
cd ../03-teardown
./verify-teardown.sh
```

Between runs: `pulumi destroy --yes` in `01-stack`, re-comment the live
edit in `__main__.py` back out, then `pulumi up --yes` again for the next
run.

Estimated cost: $0. Everything runs against a local Docker container with
an in-memory datastore; no cloud resources are created.

## Sources

All read 2026-09-26.

- KubeCon EU 2026 session, Tetrate and Okta engineers, fine-grained
  authorization at the Envoy Gateway level using OpenFGA (2026-03-26):
  https://kccnceu2026.sched.com/event/2CW6G/tailor-made-dynamic-fine-grained-authorization-for-api-traffic-erica-hughberg-tetrate-andres-aguiar-okta
- Arcade.dev blog, per-action authorization for AI agents, OpenFGA and the
  Zanzibar model (2026-06-23):
  https://www.arcade.dev/blog/enterprise-managed-authorization-per-action-authorization-ai-agents/
- JAVAPRO International, OpenFeature and feature flags tutorial for Java
  developers (2026-05-14):
  https://javapro.io/2026/05/14/openfeature-one-flag-to-rule-them-all/
- Debezium project blog, Kubernetes deployment behind Keycloak-based SSO
  (2026-08-27):
  https://debezium.io/blog/2026/08/27/single-sign-on-for-the-debezium-platform/
- NetEye engineering blog, centralizing authn/authz with Keycloak and OIDC
  in a multi-component platform (2026-03-31):
  https://www.neteye-blog.com/blog/2026/03/31/rethinking-authentication-and-authorization-in-a-multi-component-platform-with-oidc/
- OpenFGA configuration language (JSON/DSL schema for authorization
  models), read 2026-09-26: https://openfga.dev/docs/configuration-language
- OpenFGA "Modeling Agents as Principals", read 2026-09-26:
  https://openfga.dev/docs/modeling/agents/agents-as-principals
- OpenFGA "Immutable Authorization Models" (why models are append-only,
  never updated in place), read 2026-09-26:
  https://openfga.dev/docs/getting-started/immutable-models
- OpenFGA releases, confirming `v1.21.0` is the current tag, read
  2026-09-26: https://github.com/openfga/openfga/releases
- `openfga-sdk` on PyPI (0.10.4 as of build time — not used directly by
  this demo, which calls the HTTP API from the dynamic providers instead;
  see "Open questions" in the pull request for why), read 2026-09-26:
  https://pypi.org/project/openfga-sdk/
- Pulumi Docker provider, `docker.Container` and `docker.RemoteImage`
  (v5.2.0, confirming no dedicated OpenFGA provider exists in the Pulumi
  Registry), read 2026-09-26:
  https://www.pulumi.com/registry/packages/docker/api-docs/container/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops
- Pulumi dynamic providers, read 2026-09-26:
  https://www.pulumi.com/docs/iac/concepts/resources/dynamic-providers/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops
