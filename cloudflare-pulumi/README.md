# GitOps in Action: Deploy a Serverless AI app with Cloudflare

## Goals

- Build a Serverless AI app with Cloudflare Workers
- Develop Infrastructure as Code with Pulumi in TypeScript
- Implement GitOps best practices

Given the final solution uses GitHub Actions, the code resides in a separate repository, [GitHub repo with the code](https://github.com/desteves/pulumi-cloudflare-workers-ai).

## Outline

- GitOps Intro
- Pulumi + Cloudflare for the win
- 🎬 Cloudflare Workers AI Demo
  - **Demo 1** App in Action
  - **Demo 2** Using Wrangler
  - **Demo 3** Scaling with Pulumi
- Summary

## Pre-reqs for the demo/s

- Pulumi Cloud account
- GitHub account
- Cloudflare + a registered domain
- Wrangler CLI
- Pulumi CLI
- Git+GitHub CLI
- npm

## **Demo 1** App in Action

### **Demo 1**: Overview

The goal is to become familiar with the running app and understand the various features of it.

### **Demo 1**: Presenter Prep

Deploy the `-demo` app. Follow the [GitHub repo with the code](https://github.com/desteves/pulumi-cloudflare-workers-ai) to deploy the `test` stack under `/infra/`. Note, that a Pulumi ESC environment is also required.

Example of the `Environment`:

```yaml
values:
  environmentVariables:
    CLOUDFLARE_ACCOUNT_ID: 123
    CLOUDFLARE_API_TOKEN:
      fn::secret:
        ciphertext: ZXN...
    # This API token will affect the below accounts and zones, 
    # along with their respective permissions
    # pulumi - AI Gateway:Read
    CLOUDFLARE_API_TOKEN_FOR_AI:
      fn::secret:
        ciphertext: ZXNj...
  pulumiConfig:
    cloudflare:apiToken: ${environmentVariables.CLOUDFLARE_API_TOKEN}
    cloudflare-workers-ai:accountId: ${environmentVariables.CLOUDFLARE_ACCOUNT_ID}
    cloudflare-workers-ai:zoneId: 123
    cloudflare-workers-ai:domain: example.com
    cloudflare-workers-ai:AI_MODEL_SECRET_KEY: Bearer ${environmentVariables.CLOUDFLARE_API_TOKEN_FOR_AI}
```

### **Demo 1**: Live Commands

For this part, the live part involves opening the browser and showing the `-demo` version of the app running. Do a couple of refreshes and explain the various components needed to make the app run.

## **Demo 2** Using Wrangler

### **Demo 2**: Overview

Understand how to get started with developing a Worker using Wrangler.

### **Demo 2**: Presenter Prep

N/A.

### **Demo 2**: Live Commands

Co-presenter demonstrates a hello-world application using Wrangler commands.

## **Demo 3** Scaling with Pulumi

### **Demo 3**: Overview

Incrementally test a Serverless App by defining Cloudflare resources in Pulumi Typescript. Once ready, add GitHub Actions to automatically deploy to production.

### **Demo 3**: Presenter Prep

The prod version should already be deployed as it can take a bit of time to create 2400+ KV entries.

You'll go through the steps of creating a simple Pulumi program, then switch and explain the test version, one worker at a time.

### **Demo 3**: Live Commands

```bash
mkdir infra-live
cd infra-live
pulumi new typescript
npm install -g npm-check-updates && ncu -u && npm install
npm install @pulumi/cloudflare
```

```typescript
import * as cloudflare from "@pulumi/cloudflare";

const resourceName = "quote-live";

const config = new pulumi.Config();
const accountId = config.require("accountId");
const zoneId = config.require("zoneId");
const domain = config.require("domain");
```

- Create definitions for needed variables in Pulumi ESC as `pulumi-cloudflare-workers-ai-live`

```yaml
values:
  environmentVariables:
    CLOUDFLARE_ACCOUNT_ID: 123
    CLOUDFLARE_API_TOKEN:
      fn::secret:
        ciphertext: ZXNj...
  pulumiConfig:
    cloudflare:apiToken: ${environmentVariables.CLOUDFLARE_API_TOKEN}
    accountId: ${environmentVariables.CLOUDFLARE_ACCOUNT_ID}
    zoneId: 123
    domain: atxyall.com

```

```bash
E=pulumi-cloudflare-workers-ai-live
pulumi config env add $E --stack dev --yes 
pulumi up
```

- Create a new Cloudflare DNS record

```ts
const record = new cloudflare.Record(resourceName, {
  zoneId: zoneId,
  name: resourceName + "." + domain,
  value: "192.0.2.1",
  type: "A",
  proxied: true
});

// Export the URL as an Output for convenience
export const url = pulumi.interpolate`https://${record.name}`
```

```bash
pulumi up 
```

- Show the DNS record in the Cloudflare dashboard

```bash
pulumi destroy
```

- Show the DNS record is longer in the Cloudflare dashboard

- Switch over and walked through the `/infra/index.ts` file
- Show the `-db` endpoint
- Show the `-ai` endpoint with a prompt
- Show brinding it all together with the `-demo`

Add GitHub Actions to deploy our infra on our behalf.

- Go over the `branch.yml` and `main.yml` actions.
- Open a PR and make a commit to trigger the pipeline.
- Merge the PR to trigger the `up` action.
