---
author: David and Laura
language: yaml
provider: docker
use: first-party
last-ran: unknown
boilerplate: something
last-host: David
learn-content: https://www.pulumi.com/learn/pulumi-fundamentals/
original-repo: none
status: active
deck: Fundamentals_Agnostic
---

# IAC Fundamentals

For this workshop, we're going to learn more about cloud computing by exploring
how to use Pulumi to build, configure, and deploy a real-life, modern
application using Docker. We will create a frontend, a backend, and a database
to deploy the Pulumipus Boba Tea Shop. Along the way, we'll learn more about how
Pulumi works.

## Prerequisites

You will need the following tools to complete this tutorial:

- A [Pulumi account and token](https://www.pulumi.com/docs/intro/pulumi-service/accounts/#access-tokens)
  - If you don't have an account, go to the
    [signup page](https://app.pulumi.com/signup).
- [Docker](https://docs.docker.com/get-docker/)

As to skills, you should be able to

- use your local terminal.
- read and understand basic YAML syntax.
- read and understand Dockerfiles or understand basic Docker concepts.

## Sample app

The sample app we're building, the Pulumipus Boba Tea Shop, is a progressive web
application (PWA) built with MongoDB, ExpressJS, React, and NodeJS (the MERN
stack). It's a fairly common implementation found in eCommerce applications. We
have adapted this application from
[this repository](https://github.com/shubhambattoo/shopping-cart). The app
consists of a frontend client, a backend REST server to manage transactions, and
a MongoDB instance for storing product data.

## About this workshop

This workshop discusses using Pulumi to create infrastructure, configure that
infrastructure, and push your infrastructure to production.

For this workshop, we will use Docker to help you learn the basics of Pulumi
without a cloud account. We will explore creating a Pulumi Project, building
Docker images, and configuring and provisioning containers.

Let's [get started](lab-1/README.md)!
