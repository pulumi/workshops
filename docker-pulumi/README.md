# Automate Image Builds using Pulumi and Docker Build Cloud

In this workshop, you will learn how to automate your Docker build process by leveraging the Pulumi Docker Build provider and Docker Build Cloud. You will use TypeScript to define your infrastructure as code (IaC), including the configuration of Docker builds. Additionally, you will set up a Docker Build Cloud to use external caching to reduce the time required for builds significantly.

## Goals

- Configure a Docker Build Cloud (DBC) builder
- Create a Pulumi program in TypeScript to define IaC
- Build NGINX Dockerfile in Pulumi and DBC
- Configure a CI pipeline to Docker build on *every* commit

[Registration Link](https://www.pulumi.com/resources/automating-docker-image-builds-using-pulumi/)

## Outline

- Intro to Pulumi + Docker
- Pulumi Docker Build provier
- Docker Build Cloud
- **Demo 1**: Build NGINX
- **Demo 2**: CI Build on every commit
- Q&A

## Pre-reqs for the demo/s

- Docker Build Cloud account
- Pulumi Cloud account
- GitHub account
- Docker Desktop, Pulumi CLI, and Git+GitHub CLI installed locally

## **Demo 1**: Build NGINX

### Overview

- Partner presenter shows creating and configuring a Docker Build Cloud builder
- Show creating a Pulumi program from a Pulumi template
- Show adding an ESC Environment w/ all the Docker creds + configs
- Show running the program

### Commands

- Ensure you have a [Docker Personal Access Token (PAT)](https://docs.docker.com/security/for-developers/access-tokens/)

```bash
# use your business-critical org
docker login
pulumi login 
# Ensure to use 'dev' as your Stack name
pulumi new https://github.com/pulumi/examples/tree/master/dockerbuildcloud-ts --dir hello-dbc

cd hello-dbc

#optional, update packages
npm install -g npm-check-updates
ncu -u
npm install


# build nginx
pulumi up

# ta da!
```

## **Demo 2**: CI Build on every commit

### Overview

- Show creating a Pulumi program from a Pulumi template
- Show IaC Pulumi program with ESC configuration
- Show adding Pulumi Deployments settings
- Show pushing code on GH and Pulumi Deployments to build the image on DBC
- Show adding multi-platform and re-run

### Commands

```bash
# use your business-critical org

# fork the repo to your gh, then
gh repo clone <YOUR_GH_USERNAME>/jan-fork jan-fork
cd jan-fork
pulumi new https://github.com/pulumi/examples/tree/master/dockerbuildcloud-ts --dir infra

## complete the prompts:
# project name: jan-fork
# stack name: dev
# builder: cloud-nullstring-my-cool-builder

cd infra

#optional, update packages
npm install -g npm-check-updates
ncu -u
npm install

# remotely managed settings
E=jan-dev
pulumi env init $E
pulumi env set  $E pulumiConfig.DOCKER_USR abs123
# # https://github.com/pulumi/esc/issues/340
pulumi env set  $E pulumiConfig.DOCKER_PAT --secret s3cr3t

# link the stack to your config environment
# pulumi stack init dev --non-interactive
pulumi config env add $E --stack dev --yes --non-interactive

## modify :
# - delete infra/app folder
# - update the tags to "jan:latest"
# - update context / location  to "../"

gh repo set-default # use your fork'ed repo
git add . && git commit -m "wip"
git checkout -b pulumi+dbc
gh pr create --title "pulumi+dbc " --body "" --draft

# CONFIGURE PULUMI DEPLOYMENTS VIA THE BROWSER, THEN:
# - configure Pulumi GH App to have access to our forked repo
#   - Settings -> Integrations -> Pulumi GitHub App -> Configure repository access
# - add deployments to your jan-fork/dev stack
#  - Stacks -> jan-fork/dev -> Settings -> Deploy
#   - Source Control: GitHub
#   - Repo: desteves/jan-fork 
#   - Branch: pulumi+dbc
#   - Folder: infra
#   - GH Settings: ALL ON
#   - Pre-run commands (COPY FROM BELOW)
#   - "Save deployment configuration"
```

Pre-run commands:

```bash
mkdir -vp ~/.docker/cli-plugins/
curl --silent -L --output ~/.docker/cli-plugins/docker-buildx https://github.com/docker/buildx-desktop/releases/download/v0.14.1-desktop.1/buildx-v0.14.1-desktop.1.linux-amd64
chmod a+x ~/.docker/cli-plugins/docker-buildx
pulumi login && pulumi env run  pulumi-sandbox-diana/jan-dev   -- bash -c 'echo "$DOCKER_PAT" | docker login -u $DOCKER_USR --password-stdin'
docker buildx create --use --driver cloud "nullstring/my-cool-builder"
```

```bash

git add . && git commit --allow-empty -m "noop" && git push -f

# ta-da!

```

- Add push to DockerHub registry details
- Add multi-platform

## Future Work (research required)

- tbd
