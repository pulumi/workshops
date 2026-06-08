# Stage 05 — GitOps (where you go next)

> **Take-home, not demoed live.** This stage is real, runnable code (verified on
> AKS), but in the talk we stop at Stage 04 and *point* here. Run it yourself to
> see the GitOps handoff.

By Stage 04 your cat app is plain Kubernetes YAML sitting in a repo. The natural
day-2 move is to stop running `pulumi up` for the workload by hand and let a
**GitOps controller watch the repo and reconcile it continuously**. The two big
tools:

- **Argo CD** — pull-based reconciliation, rich UI, app-of-apps pattern.
- **Flux** — pull-based reconciliation, Helm-native, lightweight controllers.

## What this stage actually does

`infra/` is one Pulumi program (C#) that:

1. Stands up the same AKS cluster as the earlier stages.
2. Creates an `argocd` namespace and installs **Argo CD** via its Helm chart
   (`Helm.V4.Chart`) — bringing the `Application` CRD with it.
3. Registers the cat as an Argo **`Application`** (`argo-cat-app.yaml`) pointing
   at a git path (`github.com/adamgordonbell/k8s-demo`, branch `yaml`,
   `workload/yaml`).

From there **Pulumi never touches the cat.** Argo pulls the manifests from git
and reconciles them. Changing the cat = `git push`, not `pulumi up`. The cat's
LoadBalancer IP is created by Argo, so get it with `kubectl get svc cat-service`,
not `pulumi stack output`.

```bash
cd infra && pulumi up
# wait for Argo to sync, then:
az aks get-credentials -g kube-kitties-rg -n kube-kitties -f /tmp/kc --overwrite-existing
KUBECONFIG=/tmp/kc kubectl get application cat -n argocd        # Synced / Healthy
KUBECONFIG=/tmp/kc kubectl get svc cat-service -n default       # grab EXTERNAL-IP
pulumi destroy
```

The `gitops/cat/` folder holds a self-contained copy of the cat manifests if you
want to point the Argo `Application` at *this* repo instead of `k8s-demo`.

The mature pattern is **Pulumi for the infrastructure + GitOps for the apps**:
Pulumi stands up the cluster *and bootstraps the GitOps engine*, then the
controller owns workload delivery from git. (Pulumi even has a Kubernetes
Operator that runs Pulumi programs GitOps-style off a Flux source.)

We don't build it here — it's a workshop of its own. See the worked **Flux**
example on GKE:

> **Engin Diri — *Getting Started with Kubernetes on Google Cloud***
> `pulumi/workshops/getting-started-with-kubernetes-google-cloud`
> Pulumi (TypeScript) builds a production-close GKE cluster and bootstraps Flux;
> Flux reconciles plain k8s YAML + a HelmRelease for the apps (including an
> AI agent on Vertex AI). Pulumi never touches the workloads.

That's the "production-close" sequel to this "getting-started" workshop.
