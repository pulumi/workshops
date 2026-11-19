---
theme: "@pulumi/slidev-theme"
title: "Building a Golden Path"
info: |
  Building a Golden Path: Self-service infrastructure platforms with Pulumi.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/platform-engineering-golden-path
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
    Building a Golden Path
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Self-service infrastructure platforms with Pulumi
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>


<!--
~1 min: Welcome. Say what the workshop promises: a component another team can use in a few lines.
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
~1 min: Introduce yourself. Speakers are placeholders until confirmed.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>


<!--
~0.5 min: Divider. Housekeeping next.
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
~1.5 min: Logistics, where the code lives, what to have installed.
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>The pain: every team ships differently</li>
  <li>What a team gets</li>
  <li>Getting it to the team that needs it</li>
  <li>Guardrails and versions</li>
  <li>The demo</li>
  <li>Wrap-up and Q&A</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>


<!--
~1.5 min: Walk the agenda as the six questions. The demo comes last.
-->

---

# Nobody knew how. Everyone asked a colleague.

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">Spotify Engineering, August 2020</div>
    <p>"Rolling back six or so years, Spotify was (and still is) committed to an agile engineering culture with autonomous teams. With all the advantages that brings, it also brought forth complexities, including a fragmented ecosystem of developer tooling where the only way to find out how to do something was to ask your colleague. 'Rumour-driven development', we endearingly called it."</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>Autonomous teams, each choosing its own tools</li>
      <li>Finding out how meant asking a colleague</li>
      <li>"Rumour-driven development simply wasn't scalable."</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-detective class="psst__icon" />
  <span><strong>That was Spotify</strong>, the origin of the term golden path</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
~4 min: Read the quote slowly. It is a company that did everything right on autonomy and still could not answer how do I build a service. Ask who in the room has lived this. Source: the Spotify Engineering blog post from August 2020.
-->
---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Every team can ship infrastructure.</h1>
</div>

<!--
~1 min: Let it land. This is the good news: self-service already works.
-->
---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">No two teams ship it the same way.</h1>
</div>

<!--
~1 min: Then the turn. Same tooling, same cloud, different results.
-->
---

# The standard is written down. The running account says otherwise.

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">What is written</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>A wiki page or README</li>
      <li>A platform-team Slack channel to ask in</li>
      <li>"Tag everything, scope your roles"</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">What is running</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>IAM policies that differ from team to team</li>
      <li>Tags on some resources, missing on others</li>
      <li>Nobody enforcing any of it</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
~4 min: Three teams at one company each build a service behind a load balancer. One tags, one does not. One scopes its role, one takes a broad policy because it was faster. A document cannot enforce anything. Keep this concrete and do not name real companies.
-->
---

# Before you call it a golden path, six questions

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-package class="step-icon" /><div class="gpu-caption gpu-caption--muted">What</div><p>What exactly does a team get?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-magnifying-glass class="step-icon" /><div class="gpu-caption gpu-caption--muted">Find</div><p>Who can find it?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-shield-check class="step-icon" /><div class="gpu-caption gpu-caption--muted">Guarantee</div><p>What is guaranteed for them?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-sliders class="step-icon" /><div class="gpu-caption gpu-caption--muted">Change</div><p>What can they still change?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-git-branch class="step-icon" /><div class="gpu-caption gpu-caption--muted">Update</div><p>What happens when the platform changes it?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-warning class="step-icon" /><div class="gpu-caption gpu-caption--muted">Break</div><p>How do they learn it broke, and how do they fix it?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!--
~4 min: These six questions are the spine of the next hour. Read them out. We answer them in a slightly different order than listed, and the demo answers the last one.
-->
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What does a team actually get?</h1>
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
~1 min: Section one: the unit a team consumes is a component. Quote the Spotify definition: the golden path is the 'opinionated and supported' path to 'build something'.
-->
---

