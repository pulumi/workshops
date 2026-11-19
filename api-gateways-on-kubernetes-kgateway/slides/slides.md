---
theme: "@pulumi/slidev-theme"
title: "API Gateways on Kubernetes with kgateway"
info: |
  API Gateways on Kubernetes with kgateway: Provision a Gateway API controller, a Gateway and HTTPRoutes as code with Pulumi IaC.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/api-gateways-on-kubernetes-kgateway
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
    API Gateways on Kubernetes with kgateway
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Provision a Gateway API controller, a Gateway and HTTPRoutes as code with Pulumi IaC
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>
<!--
(0.5 min) Welcome. Title, then who is in the room and what we build today: Gateway API resources on Kubernetes, with kgateway, as code.
-->

---

<div class="absolute inset-0 flex items-center px-24 gap-20">
  <div class="flex-shrink-0">
    <img src="/img/speaker-placeholder.svg" class="w-[28rem] rounded-2xl shadow-xl border-4" style="border-color: rgba(126,107,255,0.45)" alt="Speaker Name" />
  </div>
  <div class="flex-1">
    <h1 class="!text-[7rem] !leading-[1.02] !font-semibold !tracking-tight !mb-4 !text-[var(--p-primary)]">Speaker Name</h1>
    <p class="!text-[2.2rem] !leading-relaxed !m-0 opacity-90">
      Role at <strong class="!text-[var(--p-primary)]">Pulumi</strong>
    </p>
    <div class="!mt-8 flex items-center gap-8 !text-[1.5rem] opacity-70">
      <span class="flex items-center gap-2"><carbon-logo-x /> @handle</span>
      <span class="flex items-center gap-2"><carbon-logo-linkedin /> handle</span>
      <span class="flex items-center gap-2"><carbon-logo-github /> handle</span>
    </div>
    <p class="!mt-10 !text-[1.75rem] !leading-relaxed opacity-70 !m-0">
      One line on what they build.<br/>
      One line on why this topic matters to them.
    </p>
  </div>
</div>
<!--
(1 min) Speaker slide. Placeholder until the speaker is confirmed. Say who you are and what you do with Kubernetes ingress.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>
<!--
(0.25 min) Divider. Housekeeping first.
-->

---

# Housekeeping

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>Be chatty in the chat tab</li>
  <li>Ask questions in the Q&amp;A tab</li>
  <li>The handouts tab has slides and scripts</li>
  <li>The recording link comes by email</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>
<!--
(1 min) Housekeeping: chat tab for chatter, Q&A tab for questions, and the demo repo link is on the Resources slide.
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>Why Ingress is ending</li>
  <li>What Gateway API changes</li>
  <li>kgateway and Pulumi IaC</li>
  <li>The solution we build</li>
  <li>Demo: routing as code</li>
  <li>Q&A</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>
<!--
(1 min) Agenda in six parts: why Ingress is ending, what Gateway API changes, kgateway with Pulumi IaC, the solution, the demo, then questions.
-->

---

# The Ingress NGINX retirement notice

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">The Kubernetes blog, 11 Nov 2025</div>
    <p>"Yesterday's flexibility has become today's insurmountable technical debt."</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>Best-effort maintenance until March 2026</li>
      <li>Afterward: no releases, no bugfixes, no security updates</li>
      <li>One or two people did the development, after hours</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-detective class="psst__icon" />
  <span><strong>Psssst…</strong> existing installs keep working, and that is the problem</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
(2 min) Start here. In November 2025 the Kubernetes project announced that Ingress NGINX was being retired. It started as an example implementation of the Ingress API and became one of the most popular controllers. Best-effort maintenance until March 2026, and after that no releases, no bugfixes, and no security updates. The post puts it plainly: the flexibility turned into technical debt, and for years one or two people maintained it after hours. Ask the room who runs it. Hands up, usually. Source is on the Resources slide.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Existing installs keep working.</h1>
</div>

<!--
(0.5 min) The announcement says existing deployments continue to function and the install artifacts stay available. So nothing breaks on the day. That is why people postpone.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Nobody will patch the next flaw.</h1>
</div>

<!--
(0.5 min) No updates for any vulnerability found later. You can check whether you are affected in one command: list pods with the ingress-nginx label across all namespaces. I will not run it live, but do it after the session.
-->

---

# What helped became what hurt

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">What looked helpful</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Options for every special case</li>
      <li>Arbitrary NGINX directives via annotations</li>
      <li>Years of added options</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">What it became</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Serious security flaws</li>
      <li>Debt the project calls insurmountable</li>
      <li>A retirement notice</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
