---
author: Lee B.
language: python
provider: kubernetes
use: first-party
last-ran: unknown
boilerplate: something
last-host: unknown
learn-content: none
original-repo: https://github.com/jaxxstorm/pulumi-automationapi-workshop
status: unknown
---
# Pulumi Automation API Workshop

This workshop will guide you through the process of building an small web application that allows you to deploy to Kubernetes using Pulumi's Automation API.

You'll first provision an application to a Kubernetes cluster using Pulumi's [Component Resource](https://www.pulumi.com/docs/intro/concepts/resources/#components) mechanism.

Once you're familiar with the Pulumi CLI, you'll build a web application that allows you to run the Pulumi code via a web interface.

The workshop is designed to be run from within GitPod. Hit the button below to open the repo in GitPod.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/jaxxstorm/pulumi-automationapi-workshop)

## Prerequisites

Before you start with this workshop, you'll need to have the Pulumi CLI installed and be logged into the Pulumi SaaS backend to store your state.

### Pulumi Login

Once the GitPod environment has initialized, you'll need to provide a Pulumi token. You can retrieve a token from [here](https://app.pulumi.com/settings/tokens)

### Kubernetes

You'll also need a Kubernetes cluster provisioned and running. The Kubernetes cluster must be capable of provisioning a service with `Type=LoadBalancer`.

You can check you have everything you need using `kubectl`:

```bash
kubectl cluster-info
Kubernetes control plane is running at https://f9a621c9-8f87-46ce-856d-662add25434a.k8s.ondigitalocean.com
CoreDNS is running at https://f9a621c9-8f87-46ce-856d-662add25434a.k8s.ondigitalocean.com/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
```

If you're following this tutorial in a live Pulumi Workshop event, a cluster will be provided to you.
If you need to provision a cluster, Pulumi code to do so on digital ocean can be found in the [infra folder](./infra).

# Acknowledgements

This workshop takes a lot of inspiration and has lifted code directly from [Komal Ali's](https://github.com/komalali/) [self service platyform](https://github.com/komalali/self-service-platyform).


