---
theme: "@pulumi/slidev-theme"
title: "Access governance as code: BigQuery, Secret Manager and service-account bindings without console clicks"
info: |
  Access governance as code: BigQuery, Secret Manager and service-account bindings without console clicks: Model least-privilege IAM on Google Cloud and AWS as Pulumi IaC, read the diff before it applies, and block an over-broad binding with a policy pack.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/policy-access-governance-as-code
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
    Access governance as code: BigQuery, Secret Manager and service-account bindings without console clicks
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Model least-privilege IAM on Google Cloud and AWS as Pulumi IaC, read the diff before it applies, and block an over-broad binding with a policy pack
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

<!--
0.5 min. Welcome. Say the title and what the next ninety minutes are.
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
1 min. Introduce yourself in a sentence. Speaker details are a placeholder until the speaker is confirmed.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
0.25 min. Housekeeping first, then the agenda.
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
0.75 min. Where the slides and the code live, and what to have ready for the demo.
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>Why console IAM goes wrong</li>
  <li>Pulumi IaC and the preview diff</li>
  <li>Pulumi Policies as a gate</li>
  <li>The access model we build</li>
  <li>Demo: bind, mirror, block, tear down</li>
  <li>Wrap-up and Q&A</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
0.5 min. Walk the agenda in one breath: the problem, the tech, what we build, the demo.
-->

---

# A 2019 misconfiguration affected about 100 million people in the US

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">US Department of Justice case summary</div>
    <p>"The intrusion occurred through a misconfigured web application firewall that enabled access to the data."</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>Capital One calls it a "configuration vulnerability", reported on July 17, 2019</li>
      <li>About 100 million people in the US and about 6 million in Canada were affected</li>
      <li>The sources name a firewall, not IAM. We use it for the class of problem.</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-detective class="psst__icon" />
  <span><strong>Psssst…</strong> both sources call it a misconfiguration</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
2.5 min. This is the scene for today. In 2019 Capital One disclosed an incident that affected about a hundred million people in the US and about six million in Canada. Read the two sources closely. Capital One calls it a configuration vulnerability. The Department of Justice says a misconfigured web application firewall enabled access to the data. Neither one says the cause was over-broad IAM, so I will not say that. I use it because it is the same kind of failure: one setting was wrong, and the system did what it was told. Today is about the settings that decide who can read your data.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">You can diff the application.</h1>
</div>

<!--
1 min. Start with what we already do well. Application code gets a diff. Somebody reads it before it ships.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">You can't diff the console.</h1>
</div>

<!--
1 min. Now the other half. A grant clicked in a cloud console has no diff in front of it. Nobody reads it before it takes effect. Hold that thought, because the rest of the workshop is about closing that gap.
-->

---

# A clicked grant has no review point. A grant in code has two

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">In the console</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Click, and the grant is live</li>
      <li>No diff before it applies</li>
      <li>Nobody can review it first</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">In code</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Reviewed as a diff</li>
      <li>Shown in <code>pulumi preview</code></li>
      <li>Checked by a policy pack</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
2.5 min. Left side, the console. You click, the grant is live. There is nothing to read before it applies. Right side, the same grant in code. A teammate reviews the diff. The preview shows the access change. And later we add a policy pack that checks it by machine. To be fair, cloud providers do log console changes after the fact. The difference is when you get to look: before, or afterwards.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">An over-broad grant works silently.</h1>
</div>

<!--
1.5 min. The reason this matters: a grant that is too broad does not fail. It works. Everything keeps running, and nobody sees a symptom. So the only moment to catch it is before it applies. That is why we want the review in front of the change, not behind it.
-->

---