(1.5 min) The blog names the snippets annotations as the example: a helpful option that let people add arbitrary NGINX configuration, later considered a serious security flaw. Left side is how it felt when we adopted it. Right side is what the project says today. An API that needs annotations for every special case invites arbitrary configuration, and that is how the snippets annotations became a security problem.
-->

---

# Before you replace your ingress controller

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-arrows-split class="step-icon" /><div class="gpu-caption gpu-caption--muted">Replace</div><p>What replaces Ingress?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-users-three class="step-icon" /><div class="gpu-caption gpu-caption--muted">Roles</div><p>Who owns which part of the config?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--muted">Engine</div><p>What actually moves the traffic?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-globe class="step-icon" /><div class="gpu-caption gpu-caption--muted">Match</div><p>How does a request find its app?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-code class="step-icon" /><div class="gpu-caption gpu-caption--muted">Code</div><p>How do we declare all of it as code?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-trash class="step-icon" /><div class="gpu-caption gpu-caption--muted">Undo</div><p>How do we leave nothing behind?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!--
(2 min) These six questions are the spine of the next hour. What replaces Ingress? Who owns which part of the configuration? What moves the traffic? How does a request find its app? How do we declare it as code? And how do we undo it all? Keep them in mind, they come back as recap slides.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What replaces Ingress.</h1>
  </div>
</div>

<style scoped>
.sec { position: absolute; inset: 0; overflow: hidden; }
.sec__lines { position: absolute; width: 30rem; height: auto; opacity: 0.55; pointer-events: none; }
.sec__lines--tr { top: 0; right: 0; }
.sec__lines--bl { bottom: 0; left: 0; }
.sec__inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 5rem; }
.sec__inner h1 { text-wrap: balance; }
</style>

<!--
(0.25 min) Section one: what replaces Ingress, and who owns what.
-->

---

# Three roles own three resources

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-buildings class="chain__icon" />
    <div class="gpu-caption">Infrastructure provider</div>
    <code>GatewayClass</code>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-user-gear class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Cluster operator</div>
    <code>Gateway</code>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-code class="chain__icon" />
    <div class="gpu-caption">Application developer</div>
    <code>HTTPRoute</code>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>A Gateway belongs to exactly one GatewayClass.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.chain { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.8rem; }
.chain__node { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; padding-block: 1.2rem; }
.chain__node span { font-size: 1.15rem; color: var(--p-fg); }
.chain__node code { font-size: 1.05rem !important; }
.chain__icon { font-size: 2.6rem; color: var(--p-primary); }
.chain__arrow { align-self: center; font-size: 1.6rem; color: var(--p-accent); }
.chain__rule { margin-top: 1.2rem; }
.chain__rule p { font-size: 1.3rem; font-weight: 600; }
.facts { display: flex; justify-content: space-between; gap: 1rem; margin-top: 1.4rem; }
.fact { display: flex; align-items: flex-start; gap: 0.7rem; }
.fact svg { flex-shrink: 0; font-size: 1.6rem; color: var(--p-primary); margin-top: 0.1rem; }
.fact p { margin: 0 !important; font-size: 1.05rem; line-height: 1.35; white-space: nowrap; }
.fact small { display: block; font-size: 0.9rem; color: var(--p-fg-muted); margin-top: 0.2rem; }
</style>

<!--
(2 min) The Kubernetes docs describe Gateway API as role-oriented. A GatewayClass is a set of gateways with common configuration, managed by a controller. A Gateway is an instance of traffic-handling infrastructure, like a cloud load balancer. An HTTPRoute maps HTTP requests to backends. The infrastructure provider, the cluster operator and the application developer each touch their own resource. One Gateway points at exactly one GatewayClass. In the demo you play all three roles, one folder at a time.
-->

---

# Header matching moves from annotations into the spec

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Ingress</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>The API has been frozen</li>
      <li>Header matching needs custom annotations</li>
      <li>Traffic weighting needs custom annotations</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Gateway API</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Header-based matching in the spec</li>
      <li>Traffic weighting in the spec</li>
      <li>One-time conversion from Ingress</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
(2 min) Two facts from the Kubernetes docs. The Ingress API is frozen: it is GA, nobody plans to remove it, and it will not change. And Gateway API does not include the Ingress kind, so moving is a one-time conversion. In return, header-based matching and traffic weighting, which the docs say are only possible in Ingress with custom annotations, become part of the API. That is question one and two answered.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">One API, many implementations.</h1>
</div>

<!--
(0.5 min) Gateway API is a spec with many implementations. The docs say it is widely implemented and that conformance definitions and tests exist so it behaves consistently wherever it is used. So the API you learn today is not tied to one controller. kgateway is the one we pick.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What moves the traffic.</h1>
  </div>
