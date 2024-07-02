---
author: David
language: typescript, python, go
provider: civo
use: first-party
last-ran: unknown
boilerplate: something
last-host: David
learn-content: https://www.pulumi.com/learn/abstraction-encapsulation/
original-repo: none
status: active
---

# Building Reusable Abstractions

This is a Pulumi workshop that aims to guide you through the process of using your programming language's, and Pulumi's, primitives to build reusable and sharable abstractions for infrastructure as code.

## Prerequisites

You will need the following:

* [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops).
* [Pulumi FREE SaaS Account](https://app.pulumi.com/signup/?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops)
  * Pulumi state storage is FREE for developers, you can use this account for all your personal Pulumi projects and you never need to worry about where to store your state 😃
* [Civo Cloud Account](https://www.civo.com/docs/account/signing-up)
  * Civo can provision K3s clusters in around 90 seconds, so we're going to use them for this workshop. You get 250USD FREE credit for new accounts, so it won't even cost you a thing.

## What will we learn?

If you're here reading this first README on a Pulumi workshop, then you're probably aware that good software is not a single file with thousands of lines of code. Much the same, good infrastructure as code isn't a single file with thousands, hundreds, or even dozens of lines of code.

Good infrastructure as code can be composed, reused, and shared.

This workshop will guide you through some best practices to ensure your infrastructure as code is as good as it can be.

## Disclaimers

1. There are no dotnet examples because I had a hard time getting dotnet to work on M1 macOS. I hope this changes soon and I'd love to add them as soon as I can.
