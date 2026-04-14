# Architecture Diagrams

Workshop-ready diagrams for the staged AWS story.

## Progression

![Progression](./progression.png)

## Stage 0: Local

![Stage 0 Local](./stage-0-local.png)

## Stage 1: Basic AWS

![Stage 1 Basic AWS](./stage-1-basic-aws.png)

## Stage 2: Private Backend

![Stage 2 Private Backend](./stage-2-private-backend.png)

## Stage 3: Events

![Stage 3 Events](./stage-3-events.png)

## Sequence Diagrams

### Webhook Flow

![Webhook Sequence](./sequence-webhook-flow.png)

External webhooks arrive at the public API, get queued in SQS, and are processed asynchronously by the worker Lambda.

### Card Movement

![Card Movement Sequence](./sequence-card-movement.png)

Card movements go through the BFF to the backend, which persists the change to DynamoDB.
