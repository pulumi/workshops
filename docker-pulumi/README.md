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

# remotely managed settings
E=hello-dbc-env
pulumi env init $E
pulumi env set  $E pulumiConfig.DOCKER_USR abs123
# https://github.com/pulumi/esc/issues/340
pulumi env set  $E pulumiConfig.DOCKER_PAT --secret s3cr3t

# link the stack to your config environment
pulumi stack init dev --non-interactive
pulumi config env add $E --stack dev --yes --non-interactive

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


```

## Future Work (research required)

- tbd
