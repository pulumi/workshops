---
theme: "@pulumi/slidev-theme"
title: "AI Agents for IT Ops: Custom Agent on AKS with Azure OpenAI"
info: |
  AI Agents for IT Ops: Custom Agent on AKS with Azure OpenAI. Provisioning
  an AKS cluster and an Azure OpenAI deployment from one Pulumi program,
  deploying a containerized agent, and tearing the whole stack down clean.

  Repo: https://github.com/pulumi/workshops/tree/main/itops-agent-aks-azure-openai
transition: slide-left
mdc: true
canvasWidth: 1920
aspectRatio: 16/9
highlighter: shiki
lineNumbers: false
layout: cover
defaults:
  layout: default

---

<div class="absolute inset-0 flex flex-col justify-center items-start px-20">
  <h1 class="!text-[5.4rem] !leading-[1.02] !font-semibold !tracking-tight !mb-6 !max-w-[95%]">
    AI Agents for IT Ops
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    A custom agent on AKS, calling Azure OpenAI, provisioned entirely as Pulumi code
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Pulumi
  </p>
</div>

<!--
~2min. By the end of this session you'll have provisioned an AKS cluster and
an Azure OpenAI deployment from one Pulumi program, deployed a small agent
onto that cluster, made it answer a real prompt, and torn the whole stack
down without leaving a bill running. Ninety minutes, one region (eastus2),
six numbered folders on disk, each one a runnable Pulumi stack.
-->

---

# Before we start

<div class="zoom-content">

<div class="info-card">
<div class="info-card__label">You'll need</div>
<ul>
<li>An Azure subscription with Owner or Contributor rights</li>
<li>Azure OpenAI access enabled on that subscription</li>
<li>Pulumi CLI, Python 3.11+</li>
<li><code>az</code> CLI logged in, <code>kubectl</code> installed</li>
</ul>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.6; }
</style>

<!--
~3min. Azure OpenAI access needs prior approval on some subscriptions, so
this is worth flagging before the session, not during it. If you're
following along rather than watching, get these four things sorted now:
subscription rights, OpenAI access, the Pulumi CLI and Python, and az/kubectl
authenticated against the subscription you'll use today.
-->

---

# Why a custom agent, not a managed service

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
<li>You choose the runtime, the model version, and the network path</li>
<li>The agent is a container you own, not a vendor's black box</li>
<li>Same authentication story as every other workload on the cluster</li>
<li>No packaged component exists for this pattern: you assemble it from AKS and Azure OpenAI primitives</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.7; }
</style>

<!--
~5min. A managed agent service is fine until you need control over the
runtime, the model version pinned, or the network boundary. This demo
builds the primitives yourself: azure-native.containerservice.ManagedCluster,
azure-native.cognitiveservices.Account and Deployment, standard Kubernetes
resources. No packaged Pulumi component for "agent on AKS calling Azure
OpenAI" exists as of today. That's not a gap in the workshop; it's the
reason the workshop is useful.
-->

---

# The shape of the demo

<div class="wi-mermaid">

```mermaid {scale: 1.1, theme: 'base', themeVariables: { 'background': 'transparent', 'primaryColor': '#1f1d3a', 'primaryTextColor': '#e9e7ff', 'primaryBorderColor': '#7e6bff', 'lineColor': '#9b8cff', 'clusterBkg': '#15132c', 'clusterBorder': '#5b4cd6', 'fontFamily': 'Inter, ui-sans-serif, system-ui', 'fontSize': '17px' } }
flowchart LR
  subgraph rg["rg-itops-agent-aks-azure-openai · eastus2"]
    subgraph aks["AKS · itops-agent-aks"]
      pod["itops-agent pod<br/>ServiceAccount: itops-agent<br/>azure.workload.identity/use: true"]
    end
    identity["UserAssignedIdentity<br/>itops-agent-identity"]
    fed["FederatedIdentityCredential<br/>subject: system:serviceaccount:itops-agent:itops-agent"]
    role["RoleAssignment<br/>Cognitive Services OpenAI User"]
    openai["Cognitive Services Account<br/>itops-agent-openai (kind OpenAI)<br/>Deployment: itops-agent-gpt-4o"]
  end

  pod -. workload identity webhook .-> identity
  identity -. trusts .-> fed
  identity -. granted .-> role
  role -. scoped to .-> openai
  pod -- "POST /prompt" --> openai

  classDef pool fill:#2a2456,stroke:#7e6bff,stroke-width:1.5px,color:#f3f1ff;
  classDef svc fill:#1a2c4a,stroke:#5db0ff,stroke-width:1.5px,color:#e6f1ff;
  class pod pool;
  class openai,identity,fed,role svc;
```

</div>

<!--
~6min. Walk the diagram left to right. One resource group, one AKS cluster
running the agent pod, and a chain of three resources (managed identity,
federated credential, role assignment) that lets the pod's ServiceAccount
reach Azure OpenAI without a stored key anywhere. No LoadBalancer, no public
IP; the agent is reached with kubectl port-forward only. This whole graph
comes from six numbered Pulumi Python folders, each building on the last.
-->

---

