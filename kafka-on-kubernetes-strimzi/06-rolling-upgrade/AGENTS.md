
# AGENTS.md — 06-rolling-upgrade

A single script, `rolling-upgrade.sh`, no Pulumi project of its own, for
the same reason as `05-scale-brokers`: this is a config change to the
existing `02-kafka` stack, not new infrastructure.

## What it does

Runs Strimzi's documented two-step KRaft upgrade procedure end to end: bump
`kafka.version` first (leaving `metadataVersion` at its old value), wait for
the resulting roll to settle, then bump `metadataVersion` to the new
version's default and wait again. See the comment block at the top of
`rolling-upgrade.sh` for the doc citation and why it is two steps, not one.

Ships one move by default: Kafka 4.2.1 → 4.3.1, `metadataVersion`
`4.2-IV1` → `4.3-IV0`. Both Kafka versions are supported by the Strimzi
1.2.0 operator this workshop installs.

## How to work here

- `chmod +x rolling-upgrade.sh`; `shellcheck rolling-upgrade.sh` must pass.
- Run `05-scale-brokers` and this script as separate demo beats, never
  interleaved — do not scale while an upgrade is mid-roll.
- If a future Strimzi/Kafka release changes which versions are supported,
  update the two default arguments here (and the matching defaults in
  `02-kafka/index.ts`) together; they must describe the same starting
  point.

## Verification

- `shellcheck rolling-upgrade.sh`.
- Live: run it, confirm both `pulumi up` calls report the Kafka resource
  back to Ready, and that `04-clients`' consumer log shows no gap across
  either restart.
