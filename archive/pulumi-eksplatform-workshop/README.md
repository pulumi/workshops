---
author: Lee B.
language: typescript
provider: kubernetes, digital-ocean, aws
use: first-party
last-ran: unknown
boilerplate: something
last-host: unknown
learn-content: none
original-repo: https://github.com/jaxxstorm/pulumi-component-workshop
status: unknown
---
# Pulumi EKS Workshop

This workshop will guide you through the process of deploying an application to Kubernetes using Pulumi with TypeScript.

You'll first provision an application using Pulumi's TypeScript SDK to a Kubernetes cluster.

Next, you'll refactor that Pulumi program into a reusable component using Pulumi's [Component Resource](https://www.pulumi.com/docs/intro/concepts/resources/#components) mechanism.

The workshop is designed to be run from within GitPod. Hit the button below to open the repo in GitPod.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/jaxxstorm/pulumi-eksplatform-workshop)


#### 🌏  Optional: Other Cloud IDEs

Click any of the buttons below to start a new development environment to demo or contribute to the codebase without having to install anything on your machine:

[![Open in VS Code](https://img.shields.io/badge/Open%20in-VS%20Code-blue?logo=visualstudiocode)](https://vscode.dev/github/jaxxstorm/pulumi-eksplatform-workshop)
[![Open in Glitch](https://img.shields.io/badge/Open%20in-Glitch-blue?logo=glitch)](https://glitch.com/edit/#!/import/github/jaxxstorm/pulumi-eksplatform-workshop)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/jaxxstorm/pulumi-eksplatform-workshop)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/jaxxstorm/pulumi-eksplatform-workshop)
[![Edit in Codesandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/jaxxstorm/pulumi-eksplatform-workshop)
[![Open in Repl.it](https://replit.com/badge/github/withastro/astro)](https://replit.com/github/jaxxstorm/pulumi-eksplatform-workshop)
[![Open in Codeanywhere](https://codeanywhere.com/img/open-in-codeanywhere-btn.svg)](https://app.codeanywhere.com/#https://github.com/jaxxstorm/pulumi-eksplatform-workshop)

## Prerequisites

Before you start with this workshop, you'll need to have the Pulumi CLI installed and be logged into the Pulumi SaaS backend to store your state.

### Pulumi Login

Once the GitPod environment has initialized, you'll need to provide a Pulumi token. You can retrieve a token from [here](https://app.pulumi.com/settings/tokens)

### Kubernetes

You'll also need an EKS Kubernetes cluster provisioned and running. The Kubernetes cluster must be capable of provisioning a service with `Type=LoadBalancer`.

You can check you have everything you need using `kubectl`:

```bash
kubectl cluster-info
Kubernetes control plane is running at https://f9a621c9-8f87-46ce-856d-662add25434a.k8s.ondigitalocean.com
CoreDNS is running at https://f9a621c9-8f87-46ce-856d-662add25434a.k8s.ondigitalocean.com/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
```

If you're following this tutorial in a live Pulumi Workshop event, a cluster will be provided to you.
If you need to provision a cluster, Pulumi code to do so on digital ocean can be found in the [infra folder](./infra).
