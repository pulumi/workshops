---
author: Laura
language: csharp
provider: docker
use: first-party
last-ran: none
boilerplate: something
last-host: none
learn-content: https://www.pulumi.com/learn/pulumi-fundamentals/
original-repo: none
status: active
deck: Fundamentals_Agnostic
---

# Pulumi Fundamentals

For this workshop, we're going to learn more about cloud computing by exploring how to use Pulumi to build, configure, and deploy a real-life, modern application using Docker. We will create a frontend, a backend, and a database to deploy the Pulumipus Boba Tea Shop. Along the way, we'll learn more about how Pulumi works.

## Goals

* Build your first infrastructure with Pulumi
* Learn fundamental Infrastructure as Code concepts
* Learn fundamental Pulumi concepts

## Equipment, Tools, and Knowledge

You will need the following tools to complete this workshop:

* A [Pulumi account and token](https://www.pulumi.com/docs/intro/pulumi-service/accounts/#access-tokens?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=github-fundamentals)
    * If you don't have an account, go to the [signup page](https://app.pulumi.com/signup?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=github-fundamentals).
* The [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=github-fundamentals)
* [Docker](https://docs.docker.com/get-docker/)
* The [.NET SDK](https://dotnet.microsoft.com/download), which needs to be available on your path after installation.

You'll need to know how to

- use your local terminal.
- read and understand basic C#/.NET code.
- read and understand Dockerfiles or understand basic Docker concepts.

## Sample app

The sample app we're building, the Pulumipus Boba Tea Shop, is a progressive web application (PWA) built with MongoDB, ExpressJS, React, and NodeJS (the MERN stack). It's a fairly common implementation found in eCommerce applications. We have adapted this application from [this repository](https://github.com/shubhambattoo/shopping-cart). The app consists of a frontend client, a backend REST server to manage transactions, and a MongoDB instance for storing product data.

## About this workshop

This workshop discusses using Pulumi to create infrastructure, configure that infrastructure, and push your infrastructure to production.

For this workshop, we will use Docker to help you learn the basics of Pulumi without a cloud account. We will explore creating a Pulumi Project, building Docker images, and configuring and provisioning containers.

The workshop is modified from [the relevant Learn pathway](https://www.pulumi.com/learn/pulumi-fundamentals/).

Let's get started!