</div>

<style scoped>
.sec { position: absolute; inset: 0; overflow: hidden; }
.sec__lines { position: absolute; width: 30rem; height: auto; opacity: 0.55; pointer-events: none; }
.sec__lines--tr { top: 0; right: 0; }
.sec__lines--bl { bottom: 0; left: 0; }
.sec__inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 5rem; }
.sec__inner h1 { text-wrap: balance; }
</style>

<!--
(0.25 min) Section two. Gateway API is a spec. Something has to implement it.
-->

---

# kgateway turns Gateway API resources into Envoy configuration

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-brain class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Control plane: kgateway</div></div>
    <ul class="zone__list">
      <li><ph-seal-check /><span>Implements the Kubernetes Gateway API</span></li>
      <li><ph-arrows-clockwise /><span>Translates your resources into proxy configuration</span></li>
      <li><ph-globe /><span>Serves microservices and AI workloads</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrow-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-cube class="zone__icon" /><div class="gpu-caption">Data plane: Envoy</div></div>
    <ph-plugs-connected class="zone__hero" />
    <p>The proxy that carries the requests</p>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">Project status</div>
  <p>kgateway is a CNCF sandbox project.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.setup { display: grid; grid-template-columns: 1.7fr auto 1fr; align-items: stretch; gap: 1.25rem; }
.zone__head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.1rem; }
.zone__icon { font-size: 1.6rem; color: var(--p-primary); }
.zone--cloud .zone__icon { color: var(--p-fg-muted); }
.zone__list { list-style: none; padding: 0; margin: 0; }
.zone__list li { display: flex; align-items: center; gap: 0.8rem; margin: 0 0 0.85rem; }
.zone__list li:last-child { margin-bottom: 0; }
.zone__list li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
.setup__link { display: flex; align-items: center; font-size: 2.2rem; color: var(--p-accent); }
.zone--cloud { display: flex; flex-direction: column; }
.zone__hero { font-size: 4.2rem; color: var(--p-accent); margin: auto 0 0.9rem; }
.zone--cloud p { margin: 0 !important; }
</style>

<!--
(2 min) kgateway is the controller we use. Its docs describe a control plane that implements the Gateway API and translates your resources into configuration the data plane proxy understands. The proxy is its implementation of Envoy. Be straight about maturity: the project footer says it is a Cloud Native Computing Foundation sandbox project. We will come back to that on the limits slide.
-->

---

# A request is matched, optionally rewritten, then forwarded

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-laptop class="plan__icon" />
    <p>Client sends a request to the Gateway address</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-magnifying-glass class="plan__icon" />
    <p>The proxy matches the Host header to its configuration</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-sliders-horizontal class="plan__icon" />
    <p>Optional path and header rules, optional filters</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-paper-plane-tilt class="plan__icon" />
    <p>Forwarded to one or more backends</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-info class="plan__foot-icon" />
  <p><strong>The rules live in the HTTPRoute:</strong> the Gateway only opens the door.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.plan { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.7rem; }
.plan__step { position: relative; display: flex; flex-direction: column; gap: 0.9rem; padding-top: 1.9rem; }
.plan__step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.plan__num { position: absolute; top: 0.8rem; right: 1rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-fg-subtle); }
.plan__icon { font-size: 2.3rem; height: 2.8rem; color: var(--p-primary); }
.plan__keys { display: flex; align-items: center; gap: 0.35rem; height: 2.8rem; color: var(--p-fg-muted); }
.plan__keys kbd { font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 600; color: var(--p-primary); background: var(--p-bg); border: 1.5px solid var(--p-border); border-bottom-width: 3px; border-radius: 8px; padding: 0.2rem 0.55rem; }
.plan__arrow { align-self: center; font-size: 1.5rem; color: var(--p-accent); }
.plan__foot { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.6rem; }
.plan__foot-icon { font-size: 1.5rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
(2 min) This is the request flow from the Kubernetes docs. The client resolves the name and sends the request to the Gateway address. The reverse proxy uses the Host header to find the configuration derived from the Gateway and its attached HTTPRoutes. Optionally it matches path and headers, optionally it modifies the request, and then it forwards to the backends. The demo shows the path and header matching with curl.
-->

---

# Ok, four questions covered, two to go!

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-arrows-split class="step-icon" /><div class="gpu-caption gpu-caption--accent">Replace</div><p>Gateway API, Ingress is frozen</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-users-three class="step-icon" /><div class="gpu-caption gpu-caption--accent">Roles</div><p>GatewayClass, Gateway, HTTPRoute</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--accent">Engine</div><p>kgateway and Envoy</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-globe class="step-icon" /><div class="gpu-caption gpu-caption--accent">Match</div><p>Host, path and header rules</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-code class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Code</div><p>How do we declare all of it as code?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-trash class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Undo</div><p>How do we leave nothing behind?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!--
(1 min) Quick recap. Replace: Gateway API, with Ingress frozen. Roles: three resources, three owners. Engine: kgateway as the control plane and Envoy as the proxy. Match: host, path and header rules. Two left: how we declare this as code, and how we undo it.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Pulumi IaC declares it.</h1>
  </div>
</div>

<style scoped>
.sec { position: absolute; inset: 0; overflow: hidden; }
.sec__lines { position: absolute; width: 30rem; height: auto; opacity: 0.55; pointer-events: none; }
.sec__lines--tr { top: 0; right: 0; }
.sec__lines--bl { bottom: 0; left: 0; }
.sec__inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 5rem; }
.sec__inner h1 { text-wrap: balance; }
</style>

