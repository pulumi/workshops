# Getting Started with AKS — Demo Script 🐱

The live walkthrough — **one continuous build**. Start from an empty `demo/`
folder and evolve the same code through every stage: a single program (cluster
+ cat), then split it into two stacks, then swap the workload to raw YAML. The
numbered stage folders (`01-cluster/` … `05-gitops/`) are the matching
end-state checkpoints if you need to reset.

> **Key trick for the split (Stage 3):** we keep the cluster's *project name*
> unchanged when we move its code, so Pulumi sees the **same stack** — the AKS
> cluster is never recreated mid-demo, only the cat app moves out into its own
> stack.

You'll deploy:
- An **AKS** cluster (Cilium / Dataplane V2) with Pulumi (C#)
- An **Azure Container Registry**, with the image imported server-side and the
  cluster's `AcrPull` permission wired in code
- A silly **random-cat** web app, exposed on a public LoadBalancer — no `kubectl apply`

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
mkdir demo && cd demo
pulumi new azure-csharp
# Name: kube-kitties   Stack: dev    <-- the project name "kube-kitties" matters later
```

```bash
pulumi config set azure-native:location canadacentral   # or your region
```

Open `Program.cs` — this one file is the whole program.

---

## 2. Stage 1 — the cluster + registry (`pulumi up` #1, the 5-min wait)

Paste the cluster, an ACR, and the `AcrPull` wiring. The talking point: *the
registry and the cluster are both Azure resources, and Pulumi grants the
cluster's kubelet identity pull rights on the registry — in code, no secrets.*

```csharp
// RG + AKS (Cilium/Dataplane V2) + system-assigned identity
var rg = new ResourceGroup("kubeKittiesRg", new() { ResourceGroupName = "kube-kitties-rg" });

var cluster = new AC.ManagedCluster("kubeKitties", new() {
    ResourceGroupName = rg.Name, ResourceName = "kube-kitties",
    KubernetesVersion = "1.33", DnsPrefix = "kubekitties",
    NodeResourceGroup = "kube-kitties-rg-nodes", EnableRBAC = true,
    Identity = new ACI.ManagedClusterIdentityArgs { Type = AC.ResourceIdentityType.SystemAssigned },
    NetworkProfile = new ACI.ContainerServiceNetworkProfileArgs {
        NetworkDataplane = "cilium", NetworkPlugin = "azure",
        NetworkPluginMode = "overlay", NetworkPolicy = "cilium", PodCidr = "192.168.0.0/16" },
    AgentPoolProfiles = { new ACI.ManagedClusterAgentPoolProfileArgs {
        Name = "agentpool", Count = 2, VmSize = "Standard_B2ms",
        OsType = "Linux", OsDiskSizeGB = 30,
        Type = "VirtualMachineScaleSets", Mode = "System" } },
});

// Azure Container Registry + AcrPull on the cluster's kubelet identity
var registry = new CR.Registry("acr", new() {
    ResourceGroupName = rg.Name,
    Sku = new CRI.SkuArgs { Name = CR.SkuName.Basic }, AdminUserEnabled = false });

var clientConfig = Authz.GetClientConfig.Invoke();
var acrPull = new Authz.RoleAssignment("acrPull", new() {
    PrincipalId = cluster.IdentityProfile.Apply(p => p!["kubeletidentity"].ObjectId!),
    PrincipalType = Authz.PrincipalType.ServicePrincipal,
    RoleDefinitionId = clientConfig.Apply(c =>
        $"/subscriptions/{c.SubscriptionId}/providers/Microsoft.Authorization/roleDefinitions/7f951dda-4ed3-4680-a7ca-43fe172d538d"),
    Scope = registry.Id });

// Kubeconfig (auto-secret in state) + a programmatic Kubernetes provider
var creds = AC.ListManagedClusterUserCredentials.Invoke(new() {
    ResourceGroupName = rg.Name, ResourceName = cluster.Name });
var kubeconfig = creds.Apply(c =>
    Encoding.UTF8.GetString(Convert.FromBase64String(c.Kubeconfigs[0].Value)));
var k8s = new K8s.Provider("kubeKittiesK8s", new() {
    KubeConfig = Output.CreateSecret(kubeconfig), EnableServerSideApply = true });

// Export the kubeconfig (stays a secret in state) so we can talk to the cluster.
return new Dictionary<string, object?> {
    ["clusterName"]    = cluster.Name,
    ["acrLoginServer"] = registry.LoginServer,
    ["kubeconfig"]     = Output.CreateSecret(kubeconfig),
};
```

```bash
pulumi up        # ~5 minutes — DON'T WAIT. Keep talking.
```

**While it builds (~5 min) — "what AKS gives you on top of vanilla k8s":**
- It's just code — stacks, config, outputs; Pulumi figures out the dependency order.
- **Cilium / Dataplane V2** — eBPF networking + network policy, on by default.
- **Entra ID RBAC** — cluster access controlled by Azure AD groups.
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

Import the public cat image into our ACR (server-side, no local Docker), then
deploy it. Add this to `Program.cs`:

```csharp
// Pull the cat image into OUR registry, server-side
var import = new Cmd.Command("import-cat-image", new() {
    Create = registry.Name.Apply(n =>
        $"az acr import --name {n} --source docker.io/agbell/my-random-cat:latest --image my-random-cat:latest --force"),
}, new() { DependsOn = { registry } });

var catImage = registry.LoginServer.Apply(s => $"{s}/my-random-cat:latest");
var labels = new InputMap<string> { { "app", "cat-app" } };
var catOpts = new CustomResourceOptions { Provider = k8s, DependsOn = { import } };

var catDeployment = new Apps.Deployment("cat-deployment", new() {
    Metadata = new() { Name = "cat-deployment" },
    Spec = new AppsIn.DeploymentSpecArgs {
        Replicas = 2,
        Selector = new() { MatchLabels = labels },
        Template = new CoreIn.PodTemplateSpecArgs {
            Metadata = new() { Labels = labels },
            Spec = new CoreIn.PodSpecArgs {
                NodeSelector = { { "kubernetes.io/os", "linux" } },
                Containers = { new CoreIn.ContainerArgs {
                    Name = "cat-server", Image = catImage,
                    Ports = { new CoreIn.ContainerPortArgs { ContainerPortValue = 8080 } } } } } } } },
    catOpts);

var catService = new Core.Service("cat-service", new() {
    Metadata = new() { Name = "cat-service" },
    Spec = new CoreIn.ServiceSpecArgs {
        Type = "LoadBalancer", Selector = labels,
        Ports = { new CoreIn.ServicePortArgs { Port = 80, TargetPort = 8080, Protocol = "TCP" } } } },
    catOpts);

// Add the cat's IP to the exports you already have (keep the kubeconfig export).
return new Dictionary<string, object?> {
    ["clusterName"]    = cluster.Name,
    ["acrLoginServer"] = registry.LoginServer,
    ["kubeconfig"]     = Output.CreateSecret(kubeconfig),
    ["catServiceIp"]   = catService.Status.Apply(s => s!.LoadBalancer.Ingress[0].Ip),
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

**5a — restructure into two folders.** From inside `demo/`:

```bash
mkdir aks-cluster workload
git mv Program.cs Pulumi.yaml Pulumi.dev.yaml *.csproj aks-cluster/ 2>/dev/null \
  || mv Program.cs Pulumi.yaml Pulumi.dev.yaml *.csproj aks-cluster/
```

The cluster keeps **project name `kube-kitties`** (unchanged `Pulumi.yaml`), so
`aks-cluster/` is still the same `kube-kitties/dev` stack — Pulumi won't touch
the running cluster.

**5b — strip the app out of the cluster program.** In `aks-cluster/Program.cs`,
**delete** `catImage`, `catOpts`, `catDeployment`, and `catService`. **Keep the
`import`** — the image belongs with the registry, in the infra stack. Then
change the exports to hand the workload what it needs:

```csharp
return new Dictionary<string, object?> {
    ["clusterName"]    = cluster.Name,
    ["acrLoginServer"] = registry.LoginServer,
    ["kubeconfig"]     = Output.CreateSecret(kubeconfig),   // consumed by the workload stack
};
```

```bash
cd aks-cluster
pulumi up        # removes the cat from THIS stack; cluster + ACR untouched
```

**5c — create the workload stack.**

```bash
cd ../workload
pulumi new azure-csharp
# Name: kube-kitties-workload   Stack: dev
pulumi config set kube-kitties-workload:clusterStack <org>/kube-kitties/dev
```

**5d — the workload program.** It pulls the cluster's outputs via a stack
reference, builds a provider from the kubeconfig, and deploys the cat:

```csharp
var cfg = new Config();
var clusterStack = new StackReference(cfg.Require("clusterStack"));
var kubeconfig     = clusterStack.GetOutput("kubeconfig");
var acrLoginServer = clusterStack.GetOutput("acrLoginServer");
var catImage = acrLoginServer.Apply(s => $"{s}/my-random-cat:latest");

var k8s = new K8s.Provider("kubeKittiesK8s", new() {
    KubeConfig = kubeconfig.Apply(o => (string)o!), EnableServerSideApply = true });
var opts = new CustomResourceOptions { Provider = k8s };

// ... same cat Deployment + LoadBalancer Service as Stage 2, using `catImage` ...
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

**6a — drop in the manifests.** In `workload/`:

```bash
mkdir manifests
# manifests/cat-deployment.yaml + manifests/cat-service.yaml
# (plain k8s YAML — image agbell/my-random-cat:latest, as-written)
```

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

Now replace the whole body of `workload/Program.cs` with the `ConfigGroup`:

```csharp
var cfg = new Config();
var clusterStack = new StackReference(cfg.Require("clusterStack"));
var kubeconfig = clusterStack.GetOutput("kubeconfig");

var k8s = new K8s.Provider("kubeKittiesK8s", new() {
    KubeConfig = kubeconfig.Apply(o => (string)o!), EnableServerSideApply = true });

// Pulumi drives the existing manifests; it still tracks the Service↔Deployment
// dependency graph and applies in the right order.
var cat = new Yaml.ConfigGroup("cat-manifests", new() {
    Files = new[] { "manifests/*.yaml" },
}, new ComponentResourceOptions { Provider = k8s });
```

```bash
pulumi up        # cat returns, now driven by your raw YAML — same cluster
curl http://$(kubectl get svc cat-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}')/
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

---

## 8. Cleanup

```bash
# Tear down in reverse: workload first, then the cluster.
cd workload && pulumi destroy --yes
cd ../aks-cluster && pulumi destroy --yes
# If destroy hangs on [409] Conflict:  pulumi cancel --yes  then retry.
```

> If you never split (stopped after Stage 2), it's a single `pulumi destroy` in `demo/`.

---

## Resources

- Repo: this workshop's stage folders
- Pulumi docs · Community Slack
- Sequel: `pulumi/workshops/getting-started-with-kubernetes-google-cloud` (Flux + AI agent on GKE)
