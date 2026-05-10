---
theme: "@pulumi/slidev-theme"
title: "Getting Started with Kubernetes on Google Cloud"
info: |
  Getting Started with Kubernetes on Google Cloud.
  Engin Diri — Pulumi.

  Repo: https://github.com/pulumi/workshops/tree/main/getting-started-with-kubernetes-google-cloud
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
  <h1 class="!text-[6rem] !leading-[1.02] !font-semibold !tracking-tight !mb-6 !max-w-[95%]">
    Getting Started with Kubernetes on Google Cloud
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Engin Diri · Sr. Solutions Architect, Pulumi<br/>
  </p>
</div>

<!--
30s hook. Read the title. Don't sell anything yet — Act 1 starts with what
GKE is and why we're not just running `gcloud container clusters create`.
The talk has a story arc: Hello GKE → Now make it real → Lifecycle.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
~30s. Two beats: (1) housekeeping — workshop is show-only, slides + repo
links go up at the end, ask questions any time. (2) agenda — three acts:
Hello GKE (what + why), Now make it real (the production-close tour),
Lifecycle (preview/up/destroy + the destroy gotchas).
-->

---

# Housekeeping

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>Be chatty in the <strong>chat</strong> tab</li>
  <li>Ask questions in the <strong>Q&amp;A</strong> tab</li>
  <li>Links to slides, demos, and code are in the <strong>handouts</strong> tab</li>
  <li>This session is being recorded — link to the video lands in the follow-up email</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
~45s. Walk down the four bullets in order. Set the expectation that this
is a show-only workshop — attendees follow along, code goes home in the
handouts. Recording = no pressure to take notes, you'll get the link.
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>Hello, GKE!</li>
  <li>Why Pulumi?</li>
  <li>Now make it real</li>
  <li>The reusable component</li>
  <li>Lifecycle</li>
  <li>Where to go next</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.7; }
</style>

<!--
~45s. Six lines, one per act. Don't read the whole sub-text — just say
the act name and a half-sentence. The audience needs to know there's a
clear arc: orient (hello, why) → fix (make it real) → polish (component,
lifecycle) → where they take it.
-->

---

<div class="absolute inset-0 flex items-center justify-center gap-16 px-20">
  <img src="/logos/kubernetes.svg" alt="Kubernetes / GKE" class="h-[24rem] w-auto" />
  <h1 class="!text-[5.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[55%]">
    Today we're using <span class="text-[var(--p-primary)]">GKE</span>.
  </h1>
</div>

<!--
~10s. Read the headline, gesture at the wheel. Set the tool: this is GKE
Standard, regional, three pools — the rest of the workshop tours what
that means.
-->

<style scoped>
.slidev-layout { /* center vertically against the bg */ }
</style>