# Three inputs and one output are the whole interface

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-tag class="plan__icon" />
    <p><code>serviceName</code></p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-cube class="plan__icon" />
    <p><code>image</code></p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-plugs class="plan__icon" />
    <p><code>port</code></p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-package class="plan__icon" />
    <p style="font-size:0.72em"><code>ComplianceWebService</code></p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="5" />
  <div class="gpu-card plan__step" v-click="5">
    <span class="plan__num">5</span>
    <ph-link class="plan__icon" />
    <p><code>url</code></p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="6">
  <ph-lightning class="plan__foot-icon" />
  <p>Type URN <code>platform-golden-path:index:ComplianceWebService</code>. Anything else is not the team's to set.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.15; }
.plan { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.7rem; }
.plan__step { position: relative; display: flex; flex-direction: column; gap: 0.9rem; padding-top: 1.9rem; }
.plan__step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.plan__num { position: absolute; top: 0.8rem; right: 1rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-fg-subtle); }
.plan__icon { font-size: 2.3rem; height: 2.8rem; color: var(--p-primary); }
.plan__arrow { align-self: center; font-size: 1.5rem; color: var(--p-accent); }
.plan__foot { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.6rem; }
.plan__foot-icon { font-size: 1.5rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
~5 min: Walk left to right. Three things a team decides: a name, an image, a port. One thing they get back. This answers what a team gets and, by omission, what they can still change: only these three.
-->
---

# Behind the interface, every choice is already made

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-scroll class="step-icon" /><div class="gpu-caption gpu-caption--muted">Logging</div><p>A CloudWatch log group</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-identification-badge class="step-icon" /><div class="gpu-caption gpu-caption--muted">Identity</div><p>A scoped IAM role and role policy</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-cube class="step-icon" /><div class="gpu-caption gpu-caption--muted">Cluster</div><p>An ECS cluster</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-arrows-split class="step-icon" /><div class="gpu-caption gpu-caption--muted">Ingress</div><p>An <code>awsx</code> application load balancer</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-rocket-launch class="step-icon" /><div class="gpu-caption gpu-caption--muted">Service</div><p>An <code>awsx</code> Fargate service</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-tag class="step-icon" /><div class="gpu-caption gpu-caption--muted">Tags</div><p>Mandatory tags on every resource</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!--
~6 min: Six things the consuming team never writes. Every child resource is parented to the component with parent: this, and the component calls registerOutputs at the end, so the Pulumi console shows one node with the children under it.
-->
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">How does it reach the team that needs it?</h1>
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
~1 min: Section two: packaging and discovery.
-->
---

# One <code>PulumiPlugin.yaml</code> makes it usable from any language

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-file-text class="plan__icon" />
    <p><code>PulumiPlugin.yaml</code> declares the runtime</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-package class="plan__icon" />
    <p><code>pulumi package add</code></p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-code class="plan__icon" />
    <p>The consumer uses it from their own language</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="4">
  <ph-lightning class="plan__foot-icon" />
  <p><code>pulumi package add</code> takes a plugin reference, a local path, or a git URL.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.plan { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.7rem; }
.plan__step { position: relative; display: flex; flex-direction: column; gap: 0.9rem; padding-top: 1.9rem; }
.plan__step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.plan__num { position: absolute; top: 0.8rem; right: 1rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-fg-subtle); }
.plan__icon { font-size: 2.3rem; height: 2.8rem; color: var(--p-primary); }
.plan__arrow { align-self: center; font-size: 1.5rem; color: var(--p-accent); }
.plan__foot { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.6rem; }
.plan__foot-icon { font-size: 1.5rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
~5 min: A team on Python or YAML can use a component written in TypeScript. The platform team adds one small file; the consumer runs one command. The three accepted forms are in the CLI reference.
-->
---

# The private registry makes it findable. It adds no new way to install it.

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">IDP Private Registry</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>A discoverability, governance and docs layer</li>
      <li>Pro and Enterprise feature</li>
      <li>Fed by <code>pulumi package publish</code></li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Underneath</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>The same git-based mechanism</li>
      <li><code>pulumi package add</code> with a git URL and a version</li>
      <li>Works without any registry</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
~5 min: Say this plainly and do not oversell it. The registry is where the docs and versions live and where other teams look. The install mechanism underneath is the same git-based one. Pro or Enterprise only. We did not run a live publish for this workshop; see the honest gaps slide.
-->
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What does the platform enforce so nobody has to remember?</h1>
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
~1 min: Section three: guardrails.
-->
---

# Guardrails are the point of the component, not a side effect

<div class="zoom-content">

<div class="grid grid-cols-2 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-text-aa class="step-icon" /><div class="gpu-caption gpu-caption--muted">Naming</div><p>Names follow the component's pattern</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-tag class="step-icon" /><div class="gpu-caption gpu-caption--muted">Tagging</div><p>Mandatory tags on every resource</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-map-pin class="step-icon" /><div class="gpu-caption gpu-caption--muted">Placement</div><p>Placed the same way every time</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--muted">IAM scope</div><p>A scoped role, not a broad policy</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!--
~5 min: The component makes these choices, so no team has to remember them. The wiki page said tag everything; here the code does. Check the demo code for the exact tag keys before you quote them.
-->
---

# Four questions covered, two to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-package class="step-icon" /><div class="gpu-caption gpu-caption--accent">What</div><p>A name, an image, a port</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-magnifying-glass class="step-icon" /><div class="gpu-caption gpu-caption--accent">Find</div><p>A git repo, plus the private registry</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-shield-check class="step-icon" /><div class="gpu-caption gpu-caption--accent">Guarantee</div><p>Tags, logs, scoped IAM, same every time</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-sliders class="step-icon" /><div class="gpu-caption gpu-caption--accent">Change</div><p>Only the three inputs</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-git-branch class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Update</div><p>What happens when the platform changes it?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-warning class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Break</div><p>How do they learn it broke, and how do they fix it?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!--
~2 min: Quick recap. Four answered. Next: versions and what a breaking change looks like.
-->
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">What happens when the platform changes its mind?</h1>
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
~1 min: Section four: versioning.
-->
---

# A git tag is the version

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-pencil-simple class="plan__icon" />
    <p>The platform team changes the component</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-git-branch class="plan__icon" />
    <p><code>git tag</code> cuts a version</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-package class="plan__icon" />
    <p>Consumers add it with <code>@version</code></p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-arrows-clockwise class="plan__icon" />
    <p>They move when they choose to</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p>The consumer form is <code>pulumi package add &lt;git-url&gt;@&lt;version&gt;</code>.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.plan { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.7rem; }
.plan__step { position: relative; display: flex; flex-direction: column; gap: 0.9rem; padding-top: 1.9rem; }
.plan__step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.plan__num { position: absolute; top: 0.8rem; right: 1rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-fg-subtle); }
.plan__icon { font-size: 2.3rem; height: 2.8rem; color: var(--p-primary); }
.plan__arrow { align-self: center; font-size: 1.5rem; color: var(--p-accent); }
.plan__foot { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.6rem; }
.plan__foot-icon { font-size: 1.5rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
~4 min: Versions are ordinary git tags. The package add command accepts a version after the URL. A consumer stays on the tag they added until they move.
-->
---

# A renamed input breaks consumers by name, not silently

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Consumer program</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Still says <code>serviceName</code></li>
      <li>Nothing in it changed</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Component v2</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Now wants <code>name</code></li>
      <li>Preview fails: <code>Missing required property 'name'</code></li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
~5 min: There is no alias at the schema boundary: a renamed required input is a breaking change. The good news is that it fails loudly, with the property name in the error, before any cloud call. That is what we will see in the demo.
-->
---

# Where this breaks today

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Discovery</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>No short-form, registry-native <code>pulumi package add</code> syntax yet</li>
      <li>Only plugin reference, local path or git URL</li>
      <li>Checked in four docs pages on 2026-09-30</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">This build</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>No live <code>pulumi package publish</code>: no Pulumi Cloud org</li>
      <li>No live <code>pulumi up</code> or <code>pulumi destroy</code>: no AWS credentials</li>
      <li>We show no result for those</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
~4 min: State the limits plainly. The four pages: the Private Registry concept page, the pulumi package add reference, the source-based plugin guide and the Packaging Components guide. And we built the demo without cloud access, so every step you see stops before a real deploy. Re-run with credentials before delivering.
-->
---

# Five questions answered, one to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-package class="step-icon" /><div class="gpu-caption gpu-caption--accent">What</div><p>A name, an image, a port</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-magnifying-glass class="step-icon" /><div class="gpu-caption gpu-caption--accent">Find</div><p>A git repo, plus the private registry</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-shield-check class="step-icon" /><div class="gpu-caption gpu-caption--accent">Guarantee</div><p>Tags, logs, scoped IAM, same every time</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-sliders class="step-icon" /><div class="gpu-caption gpu-caption--accent">Change</div><p>Only the three inputs</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-git-branch class="step-icon" /><div class="gpu-caption gpu-caption--accent">Update</div><p>A git tag is the version; a rename fails by name</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-warning class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Break</div><p>How do they learn it broke, and how do they fix it?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
.step-icon--muted { color: var(--p-fg-muted); opacity: 0.6; }
</style>

<!--
~2 min: Five answered. The demo answers the last one: how a consuming team learns it broke and fixes it.
-->
---

# One platform team, one package, every team's service

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-users-three class="plan__icon" />
    <p>Platform team writes the component, tags a version</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-package class="plan__icon" />
    <p>Component package: a git repo, discoverable via the private registry</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-file-code class="plan__icon" />
    <p>Consuming team's program: about a dozen lines</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-cloud class="plan__icon" />
    <p>Load balancer, Fargate service, role, log group, tags</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-lightning class="plan__foot-icon" />
  <p>Every service is created and placed the same way.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.15; }
