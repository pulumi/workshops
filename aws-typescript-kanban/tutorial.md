# AWS TypeScript Workshop — Tutorial

Follow the stages in order. Each stage builds on the previous one.

## Prerequisites

- Node.js 20+
- Pulumi CLI
- AWS account with admin access (from Stage 1 onward)
- `just` (optional but used in examples)

---

## Stage 0 — Local

Run the full app on your machine. No cloud resources.

### Start

```bash
just start-local
```

### Open

`http://127.0.0.1:7070`

### What you should see

- A Kanban board with seed cards (GitHub, Jira, Slack, custom sources)
- Queue and DLQ counters in the metric strip
- Debug footer links: `bff logs`, `backend logs`

### Try it

1. Drag a card between columns.
2. Click a card to open the detail panel.
3. Click **Simulate Event** and submit — a new card appears in inbox a second later.
4. Post a webhook from the terminal:
   ```bash
   curl -s -X POST http://127.0.0.1:7070/webhooks/external \
     -H 'content-type: application/json' \
     -d '{"title":"Hello from curl","sourceType":"slack","externalId":"demo#1"}'
   ```

### See the BFF coalesce

```bash
for i in {1..6}; do
  curl -s http://127.0.0.1:7070/api/notifications | jq '{fromCache, ageMs}'
  sleep 0.3
done
```

First call returns `fromCache: false`; the next calls within ~3s return `fromCache: true`.

Open `http://127.0.0.1:7070/api/logs` and `http://127.0.0.1:7001/internal/logs` and compare: the BFF shows every call, the backend only sees one.

---

## Code Tour

Before going to the cloud, open these files to see how the pieces fit:

**Frontend** — static TypeScript, vanilla DOM, drag-and-drop board.
- [`frontend/src/app.ts`](./frontend/src/app.ts) — render loop, state, fetch calls

**BFF** — public tier. Serves the frontend, proxies the board API, owns view-level policy (retries, notifications, coalescing).
- [`services/bff/src/local-server.ts`](./services/bff/src/local-server.ts)

**Backend** — private tier. Owns board state and queue worker.
- [`services/backend/src/local-server.ts`](./services/backend/src/local-server.ts)
- [`packages/shared/src/backend-service.ts`](./packages/shared/src/backend-service.ts) — the domain logic

**Shared types** used across all three services:
- [`packages/shared/src/types.ts`](./packages/shared/src/types.ts)

---

## Stage 1 — Basic AWS

### Create the Pulumi project

```bash
mkdir infra && cd infra
pulumi new aws-typescript
```

Answer the prompts:

| Prompt | Value |
|---|---|
| Project name | `ticket-machine` |
| Project description | *(accept default)* |
| Stack name | `dev` |
| Package manager | `npm` |
| AWS region | `ca-central-1` |

When it finishes you have a minimal `index.ts`, `Pulumi.yaml`, and `Pulumi.dev.yaml`.

### First deploy

```bash
pulumi up
```

Confirm `yes`. This deploys the starter bucket from the template so you can verify your AWS credentials and see Pulumi Cloud update.

### Look at Pulumi Cloud

Open the URL printed by `pulumi up` — the stack page shows resources, the update history, and the state.

### Verify

List buckets in your region — the new one should be there:

```bash
aws s3api list-buckets --bucket-region ca-central-1 --output table
```

### Diff the starter against the target

```bash
code --diff index.ts ../infra-basic/index.ts
```

### Open the architecture diagram

```bash
open ../images/stage-1-basic-aws.png
```

S3 site → public API → BFF Lambda → backend API → backend Lambda → DynamoDB.

### Project config — `infra/Pulumi.yaml`

```yaml
name: typescript-aws-kanban
runtime: nodejs
description: TypeScript AWS Kanban basic public AWS infrastructure
```

### Stack config — `infra/Pulumi.dev.yaml`

```yaml
config:
  typescript-aws-kanban:appName: TypeScript AWS Kanban
  aws:region: ca-central-1
  lambda:memory: "512"
  lambda:timeout: "30"
  backend:provisionedConcurrency: "1"
```

### Prod stack config — `infra/Pulumi.prod.yaml`

