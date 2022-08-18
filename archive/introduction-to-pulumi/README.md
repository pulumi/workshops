---
author: Lee B.
language: python,typescript
provider: docker
use: first-party
last-ran: unknown
boilerplate: something
last-host: unknown
learn-content: none
original-repo: https://github.com/pulumi/introduction-to-pulumi
status: unknown
---

# Introduction To Pulumi

This workshop guides you through your first Pulumi experience. You'll be learning some of the basics of how Pulumi works using the Pulumi [Docker Provider](https://www.pulumi.com/docs/intro/cloud-providers/docker/)

# Prerequisites

In order to complete the workshop, you'll need to have:
- The Pulumi CLI [installed](https://www.pulumi.com/docs/get-started/install/)
- The language interpreter for the [ programming language you're going to use with Pulumi](https://www.pulumi.com/docs/intro/languages/)
- Access to a Docker daemon, for example with [Docker for Desktop](https://www.docker.com/products/docker-desktop)
- A programming language IDE, such as [Visual Studio Code](https://code.visualstudio.com)

Due to wide matrix this creates across an intersection of languages and operating systems, we've also provided a prepared environment you can use using [GitPod](https://www.gitpod.io/)

*It's highly recommended to use the GitPod environment if at all possible*

## GitPod Instructions

1. Hit the button!

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/pulumi/introduction-to-pulumi)

2. Wait for GitPod to initialize. You'll then need to login to Pulumi: provide your Pulumi access token from [here](https://app.pulumi.com/settings/tokens)

3. Fork the repo. You can do this within GitPod by hitting View -> Find Command -> type `fork`

## Pre-Workshop verification

In a working environment, you should be able to:

- run `docker info` and have docker return information about your installed Docker daemon
- run `pulumi version` and have Pulumi return a valid version



