# Managing team secrets with 1Password & Pulumi ESC

Platform engineering teams need to be able to fetch secrets at runtime, especially when managing multi-cloud and multi-service deployments. In this workshop, we’ll show you how Pulumi ESC works with 1Password to ensure secrets are securely made available to approved team members and deployments.

## Goals

- How to store secrets in 1Password
- Configuring Pulumi ESC to work with 1Password and controlling access for approved team members
- Retrieving secrets automatically at runtime from your Infrastructure as Code deployments.

## Pre-reqs

- Google OAuth creds available
- Gemini API Key available
- DockerHub credentials
- Cloudflare account and configured domain
- 1Password account
- Go and Docker installed locally
- Log into your [Pulumi Cloud account](https://app.pulumi.com/signup/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)

  ```bash
  pulumi login
  pulumi org set-default pulumi-sandbox-diana 
  ```

- Clone the [buzz application locally](https://github.com/desteves/buzz/tree/main)
  
  ```bash
  gh repo clone desteves/buzz
  ```

- Configure [GCP OIDC](https://www.pulumi.com/docs/pulumi-cloud/access-management/oidc/provider/gcp/). Example of the ESC Environment, `auth/gcp`:

  ```yaml
  values:
    gcp:
      login:
        fn::open::gcp-login:
          project: 5631433690
          oidc:
            workloadPoolId: prod-pool
            providerId: pulumi-cloud-oidc
            serviceAccount: pulumi-cloud@pulumi-workshops-project.iam.gserviceaccount.com
    environmentVariables:
      GOOGLE_PROJECT: ${gcp.login.project}
      CLOUDSDK_AUTH_ACCESS_TOKEN: ${gcp.login.accessToken}
      GOOGLE_REGION: us-central1
      PULUMI_GCP_SKIP_REGION_VALIDATION: true
    pulumiConfig:
      gcp:accessToken: ${gcp.login.accessToken}
      gcp:region: us-central1
      gcp:project: pulumi-workshops-project
  ```

- Have [GitHub <-> Pulumi Cloud OIDC configured](https://www.pulumi.com/docs/pulumi-cloud/access-management/oidc/client/github/) for a secretless CICD pipeline
- Have the 1Password vaults created and configured beforehand.

  ```text
    buzz-app
    - Google OAuth 2.0 App creds
    - Google Gemini API Key
    - 1P Service Account to read self-vault
    - Pulumi Cloud-scoped team token

    buzz-infra
    - Dockerhub creds
    - Cloudflare API Token
    - 1P Service Account to read self-vault
    - Pulumi Cloud-scoped team token
  ```

## Demo 1 - Environment variables

- Partner shows creating vault, adding secrets, creating a service account. [(Click to view a screenshot with a sample vault)](image-1.png).
- Show configuring ESC Environment with 1Password provider. Example,

  ```yaml
  values:
    1password:
      secrets:
        fn::open::1password-secrets:
          login:
            serviceAccountToken:
              fn::secret:
                ciphertext: ZXNje...
          get:
            google_oauth_client_id:
              ref: "op://buzz-app/google-oauth/username"
            google_oauth_client_secret:
              ref: "op://buzz-app/google-oauth/credential"
            gemini:
              ref: "op://buzz-app/google-gemini/credential"
    environmentVariables:
      GOOGLE_OAUTH_CLIENT_ID: ${1password.secrets.google_oauth_client_id}
      GOOGLE_OAUTH_CLIENT_SECRET: ${1password.secrets.google_oauth_client_secret}
      GEMINI_API_KEY: ${1password.secrets.gemini}
      SERVER_ADDR: "localhost:8000"
  ```

- Show auditing and [RBAC Pulumi tokens (click to open screenshot)](image.png)
- Show [golang application code](https://github.com/desteves/buzz/blob/main/app/oauth/google.go#L44) requiring environment variables
- Run buzz locally sans variables, expected to fail.
  ```bash
  # from the buzz code repo
  cd app/
  go run .
  ```
- Re-run the buzz application with ESC-loaded env vars.

  ```bash
  ENV_NAME=buzz/app
  esc run $ENV_NAME go run .
  ```

## Demo 2 - Multi-cloud secrets in CI/CD

- Partner presenter configures the infra vault.
- Show creating a new ESC env with inheritance and GCP OIDC dynamic credentials. Example, `buzz/deploy`: 
  
  ```yaml
  imports:
  - buzz/app
  - buzz/build
  - auth/gcp
  values:
    1password:
      secrets:
        fn::open::1password-secrets:
          login:
            # prod-vault-read-service-account
            serviceAccountToken:
              fn::secret:
                ciphertext: ZXNj..
          get:
            cloudflare_token:
              ref: "op://buzz-infra/cloudflare/credential"
            cloudflare_zone:
              ref: "op://buzz-infra/cloudflare/zone"
            cloudflare_domain:
              ref: "op://buzz-infra/cloudflare/username"
    environmentVariables:
      CLOUDFLARE_API_TOKEN: ${1password.secrets.cloudflare_token}
      CLOUDFLARE_ZONE: ${1password.secrets.cloudflare_zone}
      CLOUDFLARE_DOMAIN: ${1password.secrets.cloudflare_domain}
      # container is listening on all network interfaces
      # commonly denoted as 0.0.0.0.
      SERVER_ADDR: 0.0.0.0:8000
    pulumiConfig:
      cloudflare:apiToken: ${environmentVariables.CLOUDFLARE_API_TOKEN}
  ```

  <details>
  <summary>Click here to see the contents of the `buzz/build` ESC Env</summary>

    ```yaml
    values:
      1password:
        secrets:
          fn::open::1password-secrets:
            login:
              serviceAccountToken:
                fn::secret:
                  ciphertext: ZXNj...
            get:
              docker_usr:
                ref: "op://buzz-infra/docker/username"
              docker_pat:
                ref: "op://buzz-infra/docker/credential"
      environmentVariables:
        DOCKER_PAT: ${1password.secrets.docker_pat}
        DOCKER_USR: ${1password.secrets.docker_usr}
    ```

  </details>

- Show [Pulumi IaC stack with ESC configuration](https://github.com/desteves/buzz/blob/main/infra/Pulumi.prod.yaml#L1):

  ```bash
  cd infra
  pulumi preview --stack prod
  ```

- Run the [GitHub Action `main` workflow](https://github.com/desteves/buzz/actions/workflows/main.yml) to deploy the application.
- Show the [contents of the `main` workflow](https://github.com/desteves/buzz/blob/main/.github/workflows/main.yml).

## Future Work

- Use the Github Provider
- Use the 1Password Provider
- Use the Google Cloud provider
- Use a Dedicated Pulumi Cloud org and GCP Project 