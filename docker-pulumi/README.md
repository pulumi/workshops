# Automate Image Builds using Pulumi and Docker Build Cloud

In this workshop, you will learn how to automate your Docker build process by leveraging the Pulumi Docker Build provider and Docker Build Cloud. You will use TypeScript to define your infrastructure as code (IaC), including the configuration of Docker builds. Additionally, you will set up a Docker Build Cloud to use external caching to reduce the time required for builds significantly.

## Goals

- Configure a Docker Build Cloud (DBC) builder
- Create a Pulumi program in TypeScript to define IaC
- Build NGINX Dockerfile in Pulumi and DBC
- Configure a CI pipeline to Docker build on *every* commit

[Registration Link](https://www.pulumi.com/resources/automating-docker-image-builds-using-pulumi/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)

## Outline

- Intro to Pulumi + Docker
- Pulumi Docker Build provier
- Docker Build Cloud
- **Demo 1**: Build NGINX
- **Demo 2**: CI Build on every commit
- Q&A

## Pre-reqs for the demo/s

- Docker Build Cloud account (Presenter should have access to the `pulumidockerdemo` Org)
- Pulumi Cloud account
- GitHub account
- Docker Desktop, Pulumi CLI, and Git+GitHub CLI installed locally

## **Demo 1**: Build NGINX

### **Demo 1**: Overview

- Partner presenter shows creating and configuring a Docker Build Cloud builder
- Show creating a Pulumi program from a Pulumi template
- Show adding an ESC Environment w/ all the Docker creds + configs
- Show running the program

### **Demo 1**: Presenter Prep

- Ensure you have a [Docker Personal Access Token (PAT)](https://docs.docker.com/security/for-developers/access-tokens/)

  ```bash
  docker login
  docker buildx create --driver cloud pulumidockerdemo/my-cool-builder

  pulumi login
  ```

- Pulumi ESC Environment, `aws-dbc-env-done`. Update all the values as necessary.

  ```yaml
  imports:
  - aws-oidc-env  # AWS OIDC Creds
  values:
    pulumiConfig:
      DOCKER_USR: nullstring
      DOCKER_PAT:
        fn::secret: dckr_pat_123
      DOCKER_DBC_ORG: "pulumidockerdemo"
      DOCKER_DBC_BUILDER_NAME: "my-cool-builder"
  ```

- Have the AWS Fargate template version already deployed to illustrate a more advanced version of the NGINX demo.

  ```bash
  pulumi new  https://github.com/pulumi/examples/tree/master/aws-ts-containers-dockerbuildcloud --dir aws-dbc-done
  cd aws-dbc-done
  npm install -g npm-check-updates && ncu -u && npm install
  pulumi config env add aws-dbc-env-done --yes --non-interactive
  pulumi up --yes
  curl $(pulumi stack output url)
  ```

### **Demo 1**: Live Commands

- Explain the Pulumi program, resources, and Docker Build options

  ```bash
  # Ensure to use 'dev' as your Stack name
  $ pulumi new https://github.com/pulumi/examples/tree/master/dockerbuildcloud-ts --dir hello-dbc
  # ✅ project name : hello-dbc
  # ✅ project description: <default>
  # ✅ stack name: dev
  $ ✅ builder: cloud-pulumidockerdemo-my-cool-builder

  # wait for the deps to be installed
  $ cd hello-dbc
  $ npm install -g npm-check-updates && ncu -u && npm install

  # build nginx
  $ pulumi up --yes --stack dev
  # 🎉 ta da!
  ```

- Show output and usage of DBC (in Docker Desktop)
- Switch to the prepared Fargate demo and go over the newly defined AWS Resources and Docker Build Image resource options.
- Take any Q&A

## **Demo 2**: CI Build on every commit

### **Demo 2**: Overview

- Partner presenter discusses Docker Build Cloud CI options
- Show creating a Pulumi program from a Pulumi template
- Show IaC with ESC configuration
- Show adding Pulumi Deployments settings
- Show pushing code on GH and Pulumi Deployments to build the image on DBC
- Partner presenter adds a multi-platform and re-runs (can do it directly in the GitHub browser)
- Partner presenter shows DBC logs on Docker Desktop
- Take any Q&A

### **Demo 2**: Presenter Prep

- Create ESC Environment `docker-dev` to match:

  ```yaml
  values:
    pulumiConfig:
      DOCKER_PAT:
        fn::secret: dckr_pat_ABC123
      DOCKER_DBC_ORG: "pulumidockerdemo"
      DOCKER_DBC_BUILDER_NAME: "my-cool-builder"
      DOCKER_TAG: "madlib-chatbot:latest"
      DOCKER_USR: "nullstring"
      DOCKERFILE_REPO: "http://github.com/mikesir87/madlib-chatbot.git"
    environmentVariables:
      DOCKER_PAT: ${pulumiConfig.DOCKER_PAT}
      DOCKER_USR: ${pulumiConfig.DOCKER_USR}
      DOCKER_DBC_ENDPOINT: "${pulumiConfig.DOCKER_DBC_ORG}/${pulumiConfig.DOCKER_DBC_BUILDER_NAME}"
      DOCKER_DBC_BUILDER_INSTANCE: "cloud-${pulumiConfig.DOCKER_DBC_ORG}-${pulumiConfig.DOCKER_DBC_BUILDER_NAME}"
  ```

- Prepare a PR

  ```bash
  git checkout -b test
  git commit --allow-empty -m "noop"
  gh pr create --title "test" --body "" --draft
  git push -f
  ```

- Configure Pulumi GH App to have access to the forked repo

  ```plain
  Settings ->
  Integrations ->
  Pulumi GitHub App ->
  Configure repository access
  ```

### **Demo 2**: Live Commands

- Start from a Pulumi template

  ```bash
  # ✅ ensure you are in a new empty folder
  pulumi new https://github.com/desteves/pulumi-docker/tree/main/template
  ## complete the prompts:
  # ✅ project name: ci-demo
  # ✅ stack name: live

  npm install -g npm-check-updates && ncu -u && npm install

  # remotely managed settings already configured in Pulumi ESC
  pulumi config env add docker-env --stack live --yes --non-interactive
  

  # ✅ CONFIGURE PULUMI DEPLOYMENTS VIA THE BROWSER:
  # ✅ Add deployments to your pulumi-docker/live stack
  #  - Stacks -> pulumi-docker/live -> Settings -> Deploy
  #   - Source Control: GitHub
  #   - Repo: desteves/pulumi-docker
  #   - Branch: live
  #   - Folder: example
  #   - GH Settings: ALL ON
  #   - Pre-run commands (COPY FROM BELOW)
  #   - "Save deployment configuration"
  ```

- Explain these are copied from the Docker Build Cloud [CI docs](https://docs.docker.com/build/cloud/ci/)
- Pre-run commands:

  ```bash
  mkdir -vp ~/.docker/cli-plugins/
  curl --silent -L --output ~/.docker/cli-plugins/docker-buildx https://github.com/docker/buildx-desktop/releases/download/v0.14.1-desktop.1/buildx-v0.14.1-desktop.1.linux-amd64
  chmod a+x ~/.docker/cli-plugins/docker-buildx
  pulumi login && pulumi env run  pulumi-sandbox-diana/docker-env   -- bash -c 'echo "$DOCKER_PAT" | docker login -u $DOCKER_USR --password-stdin'
  docker buildx create --use --driver cloud $DOCKER_DBC_ENDPOINT
  ```

- Trigger the Review Stacks

  ```bash
  $ git add . && git commit --allow-empty -m "noop" && git push -f
  # 🎉 ta-da!
  ```

Additional functionality to showcase:

<details>
  <summary>✅ Add multi-platform</summary>

```typescript
TODO
```

</details>

<details>
  <summary>✅ Add push to DockerHub registry details</summary>

```typescript
TODO
```

</details>

## Future Work (research required)

- Use ESC Environments `files` section to store the pre-run command script