# Five questions decide whether you can trust access you did not click

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-magnifying-glass class="step-icon" /><div class="gpu-caption gpu-caption--muted">Where</div><p>Where does each grant live?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-git-pull-request class="step-icon" /><div class="gpu-caption gpu-caption--muted">Before</div><p>What changes before it applies?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-arrows-left-right class="step-icon" /><div class="gpu-caption gpu-caption--muted">Both clouds</div><p>Is it the same on both clouds?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-scales class="step-icon" /><div class="gpu-caption gpu-caption--muted">Too broad</div><p>What counts as too broad?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-shield-check class="step-icon" /><div class="gpu-caption gpu-caption--muted">Stops</div><p>Does it really stop before anything changes?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
2 min. These five questions are the spine of the session. Where does each grant live. What changes before it applies. Is it the same on both clouds. What counts as too broad. And the last one, which the demo answers: does it really stop before anything changes. I will bring this slide back twice so you can see what is answered and what is still open.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[5rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Grants belong on the resource that needs them</h1>
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
0.5 min. First question. Where does each grant live?
-->

---

# Dataset, secret and service account each get their own binding type

<div class="zoom-content">

<div class="compose">
  <div class="compose__stack">
    <div class="gpu-caption">The program, bottom to top</div>
    <div class="piece piece--mixin" v-click="3"><ph-user-gear />gcp.serviceaccount.IAMMember</div>
    <div class="piece piece--mixin" v-click="2"><ph-key />gcp.secretmanager.SecretIamMember</div>
    <div class="piece piece--sandbox" v-click="1"><ph-cube />gcp.bigquery.DatasetIamMember</div>
  </div>
  <ul class="rules" v-click="4">
    <li><ph-cube /><span>One binding resource per kind of target</span></li>
    <li><ph-user-circle /><span><code>DatasetIamMember</code> adds one member and keeps the others</span></li>
    <li><ph-lock-key /><span>One role, one member, one resource</span></li>
    <li><ph-git-pull-request /><span>Each binding is a line in a diff</span></li>
  </ul>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.compose { display: grid; grid-template-columns: 1fr 1.15fr; gap: 2.5rem; align-items: center; }
.compose__stack { display: flex; flex-direction: column; gap: 0.45rem; }
.compose__stack .gpu-caption { margin-bottom: 0.3rem; }
.piece { display: flex; align-items: center; gap: 0.7rem; padding: 0.65rem 1rem; border-radius: 12px; border: 1.5px solid var(--p-border); font-family: var(--slidev-font-mono); font-size: 1rem; color: var(--p-fg); }
.piece svg { flex-shrink: 0; font-size: 1.3rem; color: var(--p-primary); }
.piece--mixin { border-style: dashed; margin-inline: 1.2rem; }
.piece--sandbox { background: var(--p-bg-elevated); border-color: color-mix(in srgb, var(--p-primary) 60%, var(--p-border)); margin-inline: 0.6rem; }
.piece--template { background: var(--p-bg-elevated); }
.rules { list-style: none; padding: 0; margin: 0; }
.rules li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.2rem; margin: 0 0 0.95rem; }
.rules li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
.compose__note { display: flex; align-items: center; gap: 0.5rem; margin-top: 1.2rem; font-size: 0.95rem; color: var(--p-fg-muted); }
</style>

<!--
2 min. In the GCP provider each target has its own binding resource. A dataset has DatasetIamMember. A secret has SecretIamMember. A service account has IAMMember. The registry docs describe the Member resources as non-authoritative: they grant a role to one new member and keep the other members as they are. So each grant is one resource with one role and one member, and that is exactly the shape a reviewer can read.
-->

---

# The casing differs between resources: IAMMember against IamMember

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Spelled “IAM”</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li><code>gcp.serviceaccount.IAMMember</code></li>
      <li><code>gcp.projects.IAMMember</code></li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Spelled “Iam”</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li><code>gcp.bigquery.DatasetIamMember</code></li>
      <li><code>gcp.secretmanager.SecretIamMember</code></li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.15; }
</style>

<!--
2 min. A small thing that will bite you when you type the code from memory. The service account and project resources spell it IAM in capitals. The BigQuery dataset and Secret Manager resources spell it Iam. The type tokens differ too, for example iAMMember against datasetIamMember. If your program will not compile, check the casing first.
-->