<!--
(0.25 min) Section three: the code.
-->

---

# A chart installs the controller, custom resources declare the rest

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-package class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Helm chart resource</div></div>
    <ul class="zone__list">
      <li><ph-puzzle-piece /><span>Gateway API CRDs, standard channel</span></li>
      <li><ph-rocket-launch /><span>kgateway controller, version pinned</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-arrow-right /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-file-code class="zone__icon" /><div class="gpu-caption">Custom resources</div></div>
    <ul class="zone__list">
      <li><ph-stack /><span>GatewayClass</span></li>
      <li><ph-lock-open /><span>Gateway</span></li>
      <li><ph-arrows-split /><span>HTTPRoute</span></li>
    </ul>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">One workflow</div>
  <p>Preview and update every layer with <code>pulumi up</code>.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.setup { display: grid; grid-template-columns: 1.7fr auto 1fr; align-items: stretch; gap: 1.25rem; }
.zone__head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.1rem; }
.zone__icon { font-size: 1.6rem; color: var(--p-primary); }
.zone--cloud .zone__icon { color: var(--p-fg-muted); }
.zone__list { list-style: none; padding: 0; margin: 0; }
.zone__list li { display: flex; align-items: center; gap: 0.8rem; margin: 0 0 0.85rem; }
.zone__list li:last-child { margin-bottom: 0; }
.zone__list li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
.setup__link { display: flex; align-items: center; font-size: 2.2rem; color: var(--p-accent); }
.zone--cloud { display: flex; flex-direction: column; }
.zone__hero { font-size: 4.2rem; color: var(--p-accent); margin: auto 0 0.9rem; }
.zone--cloud p { margin: 0 !important; }
</style>

<!--
(2 min) In Pulumi IaC the controller is a Helm chart resource: the Gateway API CRDs and the kgateway chart, versions pinned. The Gateway API objects, GatewayClass, Gateway and HTTPRoute, are custom resources, so they live in the same program language as everything else. Each demo folder is its own small Pulumi project, and every step is the same command: pulumi up.
-->

---

# Where this breaks today: migration and tracking are on you

<div class="zoom-content">

<div class="grid grid-cols-2 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-arrows-split class="step-icon" /><div class="gpu-caption gpu-caption--muted">Migration</div><p>Gateway API has no Ingress kind, so converting your Ingress resources is a one-time job</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-puzzle-piece class="step-icon" /><div class="gpu-caption gpu-caption--muted">CRDs</div><p>Gateway API ships as custom resources: you install them in every cluster</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--muted">kind</div><p>A command resource creates it, so Pulumi tracks the command, not the cluster</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-warning class="step-icon" /><div class="gpu-caption gpu-caption--muted">Maturity</div><p>kgateway is a CNCF sandbox project, so check it against your risk bar</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
(1.5 min) Four honest limits. Migration is manual: Gateway API does not include the Ingress kind. The CRDs are not built into Kubernetes, you install them. The demo cluster is kind. A command resource creates and deletes it, so Pulumi tracks that command and not the cluster itself. And kgateway is a sandbox project in the CNCF. None of these stops the demo, but all four matter before production.
-->

---

# Ok, five questions covered, one to go!

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-arrows-split class="step-icon" /><div class="gpu-caption gpu-caption--accent">Replace</div><p>Gateway API, Ingress is frozen</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-users-three class="step-icon" /><div class="gpu-caption gpu-caption--accent">Roles</div><p>GatewayClass, Gateway, HTTPRoute</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--accent">Engine</div><p>kgateway and Envoy</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-globe class="step-icon" /><div class="gpu-caption gpu-caption--accent">Match</div><p>Host, path and header rules</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-code class="step-icon" /><div class="gpu-caption gpu-caption--accent">Code</div><p>Chart and custom resources</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-trash class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Undo</div><p>How do we leave nothing behind?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!--
(1 min) Five answered. The last one, undo, is the final demo step: pulumi destroy through every layer, then delete the cluster and check that nothing is left.
-->

