# Getting Started with AKS — Demo Script 🐱

The live walkthrough — **one continuous build**. Start from an empty
`kube-kitties/` folder (the name matters — see §1) and evolve the same code
through every stage: a single program (cluster
+ cat), then split it into two stacks, then swap the workload to raw YAML. The
numbered stage folders (`01-cluster/` … `05-gitops/`) are the matching
end-state checkpoints if you need to reset.

> **Key trick for the split (Stage 3):** we keep the cluster's *project name*
> unchanged when we move its code, so Pulumi sees the **same stack** — the AKS
> cluster is never recreated mid-demo, only the cat app moves out into its own
> stack.

You'll deploy:
- An **AKS** cluster (Azure CNI Powered by Cilium) with Pulumi (C#)
- An **Azure Container Registry**, with the image imported server-side and the
  cluster's `AcrPull` permission wired in code
- A silly **random-cat** web app, exposed on a public LoadBalancer — no `kubectl apply`

**What AKS gives you on top of vanilla k8s** (the wait-filler talking points):

| Feature | What it is | In this demo? |
|---|---|---|
| **Cilium dataplane** | eBPF networking — replaces kube-proxy/iptables; in-kernel NetworkPolicy + Hubble flow visibility. **One config line** (`NetworkDataplane = "cilium"`). Same tech as GKE's Dataplane V2. | ✅ Stage 1 (opt-in — not the AKS default) |
| **ACR + AcrPull** | Registry and cluster are both Azure resources; Pulumi grants the cluster's kubelet identity `AcrPull` **in code** — no image-pull secrets. Image imported server-side (`az acr import`), no local Docker. | ✅ Stage 1–2 |
| **Entra ID RBAC** | Cluster auth via your existing Azure identities (not cluster certs); Azure RBAC roles map to Kubernetes access, per-team/namespace, centrally audited. | Mention (opt-in) |
| **Workload Identity** | Pods get Azure access tokens via federated identity — reach Key Vault / Storage / etc. with **no secrets**. The path the AI-agent sequel builds on. | Mention (where you go next) |
| **Managed add-ons** | KEDA (event autoscaling), service mesh, Key Vault CSI, monitoring (`az aks addon list-available`) | Mention (opt-in) |
| **Managed control plane** | Azure runs/upgrades the control plane + cluster/node autoscaling | Always on |

> Cilium one-liner: *self-hosted you'd `helm install cilium … --set kubeProxyReplacement=true` and own its lifecycle; on AKS it's one field and Azure runs it.*

**Estimated time**: 60 minutes. **Cluster create is ~5 min** — start it, keep talking.

## Prerequisites

```
- Pulumi CLI + .NET 8 SDK
- Azure CLI, logged in (az login) with rights to create AKS + ACR
- Basic Kubernetes literacy (pod / deployment / service)
- k9s (optional but used here) + kubectl
```

> Verified Jun 2026: cluster create ~271–306s; full deploy curls HTTP 200.

---

## 1. Create the project

```bash
mkdir kube-kitties && cd kube-kitties
pulumi new azure-csharp
# Project name: kube-kitties (just accept the default — it's the folder name)   Stack: dev
```

⚠️ **The project name must be `kube-kitties`** — every later step references the
stack `<org>/kube-kitties/dev` (the split's stack reference, the workload config).
`pulumi new` defaults the name to the folder, so naming the folder `kube-kitties`
makes this automatic. If you name it something else, use *that* name everywhere
`kube-kitties` appears below.

```bash
pulumi config set azure-native:location canadacentral   # or your region
```

The `azure-csharp` template only references `Pulumi.AzureNative`. This program
also drives Kubernetes, so add that provider package now:

```bash
dotnet add package Pulumi.Kubernetes
```

Open `Program.cs` — this one file is the whole program. Replace the template's
`using` lines and its example resource with what follows.

---

## 2. Stage 1 — the cluster + registry (`pulumi up` #1, the 5-min wait)

Paste the cluster, an ACR, and the `AcrPull` wiring. The talking point: *the
registry and the cluster are both Azure resources, and Pulumi grants the
cluster's kubelet identity pull rights on the registry — in code, no secrets.*

Replace the template's `Program.cs` **entirely** with this — one block, top to
bottom: imports, then RG + AKS (Cilium) + ACR + `AcrPull` wiring + the
Kubernetes provider. The commented `── More AKS-native features ──` section in
the middle is a menu (Entra ID, Workload Identity, KEDA) — left off for the demo,
there to show what turning each on looks like.

```csharp
using System.Text;
using System.Collections.Generic;
using Pulumi;
using Pulumi.AzureNative.Resources;
using AC = Pulumi.AzureNative.ContainerService;
using ACI = Pulumi.AzureNative.ContainerService.Inputs;
using CR = Pulumi.AzureNative.ContainerRegistry;
using CRI = Pulumi.AzureNative.ContainerRegistry.Inputs;
using Authz = Pulumi.AzureNative.Authorization;
using K8s = Pulumi.Kubernetes;

// Getting Started with AKS — Stage 01: the cluster + an Azure Container Registry.
// AKS-native story: the registry and the cluster are BOTH Azure resources, and
// Pulumi wires the pull-permission between them (AcrPull on the kubelet identity).
// No app yet — this is the "infrastructure is ready" checkpoint.

return await Pulumi.Deployment.RunAsync(() =>
{
    var rg = new ResourceGroup("kubeKittiesRg", new ResourceGroupArgs
    {
        ResourceGroupName = "kube-kitties-rg",
    });

    var cluster = new AC.ManagedCluster("kubeKitties", new AC.ManagedClusterArgs
    {
        ResourceGroupName = rg.Name,
        ResourceName = "kube-kitties",
        KubernetesVersion = "1.33",
        DnsPrefix = "kubekitties",
        NodeResourceGroup = "kube-kitties-rg-nodes",
        EnableRBAC = true,
        Identity = new ACI.ManagedClusterIdentityArgs
        {
            Type = AC.ResourceIdentityType.SystemAssigned,
        },
        // --- Networking: Azure CNI Powered by Cilium (eBPF dataplane) ----------
        // THE Azure-native opt-in here (NOT the AKS default). The eBPF dataplane
        // replaces kube-proxy/iptables; NetworkPolicy is enforced in-kernel and you
        // get Hubble flow visibility. Same technology as GKE's "Dataplane V2".
        // Self-hosted you'd `helm install cilium … --set kubeProxyReplacement=true`
        // and own its lifecycle — here it's these fields and Azure runs it.
        NetworkProfile = new ACI.ContainerServiceNetworkProfileArgs
        {
            NetworkDataplane = "cilium",   // eBPF dataplane (the opt-in)
            NetworkPlugin = "azure",
            NetworkPluginMode = "overlay",
            NetworkPolicy = "cilium",      // network policy enforced by Cilium, in-kernel
            PodCidr = "192.168.0.0/16",
        },
        AgentPoolProfiles =
        {
            new ACI.ManagedClusterAgentPoolProfileArgs
            {
                Name = "agentpool",
                Count = 2,
                VmSize = "Standard_B2ms",
                OsType = "Linux",
                OsDiskSizeGB = 30,
                Type = "VirtualMachineScaleSets",
                Mode = "System",
            },
        },

        // ─── More AKS-native features (commented out — uncomment to turn on) ───
        // We don't use these in the workshop, but this is what enabling them looks like.

        // Entra ID (formerly Azure AD) + Azure RBAC for CLUSTER ACCESS.
        // Controls WHO can hit the Kubernetes API: humans sign in with their company
        // identity (SSO/MFA), and you grant access with Azure role assignments to Entra
        // groups instead of in-cluster RoleBindings — revoke = drop them from the group.
        // NOTE: EnableRBAC above is only *Kubernetes* RBAC; these two booleans add the
        // Entra integration on top.
        // AadProfile = new ACI.ManagedClusterAADProfileArgs
        // {
        //     Managed             = true,   // AKS-managed — no manual app registrations
        //     EnableAzureRBAC     = true,   // authz via Azure role assignments
        //     AdminGroupObjectIDs = { "<entra-group-guid>" },   // optional cluster-admin group
        // },

        // Workload Identity — the OTHER direction: lets a POD get an Entra token to call
        // Azure services (Key Vault, Storage, …) with NO secrets, via OIDC federation
        // between a Kubernetes ServiceAccount and a managed identity. Different feature
        // from AadProfile (pods→Azure, not humans→cluster). The lines below are only the
        // cluster side — each workload ALSO needs a FederatedIdentityCredential + a
        // ServiceAccount annotation. Heavier setup; it's the basis for the AI-agent-on-AKS
        // sequel, which is why it's described here but not wired up.
        // OidcIssuerProfile = new ACI.ManagedClusterOidcIssuerProfileArgs { Enabled = true },
        // SecurityProfile = new ACI.ManagedClusterSecurityProfileArgs
        // {
        //     WorkloadIdentity = new ACI.ManagedClusterSecurityProfileWorkloadIdentityArgs { Enabled = true },
        // },

        // KEDA — event-driven autoscaling add-on (scale on queue depth, HTTP rps, cron,
        // etc., not just CPU/memory). Pod-level; pairs with a node autoscaler (below).
        // One managed-add-on field:
        // WorkloadAutoScalerProfile = new ACI.ManagedClusterWorkloadAutoScalerProfileArgs
        // {
        //     Keda = new ACI.ManagedClusterWorkloadAutoScalerProfileKedaArgs { Enabled = true },
        // },

        // Node Auto Provisioning (NAP) — AKS's managed Karpenter, the NODE layer under
        // KEDA. Instead of fixed agent pools with min/max, Azure provisions + right-sizes
        // nodes to fit pending pods. Requires Azure CNI Overlay + Cilium (this cluster
        // already has it). ⚠️ Preview: needs `az feature register --namespace
        // Microsoft.ContainerService --name NodeAutoProvisioningPreview` first. You then
        // tune it with in-cluster NodePool / AKSNodeClass CRDs, not here.
        // NodeProvisioningProfile = new ACI.ManagedClusterNodeProvisioningProfileArgs
        // {
        //     Mode = "Auto",   // "Manual" (default) = classic fixed agent pools
        // },
    });

    // --- Azure Container Registry --------------------------------------------
    // RegistryName omitted → Pulumi auto-names (alphanumeric, globally unique).
    var registry = new CR.Registry("acr", new CR.RegistryArgs
    {
        ResourceGroupName = rg.Name,
        Sku = new CRI.SkuArgs { Name = CR.SkuName.Basic },
        AdminUserEnabled = false,
    });

    // --- Wire AcrPull: let the cluster's kubelet identity pull from the ACR ---
    var clientConfig = Authz.GetClientConfig.Invoke();
    var kubeletObjectId = cluster.IdentityProfile.Apply(p => p!["kubeletidentity"].ObjectId!);

    var acrPull = new Authz.RoleAssignment("acrPull", new Authz.RoleAssignmentArgs
    {
        PrincipalId = kubeletObjectId,
        PrincipalType = Authz.PrincipalType.ServicePrincipal,
        // AcrPull built-in role
        RoleDefinitionId = clientConfig.Apply(c =>
            $"/subscriptions/{c.SubscriptionId}/providers/Microsoft.Authorization/roleDefinitions/7f951dda-4ed3-4680-a7ca-43fe172d538d"),
        Scope = registry.Id,
    });

    // --- Kubeconfig + Kubernetes provider (ready for Stage 02) ---------------
    var creds = AC.ListManagedClusterUserCredentials.Invoke(new AC.ListManagedClusterUserCredentialsInvokeArgs
    {
        ResourceGroupName = rg.Name,
        ResourceName = cluster.Name,
    });
    var kubeconfig = creds.Apply(c =>
        Encoding.UTF8.GetString(System.Convert.FromBase64String(c.Kubeconfigs[0].Value)));

    var k8sProvider = new K8s.Provider("kubeKittiesK8s", new K8s.ProviderArgs
    {
        KubeConfig = Output.CreateSecret(kubeconfig),
        EnableServerSideApply = true,
    });

    return new Dictionary<string, object?>
    {
        ["clusterName"] = cluster.Name,
        ["acrLoginServer"] = registry.LoginServer,   // e.g. acr1a2b3c4.azurecr.io
        ["kubeconfig"] = Output.CreateSecret(kubeconfig),   // talk to the cluster: pulumi stack output kubeconfig --show-secrets
        // After up:  az acr import --name <acrLoginServer-minus-domain> \
        //              --source docker.io/agbell/my-random-cat:latest --image my-random-cat:latest
    };
});
```

```bash
pulumi up        # ~5 minutes — DON'T WAIT. Keep talking.
```

**While it builds (~5 min) — "what AKS gives you on top of vanilla k8s":**
- It's just code — stacks, config, outputs; Pulumi figures out the dependency order.
- **Cilium** (Azure CNI Powered by Cilium) — eBPF networking + in-kernel NetworkPolicy; the opt-in we made above (not the AKS default). Same tech as GKE's Dataplane V2.
- **Entra ID RBAC** — cluster access controlled by your Azure (Entra ID / AD) groups (commented in the code above).
- **Managed add-ons** (`az aks addon list-available`) — KEDA, service mesh, Key Vault CSI.
- The kubeconfig is **automatically a secret** in state — nobody can read it.

Glance at the watch around the 1-minute-left mark; confirm it reports created.

---

## 3. Verify the cluster

```bash
pulumi stack output kubeconfig --show-secrets > kubeconfig.yaml
export KUBECONFIG=$PWD/kubeconfig.yaml