# One program per step, same shape

<div class="zoom-content">

```python {all}
config = pulumi.Config()
resource_group = azure_native.resources.ResourceGroup(
    "itops-agent",
    resource_group_name="rg-itops-agent-aks-azure-openai",
    location=config.get("location") or "eastus2",
    tags={"workshop": "itops-agent-aks-azure-openai", "managed-by": "pulumi"},
)
pulumi.export("resourceGroupName", resource_group.name)
pulumi.export("location", resource_group.location)
```

<div class="info-card">
<div class="info-card__label">01-empty-program/</div>
The output of <code>pulumi new azure-native-python</code>, plus one
resource group with a fixed, non-suffixed name so every later folder can
reference it by name.
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.35; }
</style>

<!--
~5min. Six folders, one Pulumi stack each, same two providers throughout:
azure-native and, from step 5, kubernetes. This first folder is deliberately
almost nothing: one resource group named rg-itops-agent-aks-azure-openai,
fixed rather than auto-suffixed, because every later step looks it up by
that literal name instead of passing an output around. Pulumi CLI 3.263.0,
pulumi-azure-native 3.28.0, pinned in every folder's requirements.txt.
-->

---

# Live demo: the AKS cluster

<div class="zoom-content code-sm">

```bash
cd 02-aks-cluster && pulumi up --stack dev
```

```bash
az aks show --resource-group rg-itops-agent-aks-azure-openai --name itops-agent-aks
```

<div class="info-card">
<div class="info-card__label">itops-agent-aks · eastus2</div>
<ul>
<li>2x <code>Standard_D2s_v5</code>, pool <code>agentpool</code>, Kubernetes 1.31</li>
<li><code>oidcIssuerProfile.enabled=True</code>, <code>workloadIdentity.enabled=True</code></li>
</ul>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
</style>

<!--
~12min. This step takes five to ten minutes live. If time is tight, this is
pre-provisioned before the session and the narration starts from step 3
instead, explaining on this slide what would have run. The cluster is a
ManagedCluster named itops-agent-aks, two Standard_D2s_v5 nodes, Kubernetes
1.31. Two flags matter for later: OIDC issuer and workload identity are both
enabled now, because step 4's federated credential needs the issuer URL this
step exports. Verify live with az aks show.
-->

---

# Live demo: Azure OpenAI

<div class="zoom-content code-sm">

```bash
cd 03-azure-openai && pulumi up --stack dev
```

```bash
az cognitiveservices account show
az cognitiveservices account deployment list
```

<div class="info-card">
<div class="info-card__label">itops-agent-openai · gpt-4o 2024-11-20</div>
<ul>
<li>SKU <code>GlobalStandard</code>, capacity <code>10</code></li>
<li><code>disable_local_auth=True</code>: no API key exists for this account</li>
</ul>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
</style>

<!--
~10min. Azure OpenAI quota or region approval can take days and is the most
likely reason a live demo fails, so this account and deployment are
pre-provisioned before the session if quota isn't confirmed, and this slide
narrates what pulumi up would have produced. The account is kind OpenAI,
model gpt-4o version 2024-11-20 (current as of the read date; 2024-05-13 and
2024-08-06 are deprecated). disable_local_auth=True turns off key-based auth
at the account level entirely; no key is ever generated. Verify live with
az cognitiveservices account show and account deployment list.
-->

---

# Credentials without secrets

<div class="zoom-content">

<div class="gpu-card gpu-card--primary">
<div class="gpu-caption gpu-caption--accent">04-workload-identity/</div>
<ul>
<li><code>UserAssignedIdentity</code>: itops-agent-identity</li>
<li><code>FederatedIdentityCredential</code>: trusts <code>system:serviceaccount:itops-agent:itops-agent</code></li>
<li><code>RoleAssignment</code>: role <code>5e0bd9bd-...61bd</code>, "Cognitive Services OpenAI User"</li>
</ul>
</div>

<div class="info-card">
<div class="info-card__label">This is AKS workload identity, not Pulumi ESC</div>
Pulumi ESC is a documented presenter fallback: a short-lived key minted and
shown once on screen if OIDC federation is fiddly live. Never a
persisted static secret.
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.35; }
</style>

<!--
~8min. This step never issues a static key. It's a chain of three Azure
resources: a UserAssignedIdentity, a FederatedIdentityCredential whose
subject string is exactly system:serviceaccount:&lt;namespace&gt;:&lt;serviceAccount&gt;
(the Kubernetes-side identity being trusted), and a RoleAssignment granting
that identity Cognitive Services OpenAI User, scoped to the OpenAI account
from the last step. Verify with az role assignment list --assignee
&lt;identityClientId&gt;. If OIDC federation doesn't come together live, the
presenter's fallback is a short-lived Pulumi ESC key shown once on screen,
never written to a file. Say that out loud if you use it.
-->

---

# Live demo: deploying the agent

<div class="zoom-content code-sm">

```bash
cd 05-agent-deployment && pulumi up --stack dev
```

