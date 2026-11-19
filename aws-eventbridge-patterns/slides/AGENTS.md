# aws-eventbridge-patterns slides

Workshop: Event routing as code on AWS. 90 minutes. Demo code is in the folders `01-credentials` to `10-teardown`.

## Story

1. The moment: AWS documents that after the retry window an undelivered event is dropped (24 hours, up to 185 attempts by default). Source: https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-rule-retry-policy.html, read 2026-10-08.
2. The tension: an event bus accepts every event. Nothing tells you when one is lost.
3. Why it is hard: a dead-letter queue is a per-target setting that is easy to forget, and a forgotten one fails silently.
4. The questions: how do we prove the safety setting is always on, and how do we recover when an event is lost.
5. The answers: a Pulumi IaC component that sets it, a unit test, a Pulumi Policies pack, Pulumi ESC for credentials, archive and replay.
6. The proof: the demo, ten steps, ending with teardown and a clean check.

## Structure

48 slides, 12 of them demo (25 percent). Time budgets in the speaker notes add up to 90 minutes. Frame slides come from `deck_frame.py` and `frame.json`; do not edit them by hand. Speaker is a placeholder.

## Sources read

AWS EventBridge docs (retry, DLQ, archive, replay, scheduler, input transformation, pricing) and Pulumi docs (components, unit testing, policy as code, write a policy pack, ESC OIDC for AWS), all read 2026-10-08.

## Rules

Run `python3 ~/.workprentice/workshop-deck/deck_frame.py check aws-eventbridge-patterns/slides` before every commit. Commands on slides are the ones the demo runs. At most one slide with program code.

## Headlines

- Housekeeping
- Today's Agenda
- AWS says it plainly: the event is dropped.
- The safety settings live on every target, not on the bus
- Before you trust an event bus with orders
- A custom bus, rules and targets are the parts you wire
- A rule matches an event pattern and picks a target
- Retries, then a dead-letter queue, or the event is gone
- The DLQ keeps the event and tells you why
- Production keeps the default, the demo shortens it
- One EventRouter component builds the bus, the rules and the safety net
- The component turns a copy-paste checklist into one block
- Three questions covered, three to go
- A unit test swaps the Pulumi engine for mocks
- A unit test guards the component, a policy guards every stack
- A Pulumi policy has one of four enforcement levels
- Archive events now, replay them to a rule later
- Archive and replay are billed
- Five questions answered, one to go
- Where this breaks today
- The demo ends with one stack that holds every safeguard
- What we are going to do
- 1 · Short-lived credentials, no keys on disk
- 2 · One rule sends an event to Lambda
- 3 · The second rule sends a transformed message to SQS
- 4 · A broken permission still keeps the event
- 5 · The component replaces nothing
- 6 · The unit test fails on a plain target
- 7 · The policy blocks the plain target at preview
- 8 · Archived events replay from the CLI
- 9 · A schedule sends a heartbeat every five minutes
- 10 · Destroy it and check nothing is left
- Resources
- Continue your Pulumi journey!
