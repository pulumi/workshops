# AWS TypeScript Kanban Workshop

Build a small Kanban app on AWS with Pulumi and TypeScript — through a sequence of infrastructure stages. The app code is shared; only the infrastructure changes as you move from local to cloud to private networking to event-driven ingestion.

## Prerequisites

- Node.js 20+
- Pulumi CLI and a free Pulumi Cloud account
- An AWS account with admin access
- `just` (optional — used in the examples)

## Start here

See [`tutorial.md`](./tutorial.md) for the full walkthrough. Stages:

1. **Stage 0 — Local.** Run the app on your machine with no cloud resources.
2. **Stage 1 — Basic AWS.** S3 site, public BFF, public backend, DynamoDB.
3. **Stage 2 — Private Backend.** Backend moves into a VPC behind an internal ALB.
4. **Stage 3 — Events.** Webhook ingress + SQS + worker Lambda.

## Repo layout

- `frontend/` — static TypeScript app (no framework)
- `services/{bff,backend,webhook}/` — Lambda entrypoints + local dev servers
- `packages/shared/` — shared types, board service, queue, storage adapters
- `infra-basic/`, `infra-private/`, `infra-events/` — Pulumi programs per stage
- `images/` — stage architecture diagrams referenced in the tutorial