<!--
NOTE: the logo at /logos/kubernetes.svg is the Kubernetes wheel (which is
what GKE *is* — Google's hosted Kubernetes). If you want the official GKE
hexagon icon instead, drop a file at slides/public/logos/gke.svg and swap
the src above.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">And we go through all layers!</h1>
</div>

<!--
Beat 3 of 3. The promise. By the end of the hour we'll have a cluster you'd
defend in a security review, with a real Vertex AI agent on it, and the
whole thing fits in ~30 lines of Pulumi. ~5s, then walk into Act 1.
-->

---

<div class="full-bleed-image">
  <img src="/get-started.png" alt="Get started — it's free · app.pulumi.com/signup" />
</div>

<style scoped>
/* Hide the theme chrome on this slide so the image is the entire canvas. */
:deep(.pulumi-accent-bar),
:deep(.pulumi-footer) {
  display: none !important;
}
:deep(.pulumi-slide-body) {
  padding: 0 !important;
}

.full-bleed-image {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}
.full-bleed-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>

<!--
~10s breather + plug. Pulumi Cloud is free to sign up. Nudge attendees
to grab an account before we walk into Act 1 so they can follow along
on the handouts later.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Hello, GKE!</h1>
</div>


<!--
Act 1 divider. ~3s. Then break into "what is GKE" + "why Pulumi" + the
architecture diagram. Goal of Act 1: orient the audience without
overwhelming. Most of them know K8s; some have never touched GCP.
-->

---

# What is GKE?

<div class="zoom-content">

<ul class="!mt-8 !text-[1.4rem] !leading-relaxed space-y-5">
  <li>Google's managed Kubernetes. Shipped in 2015, the first managed K8s on any major cloud.</li>
  <li>Came straight out of Borg, the container platform Google had been running internally for about a decade before they open-sourced Kubernetes in 2014.</li>
  <li>Two modes: <strong>Standard</strong> (you run the nodes) and <strong>Autopilot</strong> (Google does).</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
~45s. Quick origin story. GKE 2015 = first managed K8s on any major
cloud. Borg lineage matters because the audience may have heard
"Kubernetes came out of Google" — this is the line. Then pivot: the
service has two flavors, and the next slide is the head-to-head.

Sources: cloud.google.com/kubernetes-engine ; the GKE overview docs.
-->

---

# GKE: Standard vs Autopilot

<div class="zoom-content">

<div class="grid grid-cols-2 gap-12 mt-6">
  <div>
    <div class="gpu-caption gpu-caption--muted">GKE Standard</div>
    <ul class="!mt-4 !text-[1.25rem] !leading-relaxed space-y-3">
      <li>You pick machine types, taints, and autoscaling bounds</li>
      <li>Full access to Dataplane V2, observability flags, the addon list</li>
      <li>Pay per node, plus a control-plane fee</li>
      <li class="!font-semibold "><span class="text-[var(--p-primary)]">What we're using today</span></li>
    </ul>
  </div>
  <div>
    <div class="gpu-caption gpu-caption--muted">GKE Autopilot</div>
    <ul class="!mt-4 !text-[1.25rem] !leading-relaxed space-y-3">
      <li>Google runs the nodes too: provisioning, upgrades, and maintenance</li>
      <li>Pay per pod (CPU, memory, storage). No node bill.</li>
      <li>PSA-restricted by default. Fewer footguns; also fewer escape hatches.</li>
      <li class="!font-semibold"><span class="text-[var(--p-primary)]">Google shipped this first. GA in Feb 2021. AWS caught up almost four years later with EKS Auto Mode (Dec 2024); Azure followed with AKS Automatic (GA Aug 2025).</span></li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
</style>

<!--
60s. The room is split — half think "GKE = Autopilot", half haven't tried
either. Standard = full Kubernetes contract back. Autopilot = closer to
Cloud Run; Google SREs run the nodes. We're demoing Standard because
that's where 90% of the production-close patterns live.

Source for the "first" claim: Google Cloud blog "Introducing GKE
Autopilot" (Feb 24, 2021); MSN/Datacenter Knowledge coverage at the
time confirmed no other major cloud had matched the hands-off node
management story.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Why Pulumi?</h1>
</div>

<!--
~3s. Three-card pivot. Set up the next three slides: real code, components,
ESC. Don't preview the punchlines.
-->

---

# Real code!

<div class="zoom-content">

<p class="!mt-8 !text-[1.4rem] !leading-relaxed">
  TypeScript, Python, Go, .NET, Java, YAML. Pick the language your team
  already speaks. Loops, conditionals, abstractions, tests.
</p>

<p class="!mt-6 !text-[1.4rem] !leading-relaxed">
  Not a config DSL.
</p>

<p class="!mt-6 !text-[1.4rem] !leading-relaxed">
  And it matters more in the agent era. AI coding agents already speak
  these languages fluently. They can read, refactor, and test the same
  code your humans do.
</p>

<p class="!mt-6 !text-[1.4rem] !leading-relaxed">
  A config DSL puts a translation layer between
  intent and execution which is not needed and gets in the way of agents doing their thing.
</p>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
</style>

<!--
~45s. The phrase that lands: "not a config DSL." Then the AI angle:
agents work directly with real code, no HCL translation step. Real
languages are testable, composable, sit alongside the rest of your code
— so the same agent that writes your app code can ship the infra it
runs on.
-->

---

# Components

<div class="zoom-content">

<p class="!mt-8 !text-[1.4rem] !leading-relaxed">
  A <code>ComponentResource</code> bundles a chunk of infra into one
  reusable unit.
</p>

<p class="!mt-6 !text-[1.4rem] !leading-relaxed">
  Today's whole cluster <strong>is</strong> one component call. You'll see
  the consumer code in today's demo.
</p>

<p class="!mt-6 !text-[1.4rem] !leading-relaxed">
  For more details on how to build your own components, see the "Reusable Component" section in the handouts.
</p>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
</style>

<!--
~30s. Plant the seed for the Act 2.5 payoff. Don't show the code yet —
the surprise is the size of the consumer file when we get there.
-->

---

# ESC for credentials and config

<div class="zoom-content">

<p class="!mt-8 !text-[1.3rem] !leading-relaxed">
  One of my favourite things in Pulumi Cloud.
</p>

<p class="!mt-6 !text-[1.3rem] !leading-relaxed">
  Short-lived OAuth tokens via OIDC, stack config, and secrets, all in one
  environment your <code>Pulumi.dev.yaml</code> references by name. No
  <code>.env</code> files on a laptop. No <code>gcloud auth login</code> needed.
</p>

<p class="!mt-6 !text-[1.3rem] !leading-relaxed">
  Humans and AI agents can both run <code>pulumi up</code> here without setting anything up locally. Credentials and config live in one place, so new teammates (and agents) can start working in minutes.
</p>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
~30s. The line that gets the security folks nodding: "no static creds on
a laptop." Mention OIDC briefly. The example file lives in
00-infrastructure/Pulumi.dev.yaml in the repo.
-->

---

# And there is so much more...

<div class="platform-image">
  <img src="/pulumi-platform.png" alt="Pulumi platform — IaC, Neo, Insights, ESC, IDP, plus Supergraph, Policy, and Workflow" />
</div>

<style scoped>
:deep(.pulumi-footer) {
  display: none !important;
}
.platform-image {
  position: absolute;
  inset: 0;
  margin-top: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
}
.platform-image img {
  width: 92%;
  height: 92%;
  object-fit: contain;
}
:deep(h1) {
  position: relative;
  z-index: 10;
}
</style>

<!--
~30s. ESC was just one slice. Walk left-to-right across the diagram
once: IaC (what we're using today), Neo (the AI control plane), Insights
(infra discovery), ESC (just covered), IDP (self-service), plus the
Supergraph / Policy / Workflow cross-cutting layers. Don't go deep on
any of them — the message is "the platform is bigger than what fits in
this workshop."
-->

---

# The whole picture

<div class="picture-wrap">

```mermaid {scale: 1.1, theme: 'base', themeVariables: { 'background': 'transparent', 'primaryColor': '#1f1d3a', 'primaryTextColor': '#e9e7ff', 'primaryBorderColor': '#7e6bff', 'lineColor': '#9b8cff', 'clusterBkg': '#15132c', 'clusterBorder': '#5b4cd6', 'fontFamily': 'Inter, ui-sans-serif, system-ui', 'fontSize': '18px' } }
flowchart LR
  subgraph project["Google Cloud · pulumi-development"]
    direction TB
    subgraph vpc["VPC · Cloud Router · Cloud NAT"]
      subgraph cluster["GKE Standard · regional · Dataplane V2"]
        direction TB
        sys["<b>system pool</b><br/>kube-dns · csi · metrics-agent"]
        wkld["<b>workload pool</b><br/>adk · podinfo · flux-system"]
        spot["<b>workload-spot</b><br/>fault-tolerant batch"]
      end
    end
    backup["<b>Backup for GKE</b><br/>daily plan"]
    obs["<b>Observability</b><br/>Logging · Monitoring<br/>Managed Prometheus · Trace"]
    vertex["<b>Vertex AI</b><br/>Gemini 2.5 Flash"]
    iam["<b>adk-vertex GSA</b><br/>Workload Identity"]
  end

  cluster -. backup .-> backup
  cluster -. logs · metrics · traces .-> obs
  wkld -. KSA→GSA via WI .-> iam
  iam -. tokens .-> vertex

  classDef pool fill:#2a2456,stroke:#7e6bff,stroke-width:1.5px,color:#f3f1ff;
  classDef svc fill:#1a2c4a,stroke:#5db0ff,stroke-width:1.5px,color:#e6f1ff;
  classDef ai fill:#3a1f4a,stroke:#c77bff,stroke-width:1.5px,color:#f7e9ff;
  class sys,wkld,spot pool;
  class backup,obs svc;
  class vertex,iam ai;
```

</div>


<style scoped>
.picture-wrap {
  margin-top: 4rem;
  display: flex;
  justify-content: center;
}
.picture-wrap :deep(svg) {
  width: 100% !important;
  max-width: 1500px !important;
  height: auto !important;
  filter: drop-shadow(0 8px 24px rgba(126, 107, 255, 0.18));
}
</style>

<!--
60s. Don't read every box. Walk left-to-right: "the cluster, three pools,
backup, observability, the agent's identity reaching Vertex." Each piece
gets its own slide in Act 2. This is the map.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Now make it real.</h1>
</div>

<!--
Act 2 divider. ~3s. Each layer that turns a tutorial cluster into a
production-close one gets its own slide. We're not building it live —
the cluster is already up. We're touring what's there, why each layer
matters, and what the Pulumi code looks like.
-->

---

# The "production-close" checklist

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div>
    <div class="gpu-caption gpu-caption--muted">Networking + identity</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Custom VPC, private nodes, Cloud NAT</li>
      <li>Dataplane V2 (Cilium / eBPF)</li>
      <li>Workload Identity, no service-account JSON keys</li>
      <li>Three node pools: system, workload, spot</li>
    </ul>
  </div>
  <div>
    <div class="gpu-caption gpu-caption--muted">Security + governance</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Pod Security Admission, NetworkPolicy, CCNP</li>
      <li>ResourceQuota + LimitRange per namespace</li>
      <li>Backup for GKE on a daily plan, with cross-region restore</li>
      <li>Full observability: logs, metrics, traces, dashboards</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
~45s. Set the scope. Audience nods if they recognize what's missing in
their own clusters. Then walk into network.
-->

---

# Network: VPC, private nodes, Cloud NAT

<div class="grid grid-cols-2 gap-10 mt-4">
  <div>
    <ul class="!mt-2 !text-[1.5rem] !leading-relaxed space-y-3">
      <li>Custom VPC with secondary IP ranges for pods (10.20.0.0/14) and services (10.24.0.0/20)</li>
      <li>Nodes get only private IPs; public traffic goes through Cloud NAT</li>
      <li>Control plane on its own /28, with <code>master_authorized_networks</code> limiting API access</li>
      <li class="text-[var(--p-fg-muted)]"><em>Workshop relaxation</em>: master is open to <code>0.0.0.0/0</code> so we can reach it. In production, you should lock it to a corporate CIDR or use a private endpoint.</li>
    </ul>
  </div>
  <div class="big-code">

```ts
new gcp.compute.Network("vpc", {
  autoCreateSubnetworks: false,
});

new gcp.compute.Subnetwork("subnet", {
  ipCidrRange: "10.10.0.0/20",
  secondaryIpRanges: [
    { rangeName: "pods", ipCidrRange: "10.20.0.0/14" },
    { rangeName: "services", ipCidrRange: "10.24.0.0/20" },
  ],
  privateIpGoogleAccess: true,
});

new gcp.compute.RouterNat("nat", {
  natIpAllocateOption: "AUTO_ONLY",
  sourceSubnetworkIpRangesToNat: "ALL_SUBNETWORKS_ALL_IP_RANGES",
});
```

  </div>
</div>

<!--
~75s. Three resources: VPC, subnet with secondaries, NAT. The secondary
ranges are the tricky bit for newcomers, so explain that pods and
services get IPs from these CIDRs, not the primary range. Cloud NAT
lets private nodes reach public services (image pulls, googleapis.com).

Note: the snippet is illustrative. Real code also needs `network` on the
subnet and `router` plus `region` on the RouterNat.
-->

---

# Cluster: Dataplane V2, Workload Identity, Shielded

<div class="grid grid-cols-2 gap-10 mt-4">
  <div>
    <ul class="!mt-2 !text-[1.35rem] !leading-relaxed space-y-3">
      <li><strong>Dataplane V2</strong>: Cilium / eBPF, GCP's recommended dataplane. NetworkPolicy, FQDN, and Hubble flow visibility built in, no separate CNI</li>
      <li><strong>Workload Identity</strong>: pods get GCP identities via KSA → GSA binding</li>
      <li><strong>Shielded Nodes</strong>: verified boot and integrity monitoring</li>
      <li><strong>Release channel</strong> <code>REGULAR</code> for auto-upgrade on a predictable cadence</li>
      <li><strong>Backup-for-GKE addon</strong> + control-plane logging</li>
    </ul>
  </div>
  <div class="big-code">

```ts
new gke.Module("workshop", {
  // ...
  datapath_provider: "ADVANCED_DATAPATH",
  monitoring_enable_observability_metrics: true,
  monitoring_enable_observability_relay: true,
  enable_cilium_clusterwide_network_policy: true,
  identity_namespace: "${project}.svc.id.goog",
  enable_shielded_nodes: true,
  release_channel: "REGULAR",
  gke_backup_agent_config: true,
  // ...
});
```

  </div>
</div>

<aside class="info-card">
  <div class="info-card__label">KSA, GSA?</div>
  <ul>
    <li><strong>KSA</strong> = Kubernetes Service Account, the identity a pod runs as inside the cluster.</li>
    <li><strong>GSA</strong> = Google Service Account, the identity a workload uses against GCP APIs.</li>
    <li>Workload Identity binds the two so a pod can call Vertex AI (or any GCP service) as the GSA, no JSON keys involved.</li>
  </ul>
</aside>

<!--
~75s. Each flag has a story. Dataplane V2 is the foundation for the
NetworkPolicy slides later. WI is the foundation for the agent slide.
The two `monitoring_enable_observability_*` flags get Hubble metrics
into the Cloud Console; without them, the UI says "Dataplane V2:
Disabled" even though the dataplane is active.

Note: snake_case args mean this is the workshop's own component
wrapping terraform-google-modules style. Raw `gcp.container.Cluster`
uses camelCase and nested config objects.
-->

---

# Node pools: system / workload / workload-spot

<div class="grid grid-cols-3 gap-6 mt-6">
  <div class="gpu-card gpu-card--muted pool-card">
    <div class="gpu-caption gpu-caption--muted">system</div>
    <ul class="!mt-4 !text-[1.15rem] !leading-relaxed space-y-2">
      <li><code>e2-standard-2</code></li>
      <li>1–2 nodes per zone</li>
      <li class="!font-semibold">Tainted <code>gke-managed-components</code></li>
      <li>kube-dns, csi, metrics-agent</li>
      <li>Never Spot</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary pool-card">
    <div class="gpu-caption gpu-caption--accent">workload</div>
    <ul class="!mt-4 !text-[1.15rem] !leading-relaxed space-y-2">
      <li><code>e2-standard-4</code></li>
      <li>1–5 nodes per zone</li>
      <li>No taints, apps land here by default</li>
      <li>flux, adk-agent, podinfo</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--accent pool-card">
    <div class="gpu-caption gpu-caption--accent">workload-spot</div>
    <ul class="!mt-4 !text-[1.15rem] !leading-relaxed space-y-2">
      <li><code>e2-standard-4</code> · <strong>Spot</strong></li>
      <li>0–5 nodes per zone</li>
      <li>30s eviction notice</li>
      <li>Auto-tainted <code>cloud.google.com/gke-spot</code></li>
      <li>Fault-tolerant batch only</li>
    </ul>
  </div>
</div>

<aside class="info-card">
  <div class="info-card__label">Why three pools</div>
  <p>
    The system pool stays predictable, the workload pool autoscales for
    traffic, and Spot soaks up batch on a separate billing line.
  </p>
</aside>

<style scoped>
.pool-card {
  display: flex;
  flex-direction: column;
}
.pool-card .gpu-caption {
  font-size: 1.6rem !important;
  letter-spacing: 0.04em;
  margin-bottom: 0.4rem;
}
.pool-card ul {
  margin-top: 0.75rem !important;
}
</style>

<!--
~75s. Three columns let the audience see "Spot is for batch, not
databases" visually. Mention the 30s eviction notice; that's the killer
caveat when teams put their MySQL on Spot.
-->

---

# Workload Identity: KSA → GSA → Vertex AI


<div class="grid grid-cols-2 gap-5 mt-4">
  <div class="wi-mermaid">

```mermaid {scale: 1.4, theme: 'base', themeVariables: { 'background': 'transparent', 'primaryColor': '#1f1d3a', 'primaryTextColor': '#e9e7ff', 'primaryBorderColor': '#7e6bff', 'lineColor': '#9b8cff', 'fontFamily': 'Inter, ui-sans-serif, system-ui', 'fontSize': '15px' } }
flowchart TB
  pod["<b>adk-agent pod</b><br/>KSA: adk/adk-agent"]
  ksa["<b>KSA annotation</b><br/>iam.gke.io/gcp-service-account"]
  gsa["<b>GSA</b><br/>adk-vertex@…"]
  vertex["<b>Vertex AI</b><br/>Gemini 2.5 Flash"]
  pod --> ksa
  ksa -- "iam.workloadIdentityUser" --> gsa
  gsa -- "roles/aiplatform.user" --> vertex

  classDef k8s fill:#2a2456,stroke:#7e6bff,stroke-width:1.5px,color:#f3f1ff;
  classDef gcp fill:#1a2c4a,stroke:#5db0ff,stroke-width:1.5px,color:#e6f1ff;
  classDef ai  fill:#3a1f4a,stroke:#c77bff,stroke-width:1.5px,color:#f7e9ff;
  class pod,ksa k8s;
  class gsa gcp;
  class vertex ai;
```

  </div>
  <div class="zoom-content">
    <div>
      <ul class="!mt-2 !text-[1.35rem] !leading-relaxed space-y-3">
        <li>The agent pod runs as KSA <code>adk/adk-agent</code></li>
        <li>That KSA is annotated with the GSA's email</li>
        <li>GSA has <code>roles/aiplatform.user</code> plus Cloud Trace agent</li>
        <li>WI binding lets the KSA impersonate the GSA</li>
        <li class="!font-semibold"><span class="!text-primary">Result: the pod gets Vertex tokens via the metadata server. No JSON keys on disk, ever.</span></li>
      </ul>
    </div>
  </div>
</div>



<style scoped>
.zoom-content { zoom: 1.3; }
</style>

<!--
~90s. This is the moment most attendees first really *get* Workload
Identity. Walk top to bottom on the diagram once. Then mention: the
only roles we grant are aiplatform.user and cloudtrace.agent, the
minimum permissions for what the agent actually does.
-->

---

# Pod Security Admission, NetworkPolicy, CCNP

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted policy-card">
    <div class="gpu-caption gpu-caption--muted">Pod Security Admission</div>
    <ul class="!mt-3 !text-[1.1rem] !leading-relaxed space-y-2">
      <li>Built into kube-apiserver, with three profiles: <code>privileged</code>, <code>baseline</code>, <code>restricted</code></li>
      <li><code>adk</code>: <code>enforce: restricted</code></li>
      <li><code>podinfo</code>: <code>enforce: baseline</code>, <code>audit/warn: restricted</code></li>
      <li>Set as namespace labels, no controller to install</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary policy-card">
    <div class="gpu-caption gpu-caption--accent">NetworkPolicy (per namespace)</div>
    <ul class="!mt-3 !text-[1.1rem] !leading-relaxed space-y-2">
      <li>Default-deny ingress + egress baseline</li>
      <li>Explicit allows: DNS, googleapis.com, monitoring scrape</li>
      <li>External LB ingress allowed via a separate rule</li>
      <li>Standard k8s NetworkPolicy, enforced by Dataplane V2</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--accent policy-card">
    <div class="gpu-caption gpu-caption--accent">CiliumClusterwideNetworkPolicy</div>
    <ul class="!mt-3 !text-[1.1rem] !leading-relaxed space-y-2">
      <li>Cluster-wide deny: pod egress to <code>169.254.169.254</code></li>
      <li>Exceptions: <code>kube-system</code>, <code>adk</code> (the only WI consumer)</li>
      <li>Defense-in-depth against SSRF and metadata-server abuse</li>
      <li>Requires <code class="!text-[0.8rem]">enable_cilium_clusterwide_network_policy</code> on the cluster</li>
    </ul>
  </div>
</div>

<style scoped>
.policy-card {
  display: flex;
  flex-direction: column;
}
.policy-card .gpu-caption {
  font-size: 1.4rem !important;
  letter-spacing: 0.04em;
  margin-bottom: 0.4rem;
}
.policy-card ul {
  margin-top: 0.75rem !important;
}
</style>

<!--
~90s. Three layers stacking: PSA gates pod admission, NetworkPolicy
gates namespace traffic, CCNP gates cluster-wide. The metadata-server
lockdown is the killer demo line: without this, every pod can request
a token from the metadata server, and an SSRF in any one of them is a
privilege escalation.
-->

---

# Logging: Cloud Logging, scoped by component

<div class="grid grid-cols-2 gap-10 mt-4">
  <div>
    <ul class="!mt-2 !text-[1.35rem] !leading-relaxed space-y-3">
      <li><strong>SYSTEM_COMPONENTS</strong>: kubelet, container runtime, GKE addons</li>
      <li><strong>WORKLOADS</strong>: every pod's stdout/stderr</li>
      <li><strong>APISERVER</strong>: every API request (audit trail)</li>
      <li><strong>SCHEDULER</strong>: pod scheduling decisions</li>
      <li><strong>CONTROLLER_MANAGER</strong>: replicaset, deployment, service controllers</li>
    </ul>
    <p class="!mt-4 !text-[1.05rem] !leading-relaxed text-[var(--p-fg-muted)]">
      Each is a separate write-quota line. Control-plane logs (the bottom three) are
      the ones you're missing in tutorial clusters, and the ones you need for incident
      response.
    </p>
  </div>
  <div class="big-code">

```ts
logging_enabled_components: [
  "SYSTEM_COMPONENTS",
  "WORKLOADS",
  "APISERVER",
  "CONTROLLER_MANAGER",
  "SCHEDULER",
],
```

<p class="!mt-6 !text-[1.05rem] !leading-relaxed">
Logs land in Cloud Logging under
<code>k8s_container</code> (workloads) and
<code>k8s_control_plane_component</code> (apiserver, scheduler, controller-manager).
Filter by <code>resource.labels.cluster_name</code> + <code>namespace_name</code>.
</p>

  </div>
</div>

<!--
~75s. The five components map 1:1 to the GKE feature flag. Production-close
clusters always have all five; tutorial clusters usually have just SYSTEM
and WORKLOADS, missing the audit trail. Mention: enabling APISERVER costs
some Cloud Logging quota. Point at
https://cloud.google.com/kubernetes-engine/docs/concepts/about-logs.
-->

---

# Metrics: Managed Prometheus + GKE observability

<div class="grid grid-cols-2 gap-10 mt-4">
  <div>
    <ul class="!mt-2 !text-[1.35rem] !leading-relaxed space-y-3">
      <li><strong>Managed Prometheus</strong>: GCP-managed collectors that scrape <code>PodMonitoring</code> CRs and write to Cloud Monitoring</li>
      <li><strong>kube-state-metrics</strong>: POD, DEPLOYMENT, HPA, STATEFULSET, STORAGE counters</li>
      <li><strong>Node-level</strong>: KUBELET + CADVISOR (cpu, memory, network per container)</li>
      <li><strong>Control plane</strong>: APISERVER, SCHEDULER, CONTROLLER_MANAGER metrics</li>
    </ul>
    <p class="!mt-4 !text-[1.05rem] !leading-relaxed text-[var(--p-fg-muted)]">
      Apps drop a <code>PodMonitoring</code> CR scoped to their namespace and the
      collector picks them up automatically. No Prometheus server to operate.
    </p>
  </div>
  <div class="big-code">

```yaml
apiVersion: monitoring.googleapis.com/v1
kind: PodMonitoring
metadata:
  name: adk-agent
  namespace: adk
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: adk-agent
  endpoints:
    - port: http
      interval: 30s
      path: /metrics
```

<p class="!mt-4 !text-[1.05rem] !leading-relaxed">
Apps expose <code>/metrics</code> in the Prometheus text format, the
collector scrapes on the configured interval, and samples land in Cloud
Monitoring as <code>prometheus.googleapis.com/...</code> series.
</p>

  </div>
</div>

<!--
~75s. The whole observability stack with no Prometheus to run. Mention:
the alternative is to deploy kube-prometheus-stack and operate it
yourself. Managed Prometheus is the same Prometheus query language and
the same /metrics scrape, just no operational overhead.
-->

---

# Dashboards: custom + GKE pre-built

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="gpu-card gpu-card--primary dashboard-card">
    <div class="gpu-caption gpu-caption--accent">Workshop dashboard (custom)</div>
    <ul class="!mt-3 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Node count by pool</li>
      <li>HPA current vs desired (per-app)</li>
      <li>Pod count by namespace</li>
      <li>Container restart rate</li>
      <li>API-server p95 latency</li>
      <li>Podinfo HTTP rate (PromQL)</li>
    </ul>
    <p class="!mt-3 !text-[0.95rem] text-[var(--p-fg-muted)]">JSON template in the repo, rendered by Pulumi at apply time.</p>
  </div>
  <div class="gpu-card gpu-card--muted dashboard-card">
    <div class="gpu-caption gpu-caption--muted">GKE pre-built dashboards</div>
    <ul class="!mt-3 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Cluster overview</li>
      <li>Workloads (per-deployment)</li>
      <li>Namespaces (resource consumption)</li>
      <li>Dataplane V2 observability (Hubble flows)</li>
      <li>Cluster security posture (PSA, NetworkPolicy)</li>
    </ul>
    <p class="!mt-3 !text-[0.95rem] text-[var(--p-fg-muted)]">Auto-enabled when <code>monitoring_enabled_components</code> covers the right metric sources.</p>
  </div>
</div>

<style scoped>
.dashboard-card {
  display: flex;
  flex-direction: column;
}
.dashboard-card .gpu-caption {
  font-size: 1.4rem !important;
  letter-spacing: 0.04em;
  margin-bottom: 0.4rem;
}
</style>

<!--
~60s. The custom dashboard is the workshop's signature view; point at
the JSON in the repo. Pre-built dashboards are what you get for free
from enabling the metric sources. Don't read every tile, just the ones
that prove "this is what you'd actually look at during an incident."
-->

---

# Backup for GKE

<div class="grid grid-cols-2 gap-10 mt-4">
  <div>
    <ul class="!mt-2 !text-[1.35rem] !leading-relaxed space-y-3">
      <li>GCP-native: addon on the cluster plus a <code>BackupPlan</code> resource</li>
      <li>Captures both <strong>workload state</strong> (PVs and secrets) and <strong>Kubernetes resources</strong> (manifests, CRs)</li>
      <li>Cross-region <strong>and</strong> cross-project restore</li>
      <li>Replicated across zones in the source region, so a single-zone outage doesn't lose backups</li>
      <li>Daily plan, 7-day retention in this workshop</li>
      <li class="!font-semibold">Replaces Velero on GCP</li>
    </ul>
  </div>
  <div class="big-code">

```ts
new gcp.gkebackup.BackupPlan("default", {
  cluster: cluster.cluster_id,
  location: region,
  backupConfig: {
    includeVolumeData: true,
    includeSecrets: true,
    allNamespaces: true,
  },
  backupSchedule: { cronSchedule: "0 2 * * *" },
  retentionPolicy: {
    backupDeleteLockDays: 0,
    backupRetainDays: 7,
  },
});
```

  </div>
</div>

<!--
~60s. Mention Velero by name; it's what most teams used. Backup-for-GKE
is the GCP-native equivalent and includes things Velero doesn't (zone
replication of the artifacts, cross-project restore). For the workshop:
0-day delete-lock so attendees can clean up. Production: 7+ days.
-->

---

# Flux GitOps: operator + instance

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="wi-mermaid">

```mermaid {scale: 1.15, theme: 'base', themeVariables: { 'background': 'transparent', 'primaryColor': '#1f1d3a', 'primaryTextColor': '#e9e7ff', 'primaryBorderColor': '#7e6bff', 'lineColor': '#9b8cff', 'fontFamily': 'Inter, ui-sans-serif, system-ui', 'fontSize': '14px' } }
flowchart TB
  helm1["<b>helm release</b><br/>flux-operator chart"]
  crds["FluxInstance CRD installed"]
  helm2["<b>helm release</b><br/>flux-instance chart"]
  fi["<b>FluxInstance</b><br/>spec.sync points at GitHub"]
  gr["GitRepository<br/>auto-created"]
  k["Kustomization<br/>auto-created"]
  apps["<b>adk-agent, podinfo</b><br/>continuously reconciled"]
  helm1 --> crds --> helm2 --> fi
  fi -. operator reconciles .-> gr & k
  k --> apps

  classDef helm fill:#2a2456,stroke:#7e6bff,stroke-width:1.5px,color:#f3f1ff;
  classDef cr   fill:#1a2c4a,stroke:#5db0ff,stroke-width:1.5px,color:#e6f1ff;
  classDef app  fill:#3a1f4a,stroke:#c77bff,stroke-width:1.5px,color:#f7e9ff;
  class helm1,helm2 helm;
  class crds,fi,gr,k cr;
  class apps app;
```

  </div>
  <div>
    <ul class="!mt-2 !text-[1.35rem] !leading-relaxed space-y-3">
      <li><strong>Two Helm releases:</strong> the <code>flux-operator</code> chart installs the operator and CRDs; the <code>flux-instance</code> chart installs the <code>FluxInstance</code> CR</li>
      <li><code>FluxInstance.spec.sync</code> points at the GitOps repo and path</li>
      <li>The operator <strong>auto-creates</strong> the root <code>GitRepository</code> and <code>Kustomization</code>, so there's no kubectl bootstrap and no out-of-band wait loops</li>
      <li>Inner Kustomizations use <code>postBuild.substituteFrom</code> against a <code>cluster-vars</code> ConfigMap to inject project-specific values</li>
    </ul>
  </div>
</div>

<!--
~90s. The two-Helm-release pattern is the modern Flux-Operator way: no
kubectl, no race conditions on the FluxInstance CRD. Mention the
substituteFrom; that's how the GitOps YAML stays cluster-agnostic.
-->

---

# ADK agent: Vertex AI, Gemini 2.5 Flash

<div class="grid grid-cols-2 gap-10 mt-4">
  <div>
    <ul class="!mt-2 !text-[1.35rem] !leading-relaxed space-y-3">
      <li>Google ADK agent SDK (FastAPI) running on the workload pool</li>
      <li>Calls Vertex AI through the GenAI SDK, with no API key</li>
      <li>OTel exporters wired: spans to Cloud Trace, metrics to Cloud Monitoring, logs to Cloud Logging</li>
      <li>Reachable on a public LB (workshop convenience; production would put it behind IAP)</li>
      <li>Demo: the <code>capital_agent</code> tutorial app, with one tool: <code>get_capital_city(country)</code></li>
    </ul>
  </div>
  <div class="big-code">

```python
from google.adk.cli.fast_api import get_fast_api_app

app = get_fast_api_app(
    agents_dir=AGENT_DIR,
    web=True,
    otel_to_cloud=True,  # spans/metrics/logs
                         # to GCP via WI
)
```

<p class="!mt-4 !text-[1.05rem] !leading-relaxed">
That single function gives you Swagger at <code>/docs</code>, a web UI at
<code>/dev-ui/</code>, and OpenTelemetry spans for every tool call.
</p>

  </div>
</div>

<!--
~75s. The agent is the payoff demo. Save the actual prompt for the live
moment in Act 3. Here just establish: same agent code as Google's
tutorial, but landed on a cluster you'd actually defend.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The reusable component.</h1>
</div>

<!--
Act 2.5 divider. ~3s. The pivot moment: everything we just toured fits
in one component. The pedagogy: a 30-line consumer program replaces 280
lines of cluster bootstrapping.
-->

---

# 280 lines → 30 lines

<div class="shrink-grid">

<div class="grid grid-cols-2 gap-8 mt-20">
  <div class="gpu-card gpu-card--muted before-after-card big-code">
    <div class="gpu-caption gpu-caption--muted">Before: every consumer wrote this</div>

```ts
// VPC + subnet + router + NAT
const vpc = new gcp.compute.Network(...);
const subnet = new gcp.compute.Subnetwork(...);
new gcp.compute.RouterNat(...);

// GKE module call: 3 node pools, taints,
// labels, oauth scopes, observability flags,
// Dataplane V2, backup addon, ...
const cluster = new gke.Module("workshop", {
  // ... 120 lines of node pool config ...
});

// kubeconfig + k8s.Provider with deleteUnreachable
const clientConfig = gcp.organizations
  .getClientConfigOutput();
const kubeconfig = pulumi.all([...]).apply(...);

// Backup plan
new gcp.gkebackup.BackupPlan(...);

// + write kubeconfig file to disk
```

  </div>
  <div class="gpu-card gpu-card--primary before-after-card big-code">
    <div class="gpu-caption gpu-caption--accent">After: one component call</div>

```ts
import { GkeWorkshopCluster } from
  "@pulumi/gke-workshop";

const cluster = new GkeWorkshopCluster(
  "workshop",
  {
    projectId,
    region,
    clusterName: "gke-workshop",
  },
);

export const kubeconfig = cluster.kubeconfig;
```

<p class="!mt-6 !text-[1.1rem] !leading-relaxed">
Defaults: 3 pools, Dataplane V2 with Hubble, Backup-for-GKE on a daily plan,
PSA-ready namespaces. Override only what you need.
</p>

  </div>
</div>

</div>

<style scoped>
.shrink-grid { zoom: 0.9; }
.before-after-card {
  display: flex;
  flex-direction: column;
}
.before-after-card .gpu-caption {
  font-size: 1.3rem !important;
  letter-spacing: 0.04em;
  margin-bottom: 0.6rem;
}
.big-code :deep(pre),
.big-code :deep(code) {
  font-size: 1rem !important;
  line-height: 1.5 !important;
}
.big-code :deep(pre) { padding: 1rem 1.2rem !important; }
</style>

<!--
~90s. The visual win. Don't dwell on each line of the "before"; the
audience gets it from the volume alone. Then walk through the "after"
args: project, region, name. That's the contract.
-->

---

# Published to the registry

<div class="grid grid-cols-2 gap-10 mt-4">
  <div>
    <ul class="!mt-2 !text-[1.35rem] !leading-relaxed space-y-3">
      <li>Component lives at <code>02-component/</code> in this monorepo</li>
      <li><code>pulumi package publish &lt;repo-url&gt;@&lt;tag&gt;</code> uploads it to the Pulumi private registry</li>
      <li>Auto-generated SDKs in TypeScript, Python, Go, and .NET, so it's the same component in any language</li>
      <li>Consumers reference it via the <code>packages:</code> block in <code>Pulumi.yaml</code></li>
    </ul>
  </div>
  <div class="big-code">

```bash
# Author side, after merge + tag
pulumi package publish \
  https://github.com/pulumi/workshops/getting-started-with-kubernetes-google-cloud/02-component@0.6.0 \
  --publisher lumitorch \
  --readme ./README.md
```

```yaml
# 00-infrastructure/Pulumi.yaml
packages:
  gke-workshop: https://github.com/pulumi/workshops/getting-started-with-kubernetes-google-cloud/02-component@0.6.0
```

  </div>
</div>

<aside class="info-card">
  <div class="info-card__label">The platform-team payoff</div>
  <p>
    Write the component <strong>once</strong>. Every consuming team gets the
    production-close defaults for free, in their language of choice.
  </p>
</aside>

<style scoped>
.big-code :deep(pre),
.big-code :deep(code) {
  font-size: 0.95rem !important;
  line-height: 1.5 !important;
}
.big-code :deep(pre) { padding: 1rem 1.2rem !important; }
</style>

<!--
~75s. The platform-engineering payoff. Mention: requires Enterprise or
Business Critical plan for the private registry. Multi-language is the
hidden superpower; Python platform teams can ship a TypeScript-language
component to Go consumers without code changes.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Lifecycle.</h1>
</div>

<!--
Act 3 divider. ~3s. The day-to-day Pulumi loop and the "actually destroy
it" story. Most demos skip this; teardown is where state-management bugs
hide.
-->

---

# Neo CLI: preview → up → destroy

<div class="neo-wrap">
  <img src="/pulumi-neo.png" alt="pulumi neo terminal output: component analysis, stack outputs, repo layout" />
  <p class="neo-caption">We're going to use <strong>Pulumi Neo</strong> for that.</p>
</div>

<style scoped>
.neo-wrap {
  position: relative;
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}
.neo-wrap img {
  max-width: 100%;
  max-height: 38.5rem;
  height: auto;
}
.neo-caption {
  position: absolute;
  left: 50%;
  bottom: -1.0rem;
  transform: translateX(-50%);
  margin: 0 !important;
  padding: 0.7rem 1.4rem;
  text-align: center;
  font-size: 1.5rem !important;
  line-height: 1.4 !important;
  color: var(--p-fg);
  white-space: nowrap;
}
.neo-caption strong {
  color: var(--p-primary);
}
</style>

<!--
~45s. Skip the manual preview/up/destroy walkthrough; Neo handles it.
Drop the screenshot at slides/public/pulumi-neo.png. The pitch: Neo is
the Pulumi AI agent that runs the lifecycle for you, so you don't
babysit pulumi up at 11pm.
-->

---

# Live: the agent talking to Vertex

<div class="mt-6 big-code">

```bash
ADK_LB=$(kubectl -n adk get svc adk-agent \
  -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

curl -X POST "http://$ADK_LB/apps/capital_agent/users/me/sessions/s1" \
  -H 'Content-Type: application/json' -d '{}'

curl -X POST "http://$ADK_LB/run" -H 'Content-Type: application/json' -d '{
  "appName": "capital_agent",
  "userId": "me", "sessionId": "s1",
  "newMessage": { "role": "user", "parts": [{"text": "What is the capital of France?"}] }
}' | jq
```

</div>

<p class="!mt-6 !text-[1.15rem] !leading-relaxed">
Tool-call routing: <code>get_capital_city("France") → "Paris"</code> →
<em>"The capital of France is Paris."</em>
Spans for every tool call land in
<a class="text-[var(--p-primary)]" href="https://console.cloud.google.com/traces/list">Cloud Trace</a>.
</p>

<!--
~3 min including watching the response come back and pulling up Cloud
Trace. If time is tight, skip the curl and use the /dev-ui/ in the
browser. Then pivot to: "this is the same flow your team would put any
agent through. The platform is the boring part."
-->

---

# Watch the autoscaler do real work

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="big-code">

```bash
PODINFO=$(kubectl -n podinfo get svc podinfo \
  -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Load test
hey -z 60s -c 50 http://$PODINFO:9898

# In another terminal
kubectl -n podinfo get hpa -w   # 1 → 10 replicas
kubectl get nodes -w            # cluster autoscaler adds nodes
```

  </div>
  <div>
    <ul class="!mt-2 !text-[1.35rem] !leading-relaxed space-y-3">
      <li><strong>HPA scales horizontally</strong> on the workload pool, with replica count climbing as CPU passes the target</li>
      <li><strong>Cluster autoscaler</strong> adds nodes when pending pods can't schedule</li>
      <li><strong>VPA</strong> (off by default for this app) would resize requests vertically</li>
      <li>Custom dashboard tile <em>"HPA: current vs. desired (podinfo)"</em> lights up in real time</li>
    </ul>
  </div>
</div>

<!--
~5 min. The load test eats ~3 min before HPA visibly scales. Talk
through what's happening; don't wait silently. Cut to the dashboard
midway so the audience sees the metric tile breathing.
-->

---

# Teardown the safe way

<div class="grid grid-cols-2 gap-10 mt-4">
  <div>
    <ul class="!mt-2 !text-[1.35rem] !leading-relaxed space-y-3">
      <li><code>retainOnDelete: true</code> on both Helm releases: Pulumi removes them from state without calling <code>helm uninstall</code>, and the cluster deletion sweeps the in-cluster artifacts</li>
      <li><code>deleteUnreachable: true</code> on the kubernetes Provider: if the API is offline mid-destroy, drop resources from state instead of erroring</li>
      <li>Together: no FluxInstance finalizer hangs, no stale-token 401s</li>
    </ul>
  </div>
  <div class="big-code">

```ts
new k8s.Provider("gke", {
  kubeconfig: cluster.kubeconfig,
  deleteUnreachable: true,
});

new k8s.helm.v3.Release(
  "flux-operator",
  { /* ... */ },
  {
    provider: k8sProvider,
    retainOnDelete: true,
  },
);
```

  </div>
</div>

<!--
~75s. This is the slide that saves you from the 11pm "why won't my stack
destroy" Slack message. War-story tone: "we hit this in this very
workshop's prep, here's the fix."
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Where to go next.</h1>
</div>

<!--
Close divider. ~3s. The production-close cluster has a few intentional
gaps for the workshop. Each one is a one-liner to flip in production.
-->

---

<div class="full-bleed-image">
  <img src="/get-started.png" alt="Get started — it's free · app.pulumi.com/signup" />
</div>

<style scoped>
:deep(.pulumi-accent-bar),
:deep(.pulumi-footer) {
  display: none !important;
}
:deep(.pulumi-slide-body) {
  padding: 0 !important;
}
.full-bleed-image {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}
.full-bleed-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>

<!--
~10s reprise of the get-started CTA before the production-hardening
deep dive. Same image as Act 0; reminds attendees to sign up while
they have the link in front of them.
-->

---

# Production hardening: the next four flags

<div class="grid grid-cols-2 gap-10 mt-4">
  <div class="gpu-card gpu-card--primary harden-card">
    <div class="gpu-caption gpu-caption--accent">In the cluster</div>
    <ul class="!mt-3 !text-[1.2rem] !leading-relaxed space-y-2">
      <li><strong>Restrict <code>master_authorized_networks</code></strong> to corporate / CI CIDRs, or use a private endpoint</li>
      <li><strong>CMEK on etcd:</strong> <code>database_encryption</code> with a customer-managed KMS key</li>
      <li><strong>Binary Authorization</strong> so only signed images run</li>
      <li><strong>Backup-delete-lock</strong> to meet your compliance retention floor</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--accent harden-card">
    <div class="gpu-caption gpu-caption--accent">Around the cluster</div>
    <ul class="!mt-3 !text-[1.2rem] !leading-relaxed space-y-2">
      <li><strong>Multi-region failover:</strong> two clusters in a Fleet plus Multi-Cluster Ingress</li>
      <li><strong>IAP / Cloud Armor</strong> in front of the agent and Flux UI, so you can drop the public LBs</li>
      <li><strong>Org policies</strong> to enforce node SA permissions and deny external IPs at the org level</li>
      <li><strong>Config Sync</strong>, Anthos GitOps for fleet-wide policy</li>
    </ul>
  </div>
</div>

<style scoped>
.harden-card {
  display: flex;
  flex-direction: column;
}
.harden-card .gpu-caption {
  font-size: 1.4rem !important;
  letter-spacing: 0.04em;
  margin-bottom: 0.4rem;
}
</style>

<!--
~75s. Keep this honest; these are intentionally relaxed for the
workshop. Each is a one-liner to flip in production. Mention which need
GKE Enterprise or Anthos (Config Sync, Policy Controller).
-->

---

# Recap

<div class="zoom-content">

<div class="recap-wrap">
  <div class="gpu-card gpu-card--primary recap-card">
    <div class="gpu-caption gpu-caption--accent">What we did in 60 minutes</div>
    <ul class="!mt-3 !text-[1.4rem] !leading-relaxed space-y-3">
      <li>Production-close GKE cluster: Dataplane V2, 3 pools, WI, PSA, NetworkPolicy, CCNP</li>
      <li>Full GCP-native observability: Logging, Metrics, Trace, Dashboards</li>
      <li>Backup-for-GKE on a daily plan, with cross-region restore</li>
      <li>Flux GitOps reconciling apps and the ADK agent</li>
      <li>One published Pulumi component, 30-line consumer, multi-language</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.recap-wrap {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}
.recap-card {
  display: flex;
  flex-direction: column;
  max-width: 60rem;
}
.recap-card .gpu-caption {
  font-size: 1.5rem !important;
  letter-spacing: 0.04em;
  margin-bottom: 0.6rem;
}
</style>

<!--
~60s. Don't read the whole list. Mention the repo URL twice (once verbal,
once on screen). Then thanks + Q&A.
-->

