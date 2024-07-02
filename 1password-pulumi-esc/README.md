# Managing team secrets with 1Password & Pulumi ESC

Platform engineering teams need to be able to fetch secrets at runtime, especially when managing multi-cloud and multi-service deployments with Pulumi. In this workshop, we’ll show you how Pulumi ESC works with 1Password to ensure secrets are securely made available to approved team members and deployments.

## Goals

- How to store secrets in 1Password
- Configuring Pulumi ESC to work with 1Password and controlling access for approved team members
- Retrieving secrets automatically at runtime from your Infrastructure as Code deployments.

[link to event](https://www.pulumi.com/resources/managing-team-secrets-1password-pulumi-esc/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)

## Outline

- Intro to Pulumi ESC
- Intro to 1Password + Developer Tools
- Overview of Pulumi ESC + 1Password
- Demo 1
- Pulumi for Platform Teams
- Demo 2
- Other uses cases
- CTA
- Q&a

## Pre-reqs for the demo/s

- Google OAuth creds available
- Gemini API Key available
- DockerHub credentials
- Cloudflare account and configured domain
- 1Password account
- [Pulumi Cloud account](https://app.pulumi.com/signup/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)

- Go and Docker installed locally

## Demo 1 - Environment variables in a golang web app

- Partner shows creating vault, adding secrets, creating a service account
- Show configuring ESC Environment with 1Password provider, `pulumi-esc-dev`
- Show auditing and RBAC Pulumi tokens
- Show golang application working with external secrets without any code change

```bash
# use your business-critical org
pulumi org set-default pulumi-sandbox-diana
pulumi logout
pulumi login # provide the team access token

# verify env opens
esc env open pulumi-sandbox-diana/pulumi-esc-dev

cd solution/app
esc run pulumi-sandbox-diana/pulumi-esc-dev go run .

open http://localhost:8000/

# complete the google oaut, copy token from the terminal,
# paste in the field along with a phrase, buzz it
# ta da!
```

## Demo 2 - Multi-cloud deployment pipeline + GCP OIDC

- Show creating a new ESC env with inheritance and GCP OIDC dynamic credentials
- Show IaC Pulumi program with ESC configuration, `pulumi-esc-prod`
- Show pushing code on GH and GHA using the ESC Config to deploy the infra

```bash
# use your business-critical org
pulumi org set-default pulumi-sandbox-diana
pulumi logout
pulumi login # provide the team access token

cd solution/infra

esc open  pulumi-sandbox-diana/oidc-gcp
esc open  pulumi-sandbox-diana/pulumi-esc-prod
# Ensure all these are granted access by adding each to the service account subject

pulumi:environments:org:pulumi-sandbox-diana:env:pulumi-esc-prod
pulumi:environments:org:pulumi-sandbox-diana:env:oidc-gcp
pulumi:environments:org:pulumi-sandbox-diana:env:pulumi-esc-prod:<yaml>
pulumi:environments:org:pulumi-sandbox-diana:env:oidc-gcp:<yaml>
pulumi:environments:org:pulumi-sandbox-diana:env:<yaml>
pulumi:deploy:org:pulumi-sandbox-diana:project:buzz:stack:prod:operation:preview:scope:write
pulumi:deploy:org:pulumi-sandbox-diana:project:buzz:stack:prod:operation:update:scope:write
pulumi:deploy:org:pulumi-sandbox-diana:project:buzz:stack:prod:operation:refresh:scope:write
pulumi:deploy:org:pulumi-sandbox-diana:project:buzz:stack:prod:operation:destroy:scope:write

pulumi stack init pulumi-sandbox-diana/buzz/prod
pulumi stack select pulumi-sandbox-diana/buzz/prod

```

## SetUp

```plain
1P

dev-vault
- Google OAuth 2.0 App creds
- Google Gemini API Key
- 1P Service Account to read self-vault
- Pulumi Cloud-scoped team token

test-vault
- Dockerhub creds
- Cloudflare API Token
- 1P Service Account to read self-vault
- Pulumi Cloud-scoped team token

ESC

pulumi-esc-dev
- 1Pass integration for dev-vault

oidc-gcp
- GCP OIDC config

pulumi-esc-prod
- inherit pulumi-esc-dev
- inherit oidc-gcp
- 1Pass integration for test-vault

```

## Future Work (research required)

- Use Github Provider to create the repo w/ the Pulumi Cloud secret
- Use the 1Password Provider (if/when GAs) to store the 1Password creds and create appropiate Service Accounts
- Use a Dedicated Pulumi Cloud org and GCP Project
- Create OAuth 2.0 Client ID + OAuth consent screen + OIDC GCP using a Pulumi Program with the Google Cloud provider