---

# The demo ends with one Gateway in front of two apps

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-laptop class="chain__icon" />
    <div class="gpu-caption">Client</div>
    <code>curl localhost:8080</code>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-lock-open class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Gateway http</div>
    <span>kgateway proxy, port 80</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-cube class="chain__icon" />
    <div class="gpu-caption">Backends</div>
    <span>app-a and app-b</span>
  </div>
</div>

<div class="facts" v-click="4">
  <div class="fact"><ph-arrows-split /><p>/a goes to app-a, /b goes to app-b</p></div>
  <div class="fact"><ph-sliders-horizontal /><p>/headers with x-backend: b goes to app-b</p></div>
  <div class="fact"><ph-check-circle /><p>Anything else on /headers goes to app-a</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.chain { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.8rem; }
.chain__node { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; padding-block: 1.2rem; }
.chain__node span { font-size: 1.15rem; color: var(--p-fg); }
.chain__node code { font-size: 1.05rem !important; }
.chain__icon { font-size: 2.6rem; color: var(--p-primary); }
.chain__arrow { align-self: center; font-size: 1.6rem; color: var(--p-accent); }
.chain__rule { margin-top: 1.2rem; }
.chain__rule p { font-size: 1.3rem; font-weight: 600; }
.facts { display: flex; justify-content: space-between; gap: 1rem; margin-top: 1.4rem; }
.fact { display: flex; align-items: flex-start; gap: 0.7rem; }
.fact svg { flex-shrink: 0; font-size: 1.6rem; color: var(--p-primary); margin-top: 0.1rem; }
.fact p { margin: 0 !important; font-size: 1.05rem; line-height: 1.35; white-space: nowrap; }
.fact small { display: block; font-size: 0.9rem; color: var(--p-fg-muted); margin-top: 0.2rem; }

.fact p { white-space: normal; }
.facts { align-items: flex-start; }
</style>

<!--
(1.5 min) This is the picture of where we end up. A kind cluster, kgateway installed, one Gateway called http with a listener on port 80, and two small echo apps. We port-forward the Gateway proxy service to localhost 8080. Path rules send /a and /b to different apps, and a header rule on /headers decides by the x-backend header.
-->

---

# A route is a custom resource, declared like any other resource

<div class="zoom-content">

<div class="big-code code-sm">

```ts
new k8s.apiextensions.CustomResource("path-routing", {
    apiVersion: "gateway.networking.k8s.io/v1", kind: "HTTPRoute",
    spec: {
        parentRefs: [{ name: "http" }],
        rules: [{ matches: [{ path: { type: "PathPrefix", value: "/a" } }],
                  backendRefs: [{ name: "app-a-svc", port: 5678 }] }],
    },
}, { provider });
```

</div>

<aside class="info-card" v-click>
  <div class="info-card__label">Trimmed for the slide</div>
  <p>Metadata and the <code>/b</code> rule are left out.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
.zoom-content pre { margin: 0 !important; }
.zoom-content .info-card { margin-top: 1.2rem; }
</style>

<!--
(1.5 min) The only program code in the talk. The HTTPRoute is a custom resource: API version, kind, parent Gateway, and a rule that sends the /a prefix to the app-a service on port 5678. I trimmed the metadata and the second rule for the slide. The full file is in the 05-path-routing folder.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: kgateway and Gateway API.</h1>
  </div>
</div>

<style scoped>
.sec { position: absolute; inset: 0; overflow: hidden; }
.sec__lines { position: absolute; width: 30rem; height: auto; opacity: 0.55; pointer-events: none; }
.sec__lines--tr { top: 0; right: 0; }
.sec__lines--bl { bottom: 0; left: 0; }
.sec__inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 5rem; }
.sec__inner h1 { text-wrap: balance; }
</style>
<!--
(0.25 min) Divider into the demo. Terminal and editor on screen from here.
-->

---

# What we are going to do

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card step" v-click><ph-rocket-launch class="step__icon" /><p>kgateway runs in a kind cluster</p></div>
  <div class="gpu-card step" v-click><ph-stack class="step__icon" /><p>A GatewayClass points at it</p></div>
  <div class="gpu-card step" v-click><ph-lock-open class="step__icon" /><p>A Gateway gets an address</p></div>
  <div class="gpu-card step" v-click><ph-cube class="step__icon" /><p>Two backends answer by name</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-arrows-split class="step__icon" /><p>Paths split traffic to the right app</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-sliders-horizontal class="step__icon" /><p>A header picks the backend</p></div>
  <div class="gpu-card gpu-card--accent step" v-click><ph-trash class="step__icon" /><p>Teardown leaves nothing behind</p></div>