kubectl get nodes          # two nodes, Ready
k9s                        # default namespace empty — nothing running yet
```

> `KUBECONFIG` doesn't survive a new terminal tab — re-export if `kubectl` drifts to another cluster.

---

## 4. Stage 2 — the cat app (`pulumi up` #2, the payoff)

The `import` step shells out to `az acr import`, so add the Command provider:

```bash
dotnet add package Pulumi.Command
```

Add the Kubernetes + Command imports alongside the ones from Stage 1:

```csharp
using Cmd = Pulumi.Command.Local;
using Apps = Pulumi.Kubernetes.Apps.V1;
using Core = Pulumi.Kubernetes.Core.V1;
using AppsIn = Pulumi.Kubernetes.Types.Inputs.Apps.V1;
using CoreIn = Pulumi.Kubernetes.Types.Inputs.Core.V1;
using MetaIn = Pulumi.Kubernetes.Types.Inputs.Meta.V1;
```

Import the public cat image into our ACR (server-side, no local Docker), then
deploy it. Add this inside `Deployment.RunAsync`, after the Stage 1 resources
(it reuses `registry`, `k8sProvider`, `cluster`, and `kubeconfig`):

```csharp
// Pull the cat image into OUR registry, server-side (no local Docker).
var import = new Cmd.Command("import-cat-image", new Cmd.CommandArgs
{
    Create = registry.Name.Apply(n =>
        $"az acr import --name {n} --source docker.io/agbell/my-random-cat:latest --image my-random-cat:latest --force"),
}, new CustomResourceOptions { DependsOn = { registry } });