---

# Continue your Pulumi journey!

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-6">
  <div class="gpu-card gpu-card--primary journey-card">
    <div class="journey-card__title">Join the Pulumi Community Slack!</div>
    <p class="journey-card__body">
      Head to <a class="text-[var(--p-primary)]" href="https://slack.pulumi.com/">slack.pulumi.com</a>
      and join <code>#google-cloud</code>.
    </p>
  </div>
  <div class="gpu-card gpu-card--primary journey-card">
    <div class="journey-card__title">Sign up for a Pulumi Cloud account!</div>
    <p class="journey-card__body">
      Sign up for a free-forever individual account, or start a trial organization
      to check out Pulumi's full set of features.
    </p>
  </div>
  <div class="gpu-card gpu-card--accent journey-card">
    <div class="journey-card__title">Join us for our next workshops!</div>
    <p class="journey-card__body">
      Link in the <strong>Handouts</strong> tab.
    </p>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.45; }
.journey-card {
  display: flex;
  flex-direction: column;
}
.journey-card__step {
  font-family: var(--slidev-font-mono);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--p-primary);
  letter-spacing: 0.06em;
  margin-bottom: 0.4rem;
}
.journey-card__title {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.25;
  margin-bottom: 0.9rem;
  color: var(--p-fg);
}
.journey-card__body {
  font-size: 1.15rem;
  line-height: 1.55;
  margin: 0 !important;
  color: var(--p-fg);
}
</style>