.plan { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; align-items: stretch; gap: 0.7rem; }
.plan__step { position: relative; display: flex; flex-direction: column; gap: 0.9rem; padding-top: 1.9rem; }
.plan__step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.plan__num { position: absolute; top: 0.8rem; right: 1rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-fg-subtle); }
.plan__icon { font-size: 2.3rem; height: 2.8rem; color: var(--p-primary); }
.plan__arrow { align-self: center; font-size: 1.5rem; color: var(--p-accent); }
.plan__foot { display: flex; align-items: center; gap: 0.8rem; margin-top: 1.6rem; }
.plan__foot-icon { font-size: 1.5rem; color: var(--p-primary); flex-shrink: 0; }
</style>

<!--
~4 min: This is what we build. Left to right, the four pieces. The last box is the same every time, which is the point.
-->
---

# The consuming team writes about a dozen lines

<div class="zoom-content">

<div class="big-code code-sm mt-4">

```yaml
resources:
  checkout:
    type: compliance-web-service:ComplianceWebService
    properties:
      serviceName: checkout
      image: nginx:latest
      port: 80
outputs:
  url: ${checkout.url}
```

</div>

<aside class="info-card mt-6" v-click>
  <div class="info-card__label">What the team never writes</div>
  <p>The role, the log group, the tags, the load balancer.</p>