var catImage = registry.LoginServer.Apply(s => $"{s}/my-random-cat:latest");
var labels = new InputMap<string> { { "app", "cat-app" } };

// Provider + don't deploy the app until the image import has run.
var catOpts = new CustomResourceOptions { Provider = k8sProvider, DependsOn = { import } };

var catDeployment = new Apps.Deployment("cat-deployment", new AppsIn.DeploymentArgs
{
    Metadata = new MetaIn.ObjectMetaArgs { Name = "cat-deployment" },
    Spec = new AppsIn.DeploymentSpecArgs
    {
        Replicas = 2,
        Selector = new MetaIn.LabelSelectorArgs { MatchLabels = labels },
        Template = new CoreIn.PodTemplateSpecArgs
        {
            Metadata = new MetaIn.ObjectMetaArgs { Labels = labels },
            Spec = new CoreIn.PodSpecArgs
            {
                NodeSelector = { { "kubernetes.io/os", "linux" } },
                Containers =
                {
                    new CoreIn.ContainerArgs
                    {
                        Name = "cat-server",
                        Image = catImage,
                        Ports = { new CoreIn.ContainerPortArgs { ContainerPortValue = 8080 } },
                    },
                },
            },
        },
    },
}, catOpts);

var catService = new Core.Service("cat-service", new CoreIn.ServiceArgs
{
    Metadata = new MetaIn.ObjectMetaArgs { Name = "cat-service" },
    Spec = new CoreIn.ServiceSpecArgs
    {
        Type = "LoadBalancer",
        Selector = labels,
        Ports = { new CoreIn.ServicePortArgs { Port = 80, TargetPort = 8080, Protocol = "TCP" } },
    },
}, catOpts);