---

# A project-level role reaches everything in the project

<div class="zoom-content">

<div class="bounds">
  <div class="bound" v-click><ph-cube /><div class="bound__want">a dataset binding</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">One dataset</div></div>
  <div class="bound" v-click><ph-key /><div class="bound__want">a secret binding</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">One secret</div></div>
  <div class="bound" v-click><ph-user-gear /><div class="bound__want">a service account binding</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">One service account</div></div>
  <div class="bound" v-click><ph-buildings /><div class="bound__want">a project-level role</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Everything in the project</div></div>
  <div class="bound" v-click><ph-warning /><div class="bound__want">a basic role such as Owner</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Thousands of permissions, across all services</div></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
.bounds { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem 1.4rem; }
.bound { display: grid; grid-template-columns: auto 9.5rem auto 1fr; align-items: center; gap: 0.7rem; padding: 0.8rem 1rem; border: 1.5px solid var(--p-border); border-radius: 14px; background: var(--p-bg-elevated); }
.bound > svg:first-child { font-size: 1.5rem; color: var(--p-primary); }
.bound__want { font-family: var(--slidev-font-mono); font-size: 0.92rem; font-weight: 600; color: var(--p-fg-muted); }
.bound__arrow { font-size: 1.1rem; color: var(--p-accent); }
.bound__by { font-size: 1.05rem; line-height: 1.3; color: var(--p-fg); }
</style>

<!--
2 min. Why we bind on the resource and not on the project. In Google Cloud, allow policies on child resources inherit from their parent. A role granted on the project reaches everything in the project. And Google's own guidance says basic roles include thousands of permissions across all services, so do not use them in production unless there is no alternative. A binding on one dataset reaches one dataset. That is the difference we want visible in a diff.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[5rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The diff is the review</h1>
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
0.5 min. Second question. What changes before it applies?
-->

---

# pulumi preview shows the access change before it applies

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-terminal-window class="plan__icon" />
    <p>You run <code>pulumi preview</code></p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-magnifying-glass class="plan__icon" />
    <p>Pulumi compares the program with the stack</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-note-pencil class="plan__icon" />
    <p>Each new binding shows up as a create</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-check-circle class="plan__icon" />
    <p>Nothing changes until <code>pulumi up</code></p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-eye class="plan__foot-icon" />
  <p><strong>The reviewer reads the preview.</strong> Same habit as reading a diff.</p>
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
2.5 min. This is the second answer. You run pulumi preview. Pulumi compares your program with what the stack already has and lists what it would create, change or delete. For access, that means each new binding appears as a line you can read. Nothing is applied until you run pulumi up. In a team this is the artifact a reviewer looks at, the same way they look at a code diff.
-->

---

# Every update lands in the stack's history

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-terminal-window class="chain__icon" />
    <div class="gpu-caption">You</div>
    <code>pulumi up</code>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-cloud-check class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Pulumi Cloud</div>
    <span>Stores the stack</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-clock-clockwise class="chain__icon" />
    <div class="gpu-caption">History</div>
    <code>pulumi stack history</code>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>Each change to access is one update you can list.</p>
</aside>

<div class="facts" v-click="5">
  <div class="fact"><ph-clock-clockwise /><p>Updates are listed per stack</p></div>
  <div class="fact"><ph-git-pull-request /><p>The program change sits in your Git history</p></div>
  <div class="fact"><ph-eye /><p>Review the diff, then read the record</p></div>
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
</style>

<!--
2 min. A short point on the record. The pulumi stack history command, per the CLI reference, displays data about the previous updates for a stack. So every change to access is one update you can list. Your Git history holds the program change, the stack history holds the update that applied it. I am deliberately not claiming more than that. If you need a full audit trail, the cloud providers' own audit logs are still the place for that.
-->

---