<!--
~45s. Three CTAs for the audience after the workshop. Slack is where
ongoing questions land, the Cloud account unlocks ESC + the registry,
and the next workshops link is in the handouts tab on the platform.
-->

---

<div class="teaser-wrap">
  <img src="/workshop-teaser.png" alt="Upcoming workshop on Agentic Skills" />
  <div class="teaser-overlay">
    <p>And definitely don't miss our dedicated workshop around <strong>Agentic Skills</strong>!</p>
  </div>
  <a class="teaser-qr" href="https://www.pulumi.com/events/getting-started-with-devops-ai-skills/" target="_blank" rel="noopener">
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https%3A%2F%2Fwww.pulumi.com%2Fevents%2Fgetting-started-with-devops-ai-skills%2F" alt="QR code: pulumi.com/events/getting-started-with-devops-ai-skills" />
  </a>
</div>

<style scoped>
:deep(.pulumi-accent-bar),
:deep(.pulumi-footer) {
  display: none !important;
}
:deep(.pulumi-slide-body) {
  padding: 0 !important;
}
.teaser-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  overflow: hidden;
}
.teaser-wrap img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.teaser-overlay {
  position: absolute;
  left: 50%;
  bottom: 12%;
  transform: translateX(-50%);
  max-width: 70%;
  padding: 1.4rem 2.2rem;
  background: rgba(15, 12, 36, 0.78);
  backdrop-filter: blur(8px);
  border: 1px solid color-mix(in srgb, var(--p-primary) 50%, transparent);
  border-radius: 0.75rem;
  text-align: center;
}
.teaser-overlay p {
  margin: 0 !important;
  font-size: 1.7rem;
  line-height: 1.35;
  color: var(--p-fg);
}
.teaser-overlay strong {
  color: var(--p-primary);
}
.teaser-qr {
  position: absolute;
  right: 2rem;
  bottom: 2rem;
  width: 9rem;
  height: 9rem;
  background: white;
  padding: 0.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}