</div>

<aside class="info-card">
  <div class="info-card__label">Every step</div>
  <p><code>npm install</code> then <code>pulumi up</code> in the step folder.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.steps { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.2rem; }
.step { display: flex; flex-direction: row; align-items: center; gap: 0.9rem; padding: 0.8rem 1.1rem; }
.step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.3; }
.step__icon { font-size: 2rem; color: var(--p-primary); flex: none; }

.steps { gap: 0.9rem; }
.info-card { margin-top: 1rem; }
</style>

<!--
(2.25 min) Seven steps, each its own folder. Every step except the last is the same: npm install, then pulumi up, in that folder. I show it once here and the step slides only carry the folder and what you should see. The last step is teardown.
-->

---

# 1 · The controller runs in its own namespace

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />01-kgateway-install</div>
<div class="big-code code-sm">

```bash
kubectl --context kind-api-gateways-workshop-demo \
  get pods -n kgateway-system
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-desktop /><span>pulumi up creates the kind cluster</span></li>
    <li><ph-puzzle-piece /><span>Applies the Gateway API CRDs</span></li>
    <li><ph-rocket-launch /><span>Installs kgateway from a chart</span></li>
    <li><ph-check-circle /><span>The controller pod is Running</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.45fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
(10 min) Step one. Pulumi creates the kind cluster, applies the Gateway API standard CRDs, and installs kgateway into the kgateway-system namespace. This is the slowest step because images pull, so talk while it runs. Expect the controller pod Running. If it is Pending, wait.
-->

---

# 2 · A GatewayClass points at kgateway

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />02-gatewayclass</div>
<div class="big-code code-sm">

```bash
kubectl get gatewayclass kgateway-workshop
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-stack /><span>Controller name kgateway.dev/kgateway</span></li>
    <li><ph-check-circle /><span>Condition Accepted is True</span></li>
    <li><ph-info /><span>kgateway also ships a default class</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.45fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
(6 min) Step two, the infrastructure provider role. One GatewayClass whose controller name is kgateway.dev/kgateway. Expect the condition Accepted to be True. kgateway installs its own default class too; we create ours next to it so the workshop owns what it shows.
-->

---

# 3 · The Gateway gets an address

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />03-gateway</div>
<div class="big-code code-sm">

```bash
kubectl -n gateway-demo get gateway http
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-lock-open /><span>One HTTP listener on port 80</span></li>
    <li><ph-folder-open /><span>In the gateway-demo namespace</span></li>
    <li><ph-check-circle /><span>Programmed is True, with an address</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.45fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
(6 min) Step three, the cluster operator role. A namespace and a Gateway named http with one HTTP listener on port 80. Expect Programmed True and an assigned address. That means the controller accepted it and built the proxy.
-->

---

# 4 · Two backends answer with their own name

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
kubectl -n gateway-demo run tmp --rm -it --image=busybox \
  --restart=Never -- wget -qO- app-a-svc:5678
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-folder-open /><div><div class="gpu-caption gpu-caption--accent">Folder</div><code>04-backends</code></div></div>
  <div class="gpu-card check" v-click><ph-cube /><div><div class="gpu-caption gpu-caption--accent">Pods</div><code>app-a, app-b Running</code></div></div>
  <div class="gpu-card check" v-click><ph-check-circle /><div><div class="gpu-caption gpu-caption--accent">Reply</div><code>app-a (app-b-svc: app-b)</code></div></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.checks { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.9rem; }
.checks__cmd { margin-bottom: 1.1rem; }
.checks__cmd pre { margin: 0 !important; }
.check { display: flex; align-items: center; gap: 0.9rem; padding: 1rem 1.2rem; }
.check > svg { flex-shrink: 0; font-size: 1.9rem; color: var(--p-primary); }
.check code { display: inline-block; margin-top: 0.4rem; font-size: 0.9rem !important; background: var(--p-bg) !important; }
.checks__note { display: flex; align-items: center; gap: 0.7rem; margin-top: 1.3rem; }
.checks__icon { font-size: 1.4rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
(6 min) Step four, nothing about the Gateway yet. Two deployments with a pinned http-echo image, each returning its own name. We test from inside the cluster with a throwaway busybox pod. app-a-svc answers app-a, app-b-svc answers app-b. Now we have something to route to.
-->

---

# 5 · Paths split traffic to the right app

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />05-path-routing</div>
<div class="big-code code-sm">

```bash
curl localhost:8080/a
curl localhost:8080/b
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-plugs-connected /><span>Port-forward the Gateway service first</span></li>
    <li><ph-arrows-split /><span>/a returns app-a</span></li>
    <li><ph-arrows-split /><span>/b returns app-b</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.45fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
