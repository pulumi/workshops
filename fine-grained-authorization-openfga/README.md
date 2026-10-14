# Fine-grained authorization as code: OpenFGA relationship-based access control with Pulumi

A 90-minute workshop. You define a relationship-based authorization model as
Pulumi code, provision it into an OpenFGA server running in a local Docker
container, and check access for a human user and for an AI agent. The agent
starts as a viewer and is denied. A one-line change to a tuple list, applied
with `pulumi up`, makes the same check come back allowed.

> RBAC roles say what a person can do in general. They do not say whether this
> agent may deploy to that one stack. Relationship-based access control (ReBAC)
> answers that question directly, and Pulumi can manage the answer as a diff.

## What attendees learn

1. How ReBAC differs from RBAC, in terms of the Zanzibar tuple model (object, relation, user).
2. How to write a Pulumi program that provisions an OpenFGA store, an authorization model and relationship tuples.
3. How to run an OpenFGA Check call against a deployed model and predict allow or deny for a given tuple set.
4. How to add an AI agent as its own principal type next to a human user, with a narrower set of relations.
5. How to tear everything down with `pulumi destroy` and verify that no container is left behind.

## Layout

```
fine-grained-authorization-openfga/
├── README.md                  this file
├── AGENTS.md                  conventions for agents (and humans) editing this folder
├── .gitignore                 ignores working docs, venv and build output
├── .shellcheckrc              shellcheck settings for every script here
├── 01-stack/                  Pulumi Python project: steps 1 to 4 and 6
│   ├── .gitignore             venv and bytecode
│   ├── Pulumi.yaml            project definition, Python runtime with a local venv
│   ├── Pulumi.dev.yaml        stack config: the store name
│   ├── __main__.py            container, store, model and tuples, wired together
│   ├── model.json             the authorization model (user, agent, stack)
│   ├── openfga_dynamic.py     the three dynamic resources that call the OpenFGA API
│   ├── requirements.txt       pinned Python packages
│   └── tuples.py              the relationship tuples; the deployer grant lives here
├── 02-checks/                 steps 5 to 7: Check calls and the grant switch
│   ├── check.sh               one Check call against the running store
│   ├── grant-deployer.sh      step 6: uncomment the deployer tuple
│   ├── lib.sh                 shared helpers
│   └── reset-grant.sh         between runs: comment the deployer tuple out again
└── 03-teardown/               step 8
    └── verify-teardown.sh     confirms no container and no open API port after destroy
```

## Prerequisites

Participants:

- Docker, installed and running.
- The Pulumi CLI, logged in to a local backend or to Pulumi Cloud.
- Python 3.10 or newer.
- `curl`. An HTTP client of your choice is optional, for poking at the API.

Presenter, in advance:

- Pull the image so the session does not depend on the network: `docker pull openfga/openfga:v1.21.0`.
- Do one full dry run of `pulumi up`, Check, `pulumi up`, Check, `pulumi destroy` on the presentation machine.
- Keep the terminal output of a successful dry run as a fallback recording.
- Size the terminal font for the room or stream.

## Run the demo

One-time setup:

```bash
cd 01-stack
python3 -m venv venv
venv/bin/pip install -r requirements.txt
pulumi stack init dev
```

The demo, steps 1 to 8:

```bash
# Steps 1-4: container, store, model, tuples
pulumi up

# Step 5: the agent only has the viewer relation, so this prints "allowed: false"
../02-checks/check.sh agent:deploy-bot can_deploy stack:production

# Step 6: grant the deployer relation as a code change, then apply it
../02-checks/grant-deployer.sh
pulumi up
../02-checks/check.sh agent:deploy-bot can_deploy stack:production   # allowed: true

# Step 7: alice is an owner, so this prints "allowed: true" before and after the grant
../02-checks/check.sh user:alice can_deploy stack:production

# Step 8: tear down and verify
pulumi destroy
../03-teardown/verify-teardown.sh
```

| Step | What happens | Expected end state | Proof |
|---|---|---|---|
| 1 | `openfga/openfga:v1.21.0` starts with the in-memory datastore, API on 8080, playground on 3000 | container `openfga-workshop` running | `docker ps` |
| 2 | `OpenFgaStoreResource` creates the store `pulumi-workshop` | `store_id` stack output set | `pulumi stack output store_id` |
| 3 | `OpenFgaAuthModelResource` writes the model from `model.json` | `authorization_model_id` stack output set | `pulumi stack output authorization_model_id` |
| 4 | `OpenFgaTuplesResource` writes alice as owner and deploy-bot as viewer of `stack:production` | two tuples in the store | step 5 |
| 5 | Check `agent:deploy-bot` `can_deploy` `stack:production` | `allowed: false` | `02-checks/check.sh` |
| 6 | Deployer tuple added in code, `pulumi up` writes only the new tuple | same Check now `allowed: true` | `02-checks/check.sh` |
| 7 | Check `user:alice` `can_deploy` `stack:production` | `allowed: true` before and after | `02-checks/check.sh` |
| 8 | `pulumi destroy` removes tuples, store and container in reverse order | no container, API port closed | `03-teardown/verify-teardown.sh` |

Between runs, after `pulumi destroy`, put the deny case back:

```bash
../02-checks/reset-grant.sh
```

The demo runs on localhost with Docker only, so it costs nothing. The playground
is at `http://localhost:3000/playground` while the container is up.

### Model

`model.json` defines three types. `stack` has the direct relations `owner`,
`viewer` and `deployer`, plus two computed ones: `can_view` is `owner` or
`viewer`, and `can_deploy` is `owner` or `deployer`. `viewer` and `deployer`
accept both `user` and `agent` principals. `owner` accepts `user` only.

### Fallbacks

- Container fails to start (port conflict, image pull, resource limits): run a pre-started container in a second terminal tab and narrate the same steps against it.
- The dynamic provider rejects the model: keep a known-good copy of `model.json` ready to paste, and use the error to talk about model validation. OpenFGA validates the model on write, so a typo in a relation name fails loudly.
- A live Check call hangs for more than about 15 seconds: show the saved output of the dry run.

## Notes on the code

- There is no native OpenFGA Pulumi provider, so `01-stack/openfga_dynamic.py` wraps the HTTP API in three `pulumi.dynamic.ResourceProvider` classes with `requests`.
- OpenFGA has no endpoint to delete an authorization model. The model resource's delete does nothing, and deleting the store removes the model.
- A model change creates a new model version (models are immutable), and the tuples resource then follows the new model id.
- The tuples resource diffs old and new tuple lists on update and sends only the added and removed tuples.

## Sources

Read 2026-10-01:

- OpenFGA, run in Docker: https://openfga.dev/docs/getting-started/setup-openfga/docker
- OpenFGA, perform a check: https://openfga.dev/docs/getting-started/perform-check
- Pulumi dynamic providers: https://www.pulumi.com/docs/iac/concepts/resources/dynamic-providers/
- Pulumi Docker provider: https://www.pulumi.com/registry/packages/docker/
- OpenFGA releases (v1.21.0 was the latest stable on 2026-10-01): https://github.com/openfga/openfga/releases