```yaml
config:
  typescript-aws-kanban:appName: TypeScript AWS Kanban
  aws:region: ca-central-1
  lambda:memory: "2048"
  lambda:timeout: "30"
  backend:provisionedConcurrency: "5"
```

Create and select it:

```bash
pulumi stack init prod
pulumi stack select prod
```

### Copy the real file in

```bash
npm run build --prefix ..
cp ../infra-basic/index.ts index.ts
```

### Preview

```bash
pulumi preview
```

### Deploy

```bash
pulumi up
```

Grab the outputs:

```bash
pulumi stack output frontendUrl
pulumi stack output publicApiUrl
pulumi stack output backendPublicUrl
```

Open `frontendUrl` in a browser — same app, now live on AWS.

> **Heads up on cost.** The `prod` stack sets `backend:provisionedConcurrency` to 5, which keeps 5 Lambda instances warm 24/7 (~$15/month per instance). Leave it at `0` in `dev`, and `pulumi destroy` any stack when you're done with it.

View on AWS console here:
```
https://ca-central-1.console.aws.amazon.com/lambda/home?region=ca-central-1#/functions
```

### Where are we now?

- Frontend lives on S3 and is served as a plain website
- Public API Gateway routes `/api/*` → BFF Lambda
- BFF Lambda calls the backend Lambda over a **second, public** API Gateway
- Backend Lambda reads/writes DynamoDB
- Both Lambdas are reachable directly from the internet

The flaw: anyone on the internet can hit the backend API and skip the BFF. That's what Stage 2 fixes.

---

## Stage 2 — Private Backend

Same rhythm as Stage 1, but faster.

### Diff

```bash
code --diff index.ts ../infra-private/index.ts
```

What's new vs Stage 1:
- VPC, two private subnets, a route table
- Internal ALB in front of the backend Lambda
- BFF now runs inside the VPC and calls the backend over the ALB's internal DNS
- Backend's public API Gateway is gone
- Security groups wire the BFF → ALB → backend path

### Review

Architecture for this stage:

```bash
open ../images/stage-2-private-backend.png
```

Point to highlight: the backend Lambda has no public route anymore. Only the BFF (inside the VPC) can reach it.

### Switch and deploy

```bash
cp ../infra-private/index.ts index.ts
pulumi preview
pulumi up
```

### Verify

```bash
# BFF still works
curl -s "$(pulumi stack output publicApiUrl)"/api/board | jq '{mode, items: (.items|length)}'

# Backend has no public URL to hit anymore — confirm the output is gone
pulumi stack output backendPublicUrl 2>&1 | head -1
```

Expected: `mode: "aws-private"`, backend URL output absent.

### Where are we now?

- Browser → public BFF → internal ALB → private backend → DynamoDB
- Backend is no longer reachable from the internet
- Webhook ingestion is still synchronous — heavy bursts can still hammer the backend. Stage 3 fixes that.

---

## Stage 3 — Events

Problem: in Stage 2 the "Simulate Event" button fails — there's no public webhook path and no queue. Incoming events from Slack/GitHub/Jira need an async ingress that doesn't block the backend.

### Architecture

```bash
open ../images/stage-3-events.png
```

One public API Gateway splits: `/api/*` → BFF, `/webhooks/external` → ingress Lambda → SQS → worker → backend.

### Webhook handler code

```bash
code ../services/webhook/src/lambda.ts
```

Tiny Lambda: validate payload, `SendMessage` to SQS, return 202. The worker ([`services/backend/src/lambda-worker.ts`](./services/backend/src/lambda-worker.ts)) is wired to the queue via `EventSourceMapping` and does the real work.

### Diff

```bash
code --diff index.ts ../infra-events/index.ts
```

What's new vs Stage 2:
- SQS queue + DLQ (`redrivePolicy`, `maxReceiveCount: 3`)
- Worker Lambda via `EventSourceMapping` (`ReportBatchItemFailures`)
- Webhook ingress Lambda
- New route `POST /webhooks/external` on the existing public API Gateway
- `sqs-policy` IAM role policy (separate from `app-policy` for a clean diff)
- Queue URLs in every Lambda's env