(8 min) Step five, the application developer role. One HTTPRoute with two path-prefix rules. First port-forward the Gateway proxy service to 8080, then curl /a and /b. Different paths, different apps, one address.
-->

---

# 6 · A header decides the backend

<div class="zoom-content">

<div class="s5__cmd big-code code-sm">

```bash
curl -H "x-backend: b" localhost:8080/headers
curl localhost:8080/headers
```

</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-terminal-window /><span>Request carries <code>x-backend: b</code></span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-sliders-horizontal /><span>The header rule on <code>/headers</code> matches</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step s5__step--stop" v-click="3"><ph-check-circle /><span>The reply is app-b</span></div>
  </div>
  <div class="s5__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">No header</div><p>The same path returns app-a.</p></aside>
    <aside class="info-card" v-click="5"><div class="info-card__label">Folder</div><p><code>06-header-routing</code></p></aside>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.s5 { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: center; margin-top: 1.2rem; }
.s5__cmd pre { margin: 0 !important; white-space: pre-wrap; }
.s5__flow { display: flex; flex-direction: column; align-items: stretch; }
.s5__step { display: flex; align-items: center; gap: 0.8rem; padding: 0.7rem 1rem; border: 1.5px solid var(--p-border); border-radius: 12px; background: var(--p-bg-elevated); font-size: 1.15rem; }
.s5__step svg { flex-shrink: 0; font-size: 1.45rem; color: var(--p-primary); }
.s5__step--stop { border-color: color-mix(in srgb, var(--p-primary) 60%, var(--p-border)); background: var(--p-bg); font-weight: 600; }
.s5__arrow { align-self: center; font-size: 1.1rem; color: var(--p-accent); margin: 0.2rem 0; }
.s5__side { display: flex; flex-direction: column; gap: 1rem; }
.s5__side pre { margin: 0 !important; }
.s5__side .info-card { margin-top: 0; }
</style>

<!--
(8 min) Step six. A second HTTPRoute on /headers. If the x-backend header is b, the request goes to app-b. Otherwise it goes to app-a. This is the case that needed annotations on Ingress. Run both curls and compare.
-->

---

# 7 · Teardown leaves nothing behind

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />07-teardown</div>
<div class="big-code code-sm">