</aside>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
</style>

<!--
~4 min: This is the one place program code appears. The real file has a packages block too; this is the part a consuming team thinks about. Nothing here names an IAM role.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: A golden-path component, published and consumed.</h1>
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
~0.5 min: Divider. Everything so far was the why; now the build.
-->

---

# What we are going to do

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card step" v-click><ph-package class="step__icon" /><p>A component exposes a compliant service behind three inputs</p></div>
  <div class="gpu-card step" v-click><ph-file-code class="step__icon" /><p>A consuming team gets one in about a dozen lines</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-x-circle class="step__icon" /><p>A renamed input breaks consumption by name</p></div>
  <div class="gpu-card gpu-card--accent step" v-click><ph-wrench class="step__icon" /><p>One property rename is the whole fix</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.steps { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.2rem; }
.step { display: flex; flex-direction: column; gap: 0.7rem; padding: 1.2rem 1.3rem; }
.step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.step__icon { font-size: 2rem; color: var(--p-primary); }
</style>

<!--
~2 min: Four beats, as outcomes. The commands come on the next slides.
-->
---

# The interface hides a compliant service behind three inputs

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />01-component</div>
    <div class="big-code code-sm">

```bash
npm install
npx tsc --noEmit
pulumi package get-schema .
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-check-circle /><span>The component typechecks</span></li>
    <li><ph-list-checks /><span>The schema shows three inputs, one output</span></li>
    <li><ph-eye-slash /><span>No resources in the schema's interface</span></li>
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
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
~3 min: Show the component's source in the editor while these run. The schema check confirms inputs serviceName, image, port and output url. Last check of this run was on Pulumi CLI 3.263.0.
-->
---

# About a dozen lines instantiate a compliant service

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />02-consume</div>
    <div class="big-code code-sm">

```bash
pulumi preview
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-check-circle /><span>The component's schema resolves</span></li>
    <li><ph-warning /><span>It then stops at AWS credential validation</span></li>
    <li><ph-prohibit /><span>No pulumi up: no credentials in this build</span></li>
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
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
~3 min: Say plainly: the preview resolves the component against the consumer's properties, then stops at credentials. We did not run pulumi up and will not describe a result.
-->
---

