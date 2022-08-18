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
