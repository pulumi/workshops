
# AGENTS.md — 05-scale-brokers

A single script, `scale-brokers.sh`, no Pulumi project of its own: it
drives `pulumi config set brokerReplicas` + `pulumi up` against the
**02-kafka** stack from outside that folder.

## Why a script and not a new Pulumi project

Scaling brokers is a config change to an existing stack (`02-kafka`), not
new infrastructure. A separate Pulumi project here would either duplicate
`02-kafka`'s resources (drift risk) or need its own `StackReference` back
into `02-kafka` just to mutate one config value, which is more machinery
than the operation warrants. A shell script that shells out to
`pulumi config set` + `pulumi up --cwd ../02-kafka` is the pattern this
repo already uses for `03-replication` and `04-failover` in the
CloudNativePG workshop: presenter-facing demo steps that are actions, not
new resources, are scripts, not projects.

## How to work here

- `chmod +x scale-brokers.sh`; `shellcheck scale-brokers.sh` must pass
  against this folder's inherited `.shellcheckrc`.
- Defaults assume the demo's default names (`kafka` namespace,
  `demo-cluster` cluster, `kind-kafka-workshop-demo` context); override via
  env vars if the presenter renamed anything, same pattern as the
  CloudNativePG workshop's step scripts.
- Never run this against a Kafka version currently mid-upgrade
  (`06-rolling-upgrade`); run scaling and the version upgrade as two
  separate, sequential demo beats, matching the brief's step order.

## Verification

- `shellcheck scale-brokers.sh`.
- Live: run it, confirm a new broker pod reaches `Running`, and that
  `04-clients`' consumer keeps printing messages with no visible gap.