// Add the cat's IP to the exports you already have (keep the kubeconfig export).
return new Dictionary<string, object?>
{
    ["clusterName"] = cluster.Name,
    ["acrLoginServer"] = registry.LoginServer,
    ["kubeconfig"] = Output.CreateSecret(kubeconfig),
    ["catServiceIp"] = catService.Status.Apply(s => s!.LoadBalancer.Ingress[0].Ip),
};
```

```bash
pulumi up        # fast — runs on the cluster
```

**See it:**
```bash
k9s                                   # cat-service: 2 pods on 2 nodes; peek the logs
curl http://$(pulumi stack output catServiceIp)/
```
Open the IP in a browser → **"KubeKitties Random Cat."** 🐱 (Refresh a beat — the
LoadBalancer IP takes a moment after `up` returns.)

---

## 5. Stage 3 — split infra from workload (stretch)

*The pitch:* the cluster changes rarely; the app changes constantly. Split them
into two stacks joined by a **stack reference** — base infra vs. fast-moving
workload. We do this **without recreating the cluster** by keeping its project
name the same.

> **Do I tear the cluster down for this? No.** Because `aks-cluster/` keeps the
> project name `kube-kitties`, `org/kube-kitties/dev` is the *same stack* you've
> been running. `pulumi up` there just deletes the cat Deployment/Service and
> leaves the cluster + ACR alone — no recreate, no teardown. (If you instead
> *rename* the project, Pulumi sees a brand-new stack and builds a second
> cluster — so keep the name.)

**5a — split out the cluster (scripted).** From inside `kube-kitties/`, run the
helper (it lives one level up, in the workshop's `03-split/` folder):

```bash
../03-split/split.sh
```

It creates `aks-cluster/` — your project files moved in, `Program.cs` rewritten to
the cluster-only version (RG + AKS + ACR + AcrPull + the image `import` kept, the
cat **stripped**, exports trimmed to `clusterName` / `acrLoginServer` /
`kubeconfig`) — and an **empty `workload/`** you'll fill in at 5c. The project name
is unchanged, so `aks-cluster/` is still the same `<project>/dev` stack; Pulumi
won't recreate the cluster.

> By hand instead: make the two folders, `mv` the project files into
> `aks-cluster/`, delete `catImage` / `catOpts` / `catDeployment` / `catService`
> from its `Program.cs` (keep `import`), and trim the exports to the three above.

**5b — bring the cat down from the cluster stack.**

```bash
cd aks-cluster
pulumi up        # SAME stack — removes only cat-deployment + cat-service; cluster + ACR untouched
```

To watch in **k9s** while you re-deploy — the kubeconfig is an output of *this*
(cluster) stack, so grab it here. The export holds for the rest of the session,
so you can `cd ../workload`, `pulumi up`, and watch the pods land in the same
window:

```bash
pulumi stack output kubeconfig --show-secrets > kubeconfig.yaml
export KUBECONFIG=$PWD/kubeconfig.yaml
kubectl get nodes
k9s
```

**5c — create the workload stack.**

```bash
cd ../workload
pulumi new azure-csharp
# Name: kube-kitties-workload   Stack: dev