.teaser-qr img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>

<!--
~10s teaser. Drop the real teaser at slides/public/workshop-teaser.png
(currently a 1×1 placeholder). Pitch the upcoming Agentic Skills workshop.
-->

---

# Questions?

<div class="contact-grid">
  <div class="contact-card">
    <div class="contact-card__avatar">
      <img src="https://github.com/dirien.png" alt="Engin Diri" />
    </div>
    <div class="contact-card__name">Engin Diri</div>
    <div class="contact-card__role">Pulumi</div>
    <div class="contact-card__handles">
      <span><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg> dirien</span>
      <span><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.26 2.37 4.26 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg> engin-diri</span>
    </div>
    <div class="contact-card__qr">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https%3A%2F%2Fwww.linkedin.com%2Fin%2Fengin-diri%2F" alt="QR code: linkedin.com/in/engin-diri" />
    </div>
  </div>

  <div class="contact-card">
    <div class="contact-card__avatar contact-card__avatar--icon">
      <svg viewBox="0 0 16 16" width="80" height="80" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
    </div>
    <div class="contact-card__name">Slides + Demo</div>
    <div class="contact-card__role contact-card__role--mono">github.com/pulumi/workshops/<wbr/>tree/main/getting-started-<wbr/>with-kubernetes-google-cloud</div>
    <div class="contact-card__qr">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https%3A%2F%2Fgithub.com%2Fpulumi%2Fworkshops%2Ftree%2Fmain%2Fgetting-started-with-kubernetes-google-cloud" alt="QR code: workshop repo" />
    </div>
  </div>