```bash
07-teardown/teardown.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-trash /><span>pulumi destroy from 06 down to 01</span></li>
    <li><ph-cube /><span>Then deletes the kind cluster</span></li>
    <li><ph-seal-check /><span>verify-clean.sh confirms no cluster is left</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: 1.45fr 1fr; gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
(6 min) Last step, and the last question: how do we undo it? The script runs pulumi destroy from step six back to step one, deletes the kind cluster, and then verify-clean.sh checks that no cluster is left behind. Questions after this slide.
-->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-5 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/api-gateways-on-kubernetes-kgateway" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → api-gateways-on-kubernetes-kgateway</div>
  </div>
  <div class="res-card">
    <QRCode data="https://kubernetes.io/docs/concepts/services-networking/gateway/" dark="#000000" />
    <div class="res-card__title">Gateway API in the Kubernetes docs</div>
    <div class="res-card__body">kubernetes.io/docs</div>
  </div>
  <div class="res-card">
    <QRCode data="https://kgateway.dev/docs/envoy/latest/about/overview/" dark="#000000" />
    <div class="res-card__title">kgateway documentation</div>
    <div class="res-card__body">kgateway.dev/docs</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/registry/packages/kubernetes/" dark="#000000" />
    <div class="res-card__title">Pulumi Kubernetes provider</div>
    <div class="res-card__body">pulumi.com/registry</div>
  </div>
  <div class="res-card">
    <QRCode data="https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/" dark="#000000" />
    <div class="res-card__title">Ingress NGINX retirement announcement</div>
    <div class="res-card__body">kubernetes.io/blog</div>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.res-card { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.4rem; }
.res-card .qr-code { width: 9rem; height: 9rem; background: #ffffff; padding: 0.45rem; border-radius: 10px; box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18); }
.res-card__title { font-size: 1.15rem; font-weight: 600; color: var(--p-fg); margin-top: 0.4rem; }
.res-card__body { font-family: var(--slidev-font-mono); font-size: 0.8rem; color: var(--p-fg-muted); line-height: 1.4; word-break: break-all; }
</style>
<!--
(1 min) Resources: the repo QR first, then the Kubernetes Gateway docs, the kgateway docs, the Pulumi Kubernetes provider, and the Ingress NGINX announcement.
-->

---

# Continue your Pulumi journey!

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-6">
  <div class="gpu-card gpu-card--primary journey-card" v-click>
    <div class="journey-card__title">Join the Pulumi Community Slack!</div>
    <p class="journey-card__body">
      <a class="text-[var(--p-primary)]" href="https://slack.pulumi.com/">slack.pulumi.com</a>
    </p>
  </div>
  <div class="gpu-card gpu-card--primary journey-card" v-click>
    <div class="journey-card__title">Sign up for a Pulumi Cloud account!</div>
    <p class="journey-card__body">
      Sign up to follow along
    </p>
  </div>
  <div class="gpu-card gpu-card--accent journey-card" v-click>
    <div class="journey-card__title">Join us for our next workshops!</div>
    <p class="journey-card__body">
      Link in the <strong>Handouts</strong> tab
    </p>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.45; }
.journey-card { display: flex; flex-direction: column; }
.journey-card__title { font-size: 1.5rem; font-weight: 600; line-height: 1.25; margin-bottom: 0.9rem; color: var(--p-fg); }
.journey-card__body { font-size: 1.15rem; line-height: 1.55; margin: 0 !important; color: var(--p-fg); }
</style>
<!--
(0.5 min) Community Slack and the next steps.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-16">
  <div class="thanks__kicker">Thank you</div>
  <h1 class="!text-[4.5rem] !leading-[1.02] !font-semibold !tracking-tight !mt-3 !mb-12 text-center">Questions?</h1>
  <div class="thanks">
    <div class="thanks__person">
      <img class="thanks__avatar" src="/img/speaker-placeholder.svg" alt="Speaker Name" />
      <div class="thanks__name">Speaker Name</div>
      <div class="thanks__org">Pulumi</div>
      <div class="thanks__handles">
        <span><carbon-logo-x />@handle</span>
        <span><carbon-logo-github />handle</span>
      </div>
      <div class="thanks__qr"><QRCode data="https://www.linkedin.com/company/pulumi/" dark="#000000" /></div>
      <div class="thanks__qr-label"><carbon-logo-linkedin />pulumi</div>
    </div>
    <div class="thanks__person">
      <div class="thanks__avatar thanks__avatar--icon"><carbon-logo-github /></div>
      <div class="thanks__name">Workshop repo</div>
      <div class="thanks__org">slides · demo</div>
      <div class="thanks__handles">
        <span>pulumi/workshops</span>
      </div>
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/api-gateways-on-kubernetes-kgateway" dark="#000000" /></div>
      <div class="thanks__qr-label">api-gateways-on-kubernetes-kgateway</div>
    </div>
  </div>
</div>

<style scoped>
.thanks__kicker { font-family: var(--slidev-font-mono); font-size: 1.15rem; font-weight: 700; letter-spacing: 0.6em; text-transform: uppercase; color: var(--p-fg-muted); }
.thanks { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2.5rem; justify-items: center; }
.thanks__person { display: flex; flex-direction: column; align-items: center; text-align: center; height: 100%; }
.thanks__avatar { width: 7rem; height: 7rem; border-radius: 9999px; object-fit: cover; border: 3px solid color-mix(in srgb, var(--p-primary) 45%, transparent); }
.thanks__avatar--icon { display: flex; align-items: center; justify-content: center; font-size: 3.6rem; color: var(--p-fg); background: var(--p-bg-elevated); }
.thanks__name { margin-top: 0.9rem; font-size: 1.45rem; font-weight: 700; color: var(--p-fg); }
.thanks__org { font-size: 1.1rem; color: var(--p-fg-muted); }
.thanks__handles { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 0.15rem; margin-top: 0.5rem; min-height: 3rem; font-size: 1rem; color: var(--p-fg-muted); }
.thanks__handles span { display: inline-flex; align-items: center; gap: 0.35rem; }
.thanks__qr { width: 8rem; height: 8rem; margin-top: 1.1rem; padding: 0.45rem; background: #ffffff; border-radius: 10px; box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18); }
.thanks__qr-label { display: inline-flex; align-items: center; gap: 0.35rem; margin-top: 0.55rem; font-family: var(--slidev-font-mono); font-size: 0.85rem; color: var(--p-fg-muted); }
</style>
<!--
(8 min) Questions. If it is quiet: ask who still runs Ingress NGINX and what blocks their move.
-->