# clusterStack format is ORG/CLUSTER-PROJECT/STACK (no angle brackets — zsh would
# read "<org>" as a file). This fills your org in automatically; the cluster
# project here is whatever Stage 1 was named (e.g. kube-kitties, or demo):
pulumi config set kube-kitties-workload:clusterStack "$(pulumi org get-default)/kube-kitties/dev"
```

**5d — the workload program.** This is a fresh project, so add the Kubernetes
provider first:

```bash
dotnet add package Pulumi.Kubernetes
```

Then replace the whole of `workload/Program.cs` with this — it pulls the
cluster's outputs via a stack reference, builds a provider from the kubeconfig,
and deploys the cat:

```csharp
using System.Collections.Generic;
using Pulumi;
using K8s = Pulumi.Kubernetes;
using Apps = Pulumi.Kubernetes.Apps.V1;
using Core = Pulumi.Kubernetes.Core.V1;
using AppsIn = Pulumi.Kubernetes.Types.Inputs.Apps.V1;
using CoreIn = Pulumi.Kubernetes.Types.Inputs.Core.V1;
using MetaIn = Pulumi.Kubernetes.Types.Inputs.Meta.V1;

return await Pulumi.Deployment.RunAsync(() =>
{
    var cfg = new Config();
    var clusterStack = new StackReference(cfg.Require("clusterStack"));

    var kubeconfig = clusterStack.GetOutput("kubeconfig");
    var acrLoginServer = clusterStack.GetOutput("acrLoginServer");
    var catImage = acrLoginServer.Apply(s => $"{s}/my-random-cat:latest");

    var k8sProvider = new K8s.Provider("kubeKittiesK8s", new K8s.ProviderArgs
    {
        KubeConfig = kubeconfig.Apply(o => (string)o!),
        EnableServerSideApply = true,
    });
    var opts = new CustomResourceOptions { Provider = k8sProvider };

    var labels = new InputMap<string> { { "app", "cat-app" } };

    var catDeployment = new Apps.Deployment("cat-deployment", new AppsIn.DeploymentArgs
    {
        Metadata = new MetaIn.ObjectMetaArgs { Name = "cat-deployment" },
        Spec = new AppsIn.DeploymentSpecArgs
        {
            Replicas = 2,
            Selector = new MetaIn.LabelSelectorArgs { MatchLabels = labels },
            Template = new CoreIn.PodTemplateSpecArgs
            {
                Metadata = new MetaIn.ObjectMetaArgs { Labels = labels },
                Spec = new CoreIn.PodSpecArgs
                {
                    NodeSelector = { { "kubernetes.io/os", "linux" } },
                    Containers =
                    {
                        new CoreIn.ContainerArgs
                        {
                            Name = "cat-server",
                            Image = catImage,
                            Ports = { new CoreIn.ContainerPortArgs { ContainerPortValue = 8080 } },
                        },
                    },
                },
            },
        },
    }, opts);

    var catService = new Core.Service("cat-service", new CoreIn.ServiceArgs
    {
        Metadata = new MetaIn.ObjectMetaArgs { Name = "cat-service" },
        Spec = new CoreIn.ServiceSpecArgs
        {
            Type = "LoadBalancer",
            Selector = labels,
            Ports = { new CoreIn.ServicePortArgs { Port = 80, TargetPort = 8080, Protocol = "TCP" } },
        },
    }, opts);

    return new Dictionary<string, object?>
    {
        ["catServiceIp"] = catService.Status.Apply(s => s!.LoadBalancer.Ingress[0].Ip),
    };
});
```

```bash
pulumi up        # creates the cat in the workload stack — cluster stays put
curl http://$(pulumi stack output catServiceIp)/      # cat's back, now owned by workload
```

> **Narrate the blip:** between 5b and 5d the cat is briefly down and comes back
> on a **new LoadBalancer IP** (Azure assigns a fresh one; ~30–60s). That's the
> teaching point — the *workload* moved to its own stack while the *cluster*
> never budged. Don't promise the same URL across the split.

*(Full file: `03-split/workload/Program.cs`.)*

---

## 6. Stage 4 — bring your existing YAML (stretch)

*The pitch:* "What if you already have Kubernetes manifests?" Same split — but
the workload is now driven from raw YAML via `ConfigGroup`, not typed C#.

**6a — drop in the manifests.** These are plain, hand-written Kubernetes YAML —
the kind a team would already have in their repo. They ship in the Stage-4
checkpoint, so just copy the pair over. From `workload/`:

```bash
mkdir -p manifests
cp ../../04-split-yaml/workload/manifests/*.yaml manifests/
```

That's `cat-deployment.yaml` + `cat-service.yaml`. Note the image is the **public
DockerHub** `agbell/my-random-cat:latest` (not the ACR copy) — the point of this
act is "your existing manifests, as-written," nothing Azure-specific.

**6b — drop the typed cat first, then swap to YAML.** ⚠️ You can't do this as a
single in-place `pulumi up`: the `ConfigGroup` would try to *create*
`cat-deployment`/`cat-service` while the typed resources of the same k8s name
still exist, and Pulumi refuses to let two resources own the same live object.
So tear the typed workload down first (the cat blips, same as the split), then
bring it back from YAML:

```bash
# still in workload/, typed cat from Stage 3 is live
pulumi destroy --yes        # remove the typed cat (cluster + ACR untouched)
```

Now replace the whole of `workload/Program.cs` with this — the typed-resource
imports collapse to the provider and YAML namespaces, a `ConfigGroup` drives the
manifests you just copied in, and we reach back into it with `GetResource` to
export the Service IP (so `pulumi stack output` works like the other stages):

```csharp
using System.Collections.Generic;
using Pulumi;
using K8s = Pulumi.Kubernetes;
using Yaml = Pulumi.Kubernetes.Yaml;
using Core = Pulumi.Kubernetes.Core.V1;

return await Pulumi.Deployment.RunAsync(() =>
{
    var cfg = new Config();
    var clusterStack = new StackReference(cfg.Require("clusterStack"));
    var kubeconfig = clusterStack.GetOutput("kubeconfig");

    var k8sProvider = new K8s.Provider("kubeKittiesK8s", new K8s.ProviderArgs
    {
        KubeConfig = kubeconfig.Apply(o => (string)o!),
        EnableServerSideApply = true,
    });

    // Pulumi drives the existing manifests; it still tracks the Service↔Deployment
    // dependency graph and applies in the right order.
    var catManifests = new Yaml.ConfigGroup("cat-manifests", new Yaml.ConfigGroupArgs
    {
        Files = new[] { "manifests/*.yaml" },
    }, new ComponentResourceOptions { Provider = k8sProvider });

    // Reach into the ConfigGroup for the Service the YAML created, export its IP.
    var catService = catManifests.GetResource<Core.Service>("cat-service");

    return new Dictionary<string, object?>
    {
        ["catServiceIp"] = catService
            .Apply(s => s.Status)
            .Apply(st => st!.LoadBalancer.Ingress[0].Ip),
    };
});
```

```bash
pulumi up        # cat returns, now driven by your raw YAML — same cluster
curl http://$(pulumi stack output catServiceIp)/
```

> Narrate it the same way as the split: the cat drops and comes back (new IP) —
> only now its *definition* is plain YAML instead of typed C#.

*(Full file: `04-split-yaml/workload/`.)*

---

## 7. Stage 5 — GitOps (where you go next — take-home, show the code)

Now the workload is plain YAML in a repo — the day-2 move is to stop running
`pulumi up` by hand and let **Argo CD / Flux** watch the repo and reconcile it.
The mature pattern: **Pulumi for infra + GitOps for apps.**

We don't deploy this live, but it's **real, runnable code** in `05-gitops/` — pull
it up and show it: one Pulumi program (C#) stands up the cluster, installs **Argo
CD** (`Helm.V3.Release` — runs a real `helm install` so the chart's hooks fire),
and registers the cat as an Argo **`Application`** pointing at a git path. From
there Pulumi never touches the cat — Argo pulls from git and reconciles it.
Changing the cat = `git push`, not `pulumi up`. (Verified end-to-end on AKS:
Argo syncs the cat → HTTP 200.)

> Talking point if you open the code: `Helm.V4.Chart` does *client-side*
> templating and skips Helm hooks, so Argo's redis-auth secret never gets created
> and the pods wedge. `Helm.V3.Release` runs helm for real — hooks included. A
> nice "the tool matters" aside.

For the worked **Flux** version (Pulumi builds the cluster + bootstraps Flux;
Flux owns the apps, incl. an AI agent on Vertex AI), see Engin's *Getting Started
with Kubernetes on Google Cloud* workshop. See `05-gitops/README.md`.

> **Or let Neo do the migration.** Instead of hand-writing the GitOps program,
> show **`pulumi neo`** planning it from your two existing projects. From your
> working folder (the one with `aks-cluster/` + `workload/` as subfolders):
>
> ```text
> pulumi neo
> > I have two Pulumi projects in subfolders here, aks-cluster and workload.
> > Plan how to move to a GitOps setup (Argo CD or Flux) like 05-gitops/ —
> > Pulumi installs the GitOps controller, the controller owns the cat app.
> ```
>
> A nice live beat: the agent reads both projects and proposes the same
> infra-stays-Pulumi / apps-move-to-GitOps split — reinforcing the pattern rather
> than just asserting it. (Take-home; don't apply live.)

---

## 8. Cleanup

```bash
# Tear down in reverse: workload first, then the cluster.
cd workload && pulumi destroy --yes
cd ../aks-cluster && pulumi destroy --yes
# If destroy hangs on [409] Conflict:  pulumi cancel --yes  then retry.
```

> If you never split (stopped after Stage 2), it's a single `pulumi destroy` in `kube-kitties/`.

---

## Resources

- Repo: this workshop's stage folders
- Pulumi docs · Community Slack
- Sequel: `pulumi/workshops/getting-started-with-kubernetes-google-cloud` (Flux + AI agent on GKE)