</div>

<style scoped>
.contact-grid {
  display: grid;
  grid-template-columns: auto auto;
  justify-content: center;
  gap: 6rem;
  margin-top: 2.5rem;
  align-items: start;
}
.contact-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.6rem;
}
.contact-card__avatar {
  width: 9rem;
  height: 9rem;
  border-radius: 9999px;
  overflow: hidden;
  border: 2px solid var(--p-primary);
  background: var(--p-bg-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
}
.contact-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.contact-card__avatar--icon {
  border-color: color-mix(in srgb, var(--p-primary) 60%, var(--p-border));
  color: var(--p-primary);
}
.contact-card__name {
  font-size: 1.7rem;
  font-weight: 700;
  margin-top: 0.5rem;
  color: var(--p-fg);
}
.contact-card__role {
  font-size: 1.15rem;
  color: var(--p-fg-muted);
}
.contact-card__role--mono {
  font-family: var(--slidev-font-mono);
  font-size: 0.95rem;
  line-height: 1.45;
  word-break: break-all;
  max-width: 22rem;
}
.contact-card__handles {
  display: flex;
  gap: 1.25rem;
  font-size: 1rem;
  color: var(--p-fg-muted);
  align-items: center;
}
.contact-card__handles span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.contact-card__qr {
  margin-top: 1rem;
  background: white;
  padding: 0.6rem;
  border-radius: 0.5rem;
  width: 11rem;
  height: 11rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.contact-card__qr img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>

<!--
~5 min Q&A budget. If no questions for 10s, prompt with: "what would
you flip first when you take this back to your team?"

Avatar pulls from github.com/dirien.png (GitHub's auto-served profile
photo). QR codes are generated on the fly via api.qrserver.com. To use
local assets instead, drop files at:
  slides/public/avatars/engin.jpg
  slides/public/qr/engin.png
  slides/public/qr/repo.png
and swap the image src values.
-->