# Two questions covered, three to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-magnifying-glass class="step-icon" /><div class="gpu-caption gpu-caption--accent">Where</div><p>On the resource, one binding type per target</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-git-pull-request class="step-icon" /><div class="gpu-caption gpu-caption--accent">Before</div><p><code>pulumi preview</code> and the stack history</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-arrows-left-right class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Both clouds</div><p>Is it the same on both clouds?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-scales class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Too broad</div><p>What counts as too broad?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-shield-check class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Stops</div><p>Does it really stop before anything changes?</p></div>
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
1 min. Quick recap. Where does each grant live: on the resource that needs it. What changes before it applies: the preview. Three are open. Next one is the second cloud.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[5rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">AWS gets the same shape</h1>
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
0.5 min. Third question. Is it the same on both clouds?
-->

---

# An AWS role scoped to one action set mirrors the GCP binding

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Google Cloud</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li><code>gcp.bigquery.DatasetIamMember</code></li>
      <li>One role on one dataset</li>
      <li>One member</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">AWS</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li><code>aws.iam.Role</code> and <code>aws.iam.RolePolicy</code></li>
      <li><code>s3:ListBucket</code> on one bucket</li>
      <li><code>s3:GetObject</code> on its objects</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
2 min. The AWS half of the demo uses a role and an inline role policy. The policy allows s3:ListBucket on one bucket and s3:GetObject on that bucket's objects, and nothing else. The shape is the same as on Google Cloud: a narrow grant, written as a resource, shown in a preview. The vocabulary differs, the habit does not.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[5rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Too broad needs a definition the machine can check</h1>
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
0.5 min. Fourth question. What counts as too broad? A reviewer is not enough on a busy day, so we write the rules down.
-->

---

# A policy pack runs on every preview and every update

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-terminal-window class="plan__icon" />
    <p><code>pulumi preview --policy-pack</code></p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2">
    <span class="plan__num">2</span>
    <ph-puzzle-piece class="plan__icon" />
    <p>The program registers each resource</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">3</span>
    <ph-gavel class="plan__icon" />
    <p>The pack validates each one before it is sent to the engine</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4">
    <span class="plan__num">4</span>
    <ph-prohibit class="plan__icon" />
    <p>A mandatory violation stops the update</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-shield-check class="plan__foot-icon" />
  <p><strong>Pulumi Policies:</strong> the rule runs where you already run Pulumi.</p>
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
2 min. Pulumi Policies runs a policy pack during pulumi preview or pulumi up. A resource validation policy looks at each resource before it is sent to the engine, so it can block a bad resource in a preview and in an update. The enforcement level decides what happens: advisory prints a warning, mandatory blocks the update. Our pack is mandatory.
-->

---

# Four rules cover the over-broad cases

<div class="zoom-content">

<div class="grid grid-cols-2 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-globe class="step-icon" /><div class="gpu-caption gpu-caption--muted">No public members</div><p>Never allUsers or allAuthenticatedUsers on a GCP IAM member</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-buildings class="step-icon" /><div class="gpu-caption gpu-caption--muted">No project-level service account binding</div><p>Bind on the dataset, secret or service account instead</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-warning class="step-icon" /><div class="gpu-caption gpu-caption--muted">No basic roles</div><p>No roles/owner and no roles/editor</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-prohibit class="step-icon" /><div class="gpu-caption gpu-caption--muted">No wildcard AWS actions</div><p>List the exact actions in an Allow statement</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
2.5 min. Four rules, written by hand in Python for this workshop. One: no public principals on a GCP IAM member. Two: no service account bound at project level. Three: no basic roles, owner or editor. Four: no wildcard actions in an AWS inline role policy. The rules are plain Python functions with unit tests, so you can read them in a minute. The authoring docs show an RDS example, not IAM, so these rules are ours.
-->

---

# Where this breaks today: a preventative pack only sees what Pulumi manages

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">A preventative pack</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Runs during preview and update</li>
      <li>Blocks a bad change before it reaches the cloud</li>
      <li>Sees only the resources Pulumi manages</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">A click in the console</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Never passes through Pulumi</li>
      <li>Is not checked by this pack</li>
      <li>Audit policy groups can scan cloud accounts</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
2 min. A real limit, so let me be plain about it. A preventative pack runs where Pulumi runs. The policy group docs say it sees only the resources Pulumi manages. A grant someone clicks in the console never goes through it. Pulumi Policies also has audit policy groups, which scan cloud accounts on a schedule and cover resources created by hand. They report violations, they do not block them. We do not demo that today.
-->

---

# Four questions answered, one to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-magnifying-glass class="step-icon" /><div class="gpu-caption gpu-caption--accent">Where</div><p>On the resource, one binding type per target</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-git-pull-request class="step-icon" /><div class="gpu-caption gpu-caption--accent">Before</div><p><code>pulumi preview</code> and the stack history</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-arrows-left-right class="step-icon" /><div class="gpu-caption gpu-caption--accent">Both clouds</div><p>Same shape: an <code>aws.iam.RolePolicy</code></p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-scales class="step-icon" /><div class="gpu-caption gpu-caption--accent">Too broad</div><p>A policy pack with four rules</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-shield-check class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">Stops</div><p>Does it really stop before anything changes?</p></div>
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
1 min. Four answered. The last one is the one that needs a demo: does it really stop before anything changes? We will try to widen a binding and watch what happens.
-->

---

# The access model we will build spans two clouds and one gate

<div class="zoom-content">

<div class="setup">
  <div class="gpu-card gpu-card--primary zone" v-click>
    <div class="zone__head"><ph-cloud class="zone__icon" /><div class="gpu-caption gpu-caption--accent">Google Cloud</div></div>
    <ul class="zone__list">
      <li><ph-cube /><span>A BigQuery dataset, one viewer binding</span></li>
      <li><ph-key /><span>A secret, one reader binding</span></li>
      <li><ph-user-gear /><span>A service account, one binding on it</span></li>
    </ul>
  </div>
  <div class="setup__link" v-click><ph-gavel /></div>
  <div class="gpu-card gpu-card--muted zone zone--cloud" v-click>
    <div class="zone__head"><ph-cloud class="zone__icon" /><div class="gpu-caption">AWS</div></div>
    <ph-lock-key class="zone__hero" />
    <p>A role with one narrow inline policy</p>
  </div>
</div>

<aside class="info-card" v-click>
  <div class="info-card__label">The gate</div>
  <p>One policy pack checks both on every preview and update.</p>
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
2 min. Here is what we will build. On Google Cloud: a BigQuery dataset with one viewer binding, a Secret Manager secret with one reader binding, and a service account with one binding on it. On AWS: a role with one narrow inline policy. In the middle, the gate: a policy pack attached to the preview and the update. Two stacks, one gate.
-->

---

# The program is a handful of binding resources

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-file-code />01-gcp, Python</div>
<div class="big-code code-sm">

```python
gcp.bigquery.DatasetIamMember("dataset-viewer", dataset_id=ds.dataset_id,
    role="roles/bigquery.dataViewer", member=viewer)
gcp.secretmanager.SecretIamMember("secret-accessor", secret_id=sec.secret_id,
    role="roles/secretmanager.secretAccessor", member=reader)
gcp.serviceaccount.IAMMember("sa-token-creator", service_account_id=sa.name,
    role="roles/iam.serviceAccountTokenCreator", member=viewer)
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-lock-key /><span>One role per binding</span></li>
    <li><ph-user-circle /><span>One member per binding</span></li>
    <li><ph-eye /><span>Each one reads in a diff</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
.s1 { display: grid; grid-template-columns: minmax(0,2.2fr) minmax(0,1fr); gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; white-space: pre-wrap !important; overflow-wrap: anywhere; }
.s1__steps pre code { white-space: pre-wrap !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts code { overflow-wrap: anywhere; font-size: 0.8em; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
1.5 min. This is the only program code in the deck, shortened. Three binding resources. Each has a role and a member. That is the whole point: there is very little to read, and every line is a decision about access. In the demo you will see the full file in the editor.
-->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Access governance as code.</h1>
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
0.25 min. The divider. From here we run the steps.
-->

---

# What we are going to do

<div class="zoom-content mt-4">

<div class="steps">
  <div class="gpu-card step" v-click><ph-key class="step__icon" /><p>One dataset, one narrow viewer binding</p></div>
  <div class="gpu-card step" v-click><ph-vault class="step__icon" /><p>One secret, one reader</p></div>
  <div class="gpu-card step" v-click><ph-user-gear class="step__icon" /><p>One role on the service account</p></div>
  <div class="gpu-card step" v-click><ph-cloud class="step__icon" /><p>One AWS role, two actions</p></div>
  <div class="gpu-card step" v-click><ph-shield-check class="step__icon" /><p>The policy pack passes its own tests</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-shield-warning class="step__icon" /><p>The widened binding is blocked</p></div>
  <div class="gpu-card step" v-click><ph-trash class="step__icon" /><p>Nothing left in either cloud</p></div>
</div>

<aside class="info-card" v-click><p>Steps 1 to 3 run <code>pulumi config set step N &amp;&amp; pulumi preview &amp;&amp; pulumi up</code> in <code>01-gcp</code>.</p></aside>

</div>

<style scoped>
.zoom-content { zoom: 1.05; }
.steps { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.2rem; }
.step { display: flex; flex-direction: row; align-items: center; gap: 0.9rem; padding: 0.8rem 1.1rem; }
.step p { margin: 0 !important; font-size: 1.2rem; line-height: 1.35; }
.step__icon { font-size: 2rem; color: var(--p-primary); }
</style>

<!--
2 min. Seven steps. One to three build the Google Cloud side with the same program, one step value at a time. Four is the AWS mirror. Five runs the policy pack's own tests. Six is the proof: widen a binding and watch it get blocked. Seven tears it all down. Steps one to three all use the same command in the 01-gcp folder, so I show it once, here.
-->

---

# 1 · One dataset, one narrow viewer binding

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-terminal-window />01-gcp</div>
<div class="big-code code-sm">

```bash
cd 01-gcp
pulumi config set step 1 && pulumi preview && pulumi up
```

</div>
    <div class="s1__label"><ph-magnifying-glass />check</div>
<div class="big-code code-sm">

```bash
bq show --format=prettyjson access_demo | grep -A3 dataViewer
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-note-pencil /><span>Preview lists a dataset and one binding</span></li>
    <li><ph-seal-check /><span>One <code>roles/bigquery.dataViewer</code> member</span></li>
    <li><ph-eye /><span>The dataset starts empty</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: minmax(0,1.3fr) minmax(0,1fr); gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; white-space: pre-wrap !important; overflow-wrap: anywhere; }
