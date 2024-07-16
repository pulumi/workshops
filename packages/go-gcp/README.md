---
author: Ringo
language: Go & YAML
provider: gcp
use: first-party
last-ran: 3 Nov 2022
boilerplate: pulumi-component-provider-go-boilerplate
last-host: Ringo
learn-content: none
original-repo: none
status: active
---

# Pulumi Packages in Go - Example in GCP

We're going to build a Pulumi Package, with a component built for Go for Google Cloud Platform (GCP) and Google Kubernetes Engine (GKE). After that, we will demo consuming this component from a Pulumi YAML program.

## Prerequisites

You will need the following tools:

* [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
* [Pulumi FREE SaaS Account](https://app.pulumi.com/signup/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
  * Pulumi state storage is FREE for individuals, you can use this account for all your personal Pulumi projects and you never need to worry about where to store your state 😃
* [Go](https://www.pulumi.com/docs/intro/languages/go/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
* A [GCP Account](https://cloud.google.com/) - the free trial should cover everything in this workshop but any costs accrued will be minimal

## Workshop contents

The workshop is divided into three labs:

### Lab 1 - Component schema

In this lab we will define our components in the Pulumi Schema file. [View lab 1](./lab1)

### Lab 2 - Component implementation

In the second lab we will take our schema from the first lab and implement our component in Go. [View lab 2](./lab2)

### Lab 3 - Component consumption

In the final lab we will use our component in a Pulumi YAML program. [View lab 3](./lab3)

## Get started

Let's get started with [lab 1](./lab1).