# A renamed input breaks consumption by name, not silently

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />03-breaking-change</div>
    <div class="big-code code-sm">

```bash
pulumi preview
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-x-circle /><span>The plan fails validation</span></li>
    <li><ph-text-aa /><span>The error names <code>name</code></span></li>
    <li><ph-cloud-slash /><span>Before any cloud call</span></li>
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
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
~3 min: The program still says serviceName; the component now wants name. The documented error says Missing required property 'name'. Wording comes from the demo README, captured on the build run.
-->
---

# One property rename is the whole fix

<div class="zoom-content">

<div class="s5__cmd big-code code-sm">

```bash
cp Pulumi.fixed.yaml Pulumi.yaml && pulumi preview
```

</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-pencil-simple /><span><code>serviceName</code> becomes <code>name</code></span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-check-circle /><span>The plan resolves cleanly</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step s5__step--stop" v-click="3"><ph-warning /><span>Then stops at AWS credential validation</span></div>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s5 { margin-top: 1.2rem; }
.s5__cmd pre { margin: 0 !important; white-space: pre-wrap; }
.s5__flow { display: flex; flex-direction: column; align-items: stretch; max-width: 60%; }
.s5__step { display: flex; align-items: center; gap: 0.8rem; padding: 0.7rem 1rem; border: 1.5px solid var(--p-border); border-radius: 12px; background: var(--p-bg-elevated); font-size: 1.15rem; }
.s5__step svg { flex-shrink: 0; font-size: 1.45rem; color: var(--p-primary); }
.s5__step--stop { border-color: color-mix(in srgb, var(--p-primary) 60%, var(--p-border)); background: var(--p-bg); font-weight: 600; }
.s5__arrow { align-self: center; font-size: 1.1rem; color: var(--p-accent); margin: 0.2rem 0; }
</style>

<!--
~1 min: Same consumer, one property changed. Same credential stop as step two. This answers the last question: the error names the property, and the fix is one line.
-->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-5 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/platform-engineering-golden-path" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → platform-engineering-golden-path</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/iac/concepts/components/" dark="#000000" />
    <div class="res-card__title">Components</div>
    <div class="res-card__body">pulumi.com/docs/iac/concepts/components</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/iac/guides/building-extending/components/packaging-components/" dark="#000000" />
    <div class="res-card__title">Packaging Components</div>
    <div class="res-card__body">Packaging Components guide</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/idp/concepts/private-registry/" dark="#000000" />
    <div class="res-card__title">Private Registry</div>
    <div class="res-card__body">IDP Private Registry</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/iac/cli/commands/pulumi_package_publish/" dark="#000000" />
    <div class="res-card__title">pulumi package publish</div>
    <div class="res-card__body">pulumi package publish</div>
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
~1 min: Resources. The repo first, then the docs. Open the links after the session.
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
~0.5 min: Point to the Pulumi journey links. No pitch.
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/platform-engineering-golden-path" dark="#000000" /></div>
      <div class="thanks__qr-label">platform-engineering-golden-path</div>
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
~1.5 min: Questions. If time is short, take the registry add-syntax question first.
-->