.s1__steps pre code { white-space: pre-wrap !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts code { overflow-wrap: anywhere; font-size: 0.8em; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
6 min. Step one. Set step to one, preview, then up. Read the preview before you approve it: a dataset and one binding. Then prove it with the bq command and look for the dataViewer role. One member, one role, on one dataset. The dataset is empty on purpose, so there are no storage or query charges.
-->

---

# 2 · The secret is readable by one principal

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-terminal-window />01-gcp</div>
<div class="big-code code-sm">

```bash
pulumi config set step 2 && pulumi preview && pulumi up
```

</div>
    <div class="s1__label"><ph-magnifying-glass />check</div>
<div class="big-code code-sm">

```bash
gcloud secrets get-iam-policy access-demo-secret
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-note-pencil /><span>Preview adds a secret and one binding</span></li>
    <li><ph-seal-check /><span>One <code>roles/secretmanager.secretAccessor</code> binding</span></li>
    <li><ph-eye /><span>The preview shows only what step 2 adds</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: minmax(0,1.3fr) minmax(0,1fr); gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; white-space: pre-wrap !important; overflow-wrap: anywhere; }
.s1__steps pre code { white-space: pre-wrap !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts code { overflow-wrap: anywhere; font-size: 0.8em; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
5 min. Step two. Same command, step two. The preview shows only what is new: a secret and one binding. The gcloud command prints the policy on the secret. You should see one secretAccessor binding and nobody else.
-->

---

# 3 · The service account carries one role, not the project

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-terminal-window />01-gcp</div>
<div class="big-code code-sm">

```bash
pulumi config set step 3 && pulumi preview && pulumi up
```

</div>
    <div class="s1__label"><ph-magnifying-glass />check</div>
<div class="big-code code-sm">

```bash
gcloud iam service-accounts get-iam-policy \
  access-demo-runner@<your-project-id>.iam.gserviceaccount.com
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-note-pencil /><span>Preview adds a service account and one binding</span></li>
    <li><ph-seal-check /><span>One <code>roles/iam.serviceAccountTokenCreator</code> binding</span></li>
    <li><ph-prohibit /><span>No project-level role for it</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: minmax(0,1.3fr) minmax(0,1fr); gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; white-space: pre-wrap !important; overflow-wrap: anywhere; }
.s1__steps pre code { white-space: pre-wrap !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts code { overflow-wrap: anywhere; font-size: 0.8em; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
5 min. Step three. A service account and one binding on the service account itself. The check prints its policy: one serviceAccountTokenCreator binding. And no project-level role for it. Remember that, because step six goes after exactly that.
-->

---

# 4 · The AWS role can do one thing

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-terminal-window />02-aws</div>
<div class="big-code code-sm">

```bash
cd 02-aws
pulumi preview && pulumi up
```

</div>
    <div class="s1__label"><ph-magnifying-glass />check</div>
<div class="big-code code-sm">

```bash
aws iam get-role-policy --role-name "$(pulumi stack output roleName)" \
  --policy-name "$(pulumi stack output policyName)"
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-note-pencil /><span>Preview adds a role and an inline policy</span></li>
    <li><ph-seal-check /><span><code>s3:ListBucket</code> on one bucket</span></li>
    <li><ph-seal-check /><span><code>s3:GetObject</code> on its objects, nothing else</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: minmax(0,1.3fr) minmax(0,1fr); gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; white-space: pre-wrap !important; overflow-wrap: anywhere; }
.s1__steps pre code { white-space: pre-wrap !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts code { overflow-wrap: anywhere; font-size: 0.8em; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
6 min. Step four, the AWS mirror. Preview and up in the 02-aws folder. Then read the inline policy back with the aws command. Two actions on one bucket, nothing else. Same habit as on Google Cloud.
-->

---

# 5 · The policy pack passes its own tests

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
venv/bin/pytest   # in 03-policy
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-globe /><div><div class="gpu-caption gpu-caption--accent">1 · Public</div><code>No allUsers on any member</code></div></div>
  <div class="gpu-card check" v-click><ph-buildings /><div><div class="gpu-caption gpu-caption--accent">2 · Project</div><code>No project-level service account</code></div></div>
  <div class="gpu-card check" v-click><ph-warning /><div><div class="gpu-caption gpu-caption--accent">3 · Basic</div><code>No owner or editor</code></div></div>
  <div class="gpu-card check" v-click><ph-prohibit /><div><div class="gpu-caption gpu-caption--accent">4 · Wildcards</div><code>No wildcard AWS action</code></div></div>
  <div class="gpu-card check" v-click><ph-check-circle /><div><div class="gpu-caption gpu-caption--accent">5 · Passing</div><code>Narrow bindings pass</code></div></div>
  <div class="gpu-card check" v-click><ph-git-pull-request /><div><div class="gpu-caption gpu-caption--accent">6 · Attached</div><code><code>pulumi preview --policy-pack ../03-policy</code></code></div></div>
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
7 min. Step five. The rules are plain Python, so they have unit tests. Run pytest in the 03-policy folder. Then attach the pack to a preview in 01-gcp: pulumi preview with the policy-pack flag. The expected result is the list of changes and no violations, because everything we built so far is narrow.
-->

---

# 6 · The widened binding is blocked before anything changes

<div class="zoom-content">

<div class="s5__cmd big-code code-sm">

```bash
./04-widen/widen.sh
```

</div>

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-terminal-window /><span>The script sets <code>widen=true</code></span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-gavel /><span>It runs <code>pulumi up --policy-pack</code></span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step s5__step--stop" v-click="3"><ph-shield-warning /><span>Two mandatory violations, nothing applied</span></div>
  </div>
  <div class="s5__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">The binding it tries</div><p>Project-level Owner for the service account, resource <code>sa-project-owner</code>.</p></aside>
    <aside class="info-card" v-click="5"><div class="info-card__label">Reset between runs</div><p><code>pulumi config set widen false</code></p></aside>
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
7 min. Step six, the proof. The script sets widen to true, which adds project-level Owner for the service account, and runs pulumi up with the policy pack. Expect two mandatory violations on sa-project-owner: one for the project-level service account binding, one for the basic role. Nothing is applied. That answers the last question: yes, it stops before anything changes. Between runs, set widen back to false.
-->

---

# 7 · Nothing is left in either cloud

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-terminal-window />teardown</div>
<div class="big-code code-sm">

```bash
./05-teardown/destroy.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-trash /><span>Both stacks are destroyed</span></li>
    <li><ph-clock /><span>GCP keeps a deleted service account for 30 days</span></li>
    <li><ph-check-circle /><span>The final listing prints nothing</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.s1 { display: grid; grid-template-columns: minmax(0,1.3fr) minmax(0,1fr); gap: 2rem; align-items: center; }
.s1__steps { display: flex; flex-direction: column; gap: 0.5rem; }
.s1__steps pre { margin: 0 !important; white-space: pre-wrap !important; overflow-wrap: anywhere; }
.s1__steps pre code { white-space: pre-wrap !important; }
.s1__label { display: flex; align-items: center; gap: 0.45rem; font-family: var(--slidev-font-mono); font-size: 0.95rem; font-weight: 700; color: var(--p-primary); text-transform: uppercase; letter-spacing: 0.06em; }
.s1__label:not(:first-child) { margin-top: 0.6rem; }
.s1__facts { list-style: none; padding: 0; margin: 0; }
.s1__facts li { display: flex; align-items: center; gap: 0.8rem; font-size: 1.25rem; margin: 0 0 1rem; }
.s1__facts code { overflow-wrap: anywhere; font-size: 0.8em; }
.s1__facts li svg { flex-shrink: 0; font-size: 1.5rem; color: var(--p-primary); }
</style>

<!--
3 min. Step seven. The script destroys both stacks and then lists any access-demo-runner service accounts that are still active. Empty output means none. Google Cloud keeps a deleted service account recoverable for thirty days, which is why the script checks.
-->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-4 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/policy-access-governance-as-code" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → policy-access-governance-as-code</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/insights/policy/policy-packs/authoring/" dark="#000000" />
    <div class="res-card__title">Authoring a policy pack</div>
    <div class="res-card__body">pulumi.com/docs/insights/policy</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/registry/packages/gcp/api-docs/bigquery/datasetiammember/" dark="#000000" />
    <div class="res-card__title">gcp.bigquery.DatasetIamMember in the Pulumi Registry</div>
    <div class="res-card__body">pulumi.com/registry (gcp)</div>
  </div>
  <div class="res-card">
    <QRCode data="https://cloud.google.com/iam/docs/using-iam-securely" dark="#000000" />
    <div class="res-card__title">Google Cloud: Using IAM securely</div>
    <div class="res-card__body">cloud.google.com/iam</div>
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
1 min. Resources: the workshop repo and the docs. The repo link works once the pull request is merged.
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
0.25 min. Where to go next.
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/policy-access-governance-as-code" dark="#000000" /></div>
      <div class="thanks__qr-label">policy-access-governance-as-code</div>
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
7.5 min. Questions, and a buffer for the demo to run long.
-->