### Copy and deploy

```bash
cp ../infra-events/index.ts index.ts
pulumi preview
pulumi up
```

### Verify

```bash
API=$(pulumi stack output publicApiUrl)

# POST a webhook — returns 202 immediately
curl -sX POST "$API/webhooks/external" \
  -H 'content-type: application/json' \
  -d '{"title":"Stage 3 test","sourceType":"slack","externalId":"demo#1"}'

# Worker drains SQS within a couple seconds; the item shows up on the board
curl -s "$API/api/board" | jq '.items[] | select(.title=="Stage 3 test")'

pulumi stack output queueUrl
pulumi stack output deadLetterQueueUrl
```

Expected: webhook returns `{"accepted":true,"messageId":"..."}` with HTTP 202, then the item appears on `/api/board` within a few seconds.

### Where are we now?

- Public API Gateway fans out: browser → BFF, webhooks → ingress → SQS → worker → backend state
- Failures retry 3× then land in the DLQ for inspection
- Heavy webhook bursts no longer block user-facing traffic

---

## Cleanup

```bash
cd <stage-folder>
pulumi destroy
```

---

## Continuing Exercises

Each stage intentionally cuts corners so the architectural move is the star. Here is what a real deployment would add — pick whichever is most interesting.

- **Split per-Lambda IAM roles.** Today one `lambda-role` is shared by the BFF, backend, webhook, and worker — and granted `sqs:PurgeQueue` across the board. Replace with four roles, each scoped to exactly what that Lambda touches (BFF: nothing AWS-side; backend: `dynamodb:GetItem/PutItem` on the table ARN; webhook: `sqs:SendMessage` on the queue ARN; worker: `sqs:ReceiveMessage/DeleteMessage` + `dynamodb:GetItem/PutItem`). Least-privilege, one role at a time.
- **Add a CDN.** Put CloudFront in front of the S3 site (and optionally the public API). Gets HTTPS on the frontend, a global edge cache, and lets you switch the bucket to private + Origin Access Control.
- **Add simple auth.** Shared-secret header check inside the BFF handler — no Cognito, no authorizer, no extra resources. Set `API_TOKEN` via `pulumi config set --secret`, pipe it into the BFF Lambda env, reject requests without a matching `x-api-key` header. Frontend reads the token from `window.__WORKSHOP_CONFIG__` and attaches it to every fetch. ~10 lines of code.
- **Verify webhook signatures.** Pick a provider (Slack or GitHub), validate the HMAC signature on the raw body in `services/webhook/src/lambda.ts` before enqueueing. Store the signing secret via `pulumi config set --secret`.
- **Enable log retention and tags.** Create an `aws.cloudwatch.LogGroup` per Lambda with `retentionInDays: 7` (default is never-expire). Add a consistent `tags: { workshop, stage, owner }` map to every resource — one-line hygiene that real shops require.
- **Bundle with esbuild.** Swap `scripts/build.mjs`'s `tsc --outDir dist` for `esbuild --bundle --platform=node --target=node20 --external:aws-sdk`. Stop shipping `node_modules` in every Lambda; watch the package size drop an order of magnitude.
- **Refactor repeated Lambda wiring into a `ComponentResource`.** In `infra-events/index.ts` the pattern "Lambda + alias + integration + route + permission" repeats for BFF, webhook, and backend-http. Encapsulate it as a `LambdaRoute` ComponentResource. The point isn't code reuse — it's showing that Pulumi programs can use the same abstraction tools as any other TypeScript.
- **Backend as a container.** Swap the zip-based Lambda for a container image built from `services/backend/Dockerfile`, pushed to ECR, and referenced as `packageType: "Image"`. Same container could run on ECS or Kubernetes later.
- **S3 as the board store.** Swap DynamoDB for a single JSON object in S3 (`s3://.../board-state.json`). The backend service already reads/writes the whole board under one key, so the adapter is ~20 lines: `GetObject` on read, `PutObject` on write, 404 → seed. Interesting tradeoff: cheaper and simpler, but no conditional writes — concurrent updates can clobber each other unless you add `If-Match` on the ETag.