<div class="info-card">
<div class="info-card__label">What pulumi up creates</div>
<ul>
<li>k8s.Provider from the cluster's own kubeconfig, no static file</li>
<li>Namespace, ServiceAccount (workload identity annotation), Deployment, Service</li>
<li>Service is <code>ClusterIP</code> by design: no billable public IP</li>
</ul>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
</style>

<!--
~10min. The agent image is built and pushed to a registry before the
session; pulumi up here never runs docker build. Which registry to push to
is an open question the demo leaves as a required config value rather than
inventing one. The ServiceAccount carries the
azure.workload.identity/client-id annotation from step 4's identity, and the
pod template carries azure.workload.identity/use: true. Both are
required for the webhook to inject credentials. The Service is ClusterIP on
purpose: no LoadBalancer, no public IP, reachable only by port-forward.
-->

---

# Live demo: a real call, end to end

<div class="zoom-content code-sm">

```bash
kubectl get pods -n itops-agent
```

```bash
kubectl port-forward svc/itops-agent 8080:80 -n itops-agent
```

```bash
curl -X POST localhost:8080/prompt \
  -H 'Content-Type: application/json' \
  -d '{"prompt": "Say hello from AKS"}'
```

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
</style>

<!--
~8min. Three commands, run in order: confirm the pod is running, forward the
ClusterIP service to a local port, then post a prompt to it. The response
comes back from gpt-4o through the identity chain built in the last two
slides. Nothing in this call touches a stored key. AZURE_CLIENT_ID,
AZURE_TENANT_ID and AZURE_FEDERATED_TOKEN_FILE are injected into the pod by
the AKS workload identity webhook itself, not set anywhere in this program.
-->

---

# Cost reality check

<div class="zoom-content">

<div class="info-card">
<div class="info-card__label">Directional, not a Pulumi-published figure</div>
<ul>
<li>~$150&ndash;300/month for a small 2&ndash;3 node AKS cluster left running</li>
<li>A few dollars for workshop-scale GPT-4o token volume</li>
<li>A single session plus immediate teardown: a few dollars total</li>
</ul>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
</style>

<!--
~4min. These numbers come from combining two Azure pricing pages, read the
same day as everything else in this deck. They're directional, not a
Pulumi-published figure. The monthly range only matters if teardown gets
skipped. Run for one session and tear it down right after, and the real
number is a few dollars. That's the argument for the next slide.
-->

---

# Live demo: destroy and verify

<div class="zoom-content code-xs">

```bash
pulumi destroy --yes --stack dev   # 05, then 04, 03, 02, 01
```

```bash
az resource list --resource-group rg-itops-agent-aks-azure-openai
az aks show --resource-group rg-itops-agent-aks-azure-openai --name itops-agent-aks
az cognitiveservices account show
az role assignment list --assignee <identityClientId>
```

<div class="info-card">
<div class="info-card__label">Soft-deleted accounts block name reuse</div>
Purge any soft-deleted Cognitive Services account named itops-agent-openai
before the next delivery, or that name can't be reused.
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
</style>

<!--
~7min. Teardown destroys the five stacks in reverse dependency order: 05,
04, 03, 02, 01. Then az resource list against the resource group should come
back empty, and az cognitiveservices account list-deleted is checked for a
soft-deleted itops-agent-openai account; if found, az cognitiveservices
account purge removes it. Skip that purge and the second delivery can't
reuse the account name. The az aks show / account show / role assignment
list commands above are the same ones used earlier to verify each resource
existed, run again here to confirm they're gone.
-->

---

# What to change for production

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
<li>Private endpoints for the OpenAI account instead of a public data plane</li>
<li>Network policy restricting which pods can reach the AKS API and the OpenAI endpoint</li>
<li>Quota and rate-limit handling in the agent, not just at deployment time</li>
<li>A named container registry, not a placeholder config value</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.6; }
</style>

<!--
~5min. Everything in this demo is workshop-scale: public endpoints, one
node pool, one replica. Moving toward production means private endpoints
for the OpenAI account, network policy around who can reach the API server
and the model endpoint, quota and rate-limit handling built into the agent
rather than assumed away, and a real registry decision instead of the
placeholder config value this demo leaves open.
-->

---

# What you built

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
<li>Provisioned AKS and an Azure OpenAI deployment from one Pulumi program</li>
<li>Explained how the workload authenticates without a static secret</li>
<li>Deployed the agent and got a real model response back</li>
<li>Tore it all down and verified nothing billable remained</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.6; }
</style>

<!--
~3min. Four things, in the order you just watched them happen: one program
provisioning both AKS and Azure OpenAI, an authentication chain with no
static secret anywhere, an agent pod answering a real prompt, and a
teardown you verified rather than assumed. Same six folders on disk if you
want to run it again yourself.
-->

---

# Q&amp;A

<div class="zoom-content">

<div class="info-card">
<div class="info-card__label">Code</div>
<a href="https://github.com/pulumi/workshops/tree/main/itops-agent-aks-azure-openai">github.com/pulumi/workshops/tree/main/itops-agent-aks-azure-openai</a>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.6; }
</style>

<!--
~2min. All six folders, the agent-app source, and the teardown script are
in the repo at the link above. Questions now, or find us afterward.
-->
