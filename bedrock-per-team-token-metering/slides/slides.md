---
theme: "@pulumi/slidev-theme"
title: "Who Spent All the Tokens? Per-Team AI Cost Control as Code"
info: |
  Who Spent All the Tokens? Per-Team AI Cost Control as Code.
  Adam Gordon Bell and Engin Diri, Pulumi. 60 minutes, demo-only.

  Repo: https://github.com/pulumi/workshops/tree/main/bedrock-per-team-token-metering
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
  <h1 class="!text-[5.4rem] !leading-[1.04] !font-semibold !tracking-tight !mb-6 !max-w-[95%]">
    Who Spent All the Tokens?
  </h1>
  <p class="!mt-2 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Per-Team AI Cost Control as Code
  </p>
  <p class="!mt-8 !text-[1.8rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Adam Gordon Bell · Engin Diri · Pulumi
  </p>
</div>

<!--
- Welcome. Sixty minutes, one demo, nothing to follow along with.
- By the end you can say which team spent the tokens on a shared Bedrock account, and stop the next untagged profile before it exists.
-->

---

<div class="absolute inset-0 flex items-center px-24 gap-20">
  <div class="flex-shrink-0">
    <img src="/img/adam-gordon-bell.png" class="w-[28rem] rounded-2xl shadow-xl border-4" style="border-color: rgba(126,107,255,0.45)" alt="Adam Gordon Bell" />
  </div>
  <div class="flex-1">
    <h1 class="!text-[7rem] !leading-[1.02] !font-semibold !tracking-tight !mb-4 !text-[var(--p-primary)]">Adam Gordon Bell</h1>
    <p class="!text-[2.5rem] !leading-relaxed !m-0 opacity-90">
      Community Engineer at <strong class="!text-[var(--p-primary)]">Pulumi</strong>
    </p>
    <div class="!mt-8 flex items-center gap-8 !text-[1.5rem] opacity-70">
      <span class="flex items-center gap-2"><carbon-logo-x /> @adamgordonbell</span>
      <span class="flex items-center gap-2"><carbon-logo-linkedin /> adamgordonbell</span>
      <span class="flex items-center gap-2"><carbon-logo-github /> adamgordonbell</span>
    </div>
    <p class="!mt-10 !text-[1.75rem] !leading-relaxed opacity-70 !m-0">
      Host of the CoRecursive podcast.<br/>
      Telling the stories behind the code.
    </p>
  </div>
</div>

<!--
- Adam: Community Engineer at Pulumi, host of CoRecursive.
- Drives the demo today.
-->

---

<div class="absolute inset-0 flex items-center px-24 gap-20">
  <div class="flex-shrink-0">
    <img src="/img/engin-diri.jpg" class="w-[28rem] rounded-2xl shadow-xl border-4" style="border-color: rgba(126,107,255,0.45)" alt="Engin Diri" />
  </div>
  <div class="flex-1">
    <h1 class="!text-[7rem] !leading-[1.02] !font-semibold !tracking-tight !mb-4 !text-[var(--p-primary)]">Engin Diri</h1>
    <p class="!text-[2.5rem] !leading-relaxed !m-0 opacity-90">
      Senior Solutions Architect at <strong class="!text-[var(--p-primary)]">Pulumi</strong>
    </p>
    <div class="!mt-8 flex items-center gap-8 !text-[1.5rem] opacity-70">
      <span class="flex items-center gap-2"><carbon-logo-x /> @_ediri</span>
      <span class="flex items-center gap-2"><carbon-logo-linkedin /> engin-diri</span>
      <span class="flex items-center gap-2"><carbon-logo-github /> dirien</span>
    </div>
    <p class="!mt-10 !text-[1.75rem] !leading-relaxed opacity-70 !m-0">
      Building platform tooling and infrastructure-as-code.<br/>
      Helping teams ship cloud infrastructure faster. With and without agents.
    </p>
  </div>
</div>

<!--
- Engin: Senior Solutions Architect at Pulumi.
- On chat and Q&A throughout; jumps in on the AWS details.
-->

---

# Housekeeping and agenda

<div class="zoom-content">

<div class="grid grid-cols-2 gap-12 mt-6">
  <div>
    <div class="gpu-caption gpu-caption--accent">Housekeeping</div>
    <ul class="!mt-4 !text-[1.3rem] !leading-relaxed space-y-3">
      <li>We <strong>present and demo</strong>, nothing to follow along with</li>
      <li>Ask questions <strong>any time</strong> in the Q&amp;A tab</li>
      <li>The repo goes home with you, QR codes at the end</li>
      <li>The recording link comes by email</li>
    </ul>
  </div>
  <div>
    <div class="gpu-caption gpu-caption--accent">Agenda</div>
    <ul class="!mt-4 !text-[1.3rem] !leading-relaxed space-y-3">
      <li>The unattributable bill</li>
      <li>Who, what, and what stops a mistake</li>
      <li>Token counts in CloudWatch</li>
      <li>Live demo, eleven steps</li>
      <li>Wrap-up and Q&amp;A</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.5; }
</style>

<!--
- Nothing to install, nothing to follow along with; Adam drives, Engin is on chat.
- Questions any time in the Q&A tab, Engin answers as we go or pulls them up at the end.
- The repo and the slides go home with you; QR codes on the last two slides.
- One breath on the agenda: the problem, three questions, the metrics, then the demo.
-->

---

# A conference session asked the question out loud

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">The session title</div>
    <p>"FinOps for AI Agents: Who Spent All the Tokens?"</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>AI Engineer World's Fair 2026</li>
      <li>Tisha Chawla and Susheem Koul, Microsoft</li>
      <li>Source: ai.engineer/worldsfair/2026, schedule</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-detective class="psst__icon" />
  <span><strong>One shared role</strong> is enough to lose the owner of a bill</span>
</div>

</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
- A conference put the question in a session title: who spent all the tokens.
- Read it slowly. The monitoring you already run was built for requests, so it cannot answer it.
- Ask the room, in chat: who has had an AI bill they could not explain?
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[4rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[85%]">98% of respondents now manage AI spend (up from 63% in 2025 and 31% in 2024).</h1>
  <p class="!mt-8 !text-[1.4rem] opacity-70">State of FinOps 2026, FinOps Foundation, data.finops.org</p>
</div>

<!--
- State of FinOps 2026: nearly everyone manages AI spend now; two years ago fewer than a third did.
- Managing it is the easy claim. Doing it per team is the hard part, and that is today.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Nobody can say which team spent the tokens.</h1>
</div>

<!--
- The whole workshop in one line. Pause after it.
-->

---

# One shared role hides the team behind the call

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">One shared setup</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Every team calls the model directly</li>
      <li>The bill shows one line for the model</li>
      <li>A wildcard grant lets anyone invoke anything</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">One profile and one role per team</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Each call names its team's profile</li>
      <li>The profile's tags follow the call into billing</li>
      <li>The role can invoke that profile and nothing else</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
- The obvious setup is one role and the model id. It works, and it tells you nothing about who called.
- The fix has two halves: a profile that carries the team, and a role that can only reach that profile.
- Both are cloud resources, so both live in Pulumi code.
-->

---
routeAlias: stage-map
---

# Four questions, and that's the hour

<div class="map4 !mt-8">

  <Link to="stage-who" class="mcard-link">
    <div class="mcard">
      <div class="mnum">1</div>
      <div class="mname">who</div>
      <div class="mbody">Who spent these tokens? A <strong>tagged inference profile</strong> per team.</div>
      <div class="mgo" aria-hidden="true">&rarr; jump</div>
    </div>
  </Link>

  <Link to="stage-what" class="mcard-link">
    <div class="mcard">
      <div class="mnum">2</div>
      <div class="mname">what</div>
      <div class="mbody">What may a team call? A role that reaches <strong>its own profile</strong> and nothing else.</div>
      <div class="mgo" aria-hidden="true">&rarr; jump</div>
    </div>
  </Link>

  <Link to="stage-stop" class="mcard-link">
    <div class="mcard">
      <div class="mnum">3</div>
      <div class="mname">stop</div>
      <div class="mbody">What stops a mistake before it exists? A policy pack that <strong>fails the preview</strong>.</div>
      <div class="mgo" aria-hidden="true">&rarr; jump</div>
    </div>
  </Link>

  <Link to="stage-howfast" class="mcard-link">
    <div class="mcard">
      <div class="mnum">4</div>
      <div class="mname">how fast</div>
      <div class="mbody">How fast do the counts show up? Minutes in CloudWatch, a day on the invoice. <strong>The demo measures it.</strong></div>
      <div class="mgo" aria-hidden="true">&rarr; jump</div>
    </div>
  </Link>

</div>

<StageMap size="lg" />

<style scoped>
.map4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
/* Each card jumps to its section. The whole card is the target, so it works
   from the back of the room with a trackpad and not just on the small corner strip. */
.mcard-link { display: block; text-decoration: none; color: inherit; border-radius: 14px; }
.mcard {
  position: relative; display: flex; flex-direction: column; height: 100%;
  border: 2px solid color-mix(in oklch, var(--p-primary) 42%, transparent);
  border-radius: 14px; padding: 1.6rem 1.3rem 1.1rem;
  transition: border-color .18s, transform .18s, background .18s;
}
.mcard-link:hover .mcard {
  border-color: var(--p-primary);
  background: color-mix(in oklch, var(--p-primary) 9%, transparent);
  transform: translateY(-2px);
}
/* The affordance is a word plus an arrow, no colour-only cue. */
.mgo {
  margin-top: auto; padding-top: 0.9rem;
  font-family: var(--slidev-font-mono, ui-monospace, monospace);
  font-size: 0.92rem; letter-spacing: 0.08em; text-transform: uppercase;
  opacity: 0.4; transition: opacity .18s;
}
.mcard-link:hover .mgo { opacity: 0.95; color: var(--p-primary); }
.mnum {
  position: absolute; top: -1.05rem; left: 1.2rem; width: 2.1rem; height: 2.1rem; border-radius: 999px;
  background: var(--p-fg, #111); color: #fff; font-size: 1.2rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.mname {
  font-family: var(--slidev-font-mono, ui-monospace, monospace);
  font-size: 1.5rem; font-weight: 700; color: var(--p-primary); letter-spacing: 0.02em; margin-bottom: 0.85rem;
}
.mbody { font-size: 1.24rem; line-height: 1.6; opacity: 0.9; }
</style>

<!--
- Four questions, and the deck is the answers in order. Click a card to jump; the strip at the bottom is on every slide.
- Who spent it, what may a team call, what stops a mistake, and how fast the counts arrive. The demo answers the last one by measuring.
-->

---
routeAlias: stage-who
---

# A profile per team carries the tags into billing

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-tag class="plan__icon" />
    <p>Create a profile with Team and CostCenter tags</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">2</span>
    <ph-copy class="plan__icon" />
    <p>It copies one model</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card plan__step" v-click="5">
    <span class="plan__num">3</span>
    <ph-code class="plan__icon" />
    <p>Callers pass its ARN as the model id</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="6" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="7">
    <span class="plan__num">4</span>
    <ph-receipt class="plan__icon" />
    <p>Its tags attach to the billing record</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="8">
  <ph-lightning class="plan__foot-icon" />
  <p>The profile is the unit of attribution.</p>
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
- Walk the four steps. The profile references one model, so you need one per team and model.
- Callers pass the profile ARN where the model id would go; the profile's tags attach to the billing record.
- The tags only reach the invoice once they are activated as cost allocation tags, and that takes up to a day. More on that later.
- AWS also offers IAM principal attribution and per-request metadata, and recommends Projects for the Responses and Chat Completions APIs. We use profiles because the tags land on the billing record and a profile is easy to scope in IAM.
-->

---
routeAlias: stage-what
---

# The role reaches its own profile and nothing else

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-users-three class="chain__icon" />
    <div class="gpu-caption">Team caller</div>
    <span>Assumes its team role</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-identification-badge class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Team role</div>
    <span>Invoke on its profile ARN only</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-cube class="chain__icon" />
    <div class="gpu-caption">Model</div>
    <span>Reached only through that profile</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>A team cannot borrow another team's profile.</p>
</aside>

<div class="facts" v-click="5">
  <div class="fact"><ph-lock-key /><p>Scoped to the profile ARN</p></div>
  <div class="fact"><ph-eye /><p>Each call is logged with the caller</p></div>
  <div class="fact"><ph-x-circle /><p>Cross-team call: AccessDenied</p></div>
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
- The component creates the role next to the profile.
- The role names the profile ARN and the routed model ARNs, with a condition so the model cannot be called directly.
- Step six of the demo shows the support team trying the search profile and getting AccessDenied.
-->

---
routeAlias: stage-stop
---

# Each mistake has an enforcer that runs at preview

<div class="zoom-content">

<div class="bounds">
  <div class="bound" v-click><ph-tag /><div class="bound__want">an untagged profile</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Policy: Team and CostCenter tags required</div></div>
  <div class="bound" v-click><ph-shield-warning /><div class="bound__want">a wildcard invoke grant</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Policy: no bedrock:InvokeModel on every resource</div></div>
  <div class="bound" v-click><ph-lock-key /><div class="bound__want">direct model calls</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">The role condition, not a review comment</div></div>
  <div class="bound" v-click><ph-eye /><div class="bound__want">a bad change reaching AWS</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Mandatory policies stop the preview</div></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.bounds { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem 1.4rem; }
.bound { display: grid; grid-template-columns: auto 9.5rem auto 1fr; align-items: center; gap: 0.7rem; padding: 0.8rem 1rem; border: 1.5px solid var(--p-border); border-radius: 14px; background: var(--p-bg-elevated); }
.bound > svg:first-child { font-size: 1.5rem; color: var(--p-primary); }
.bound__want { font-family: var(--slidev-font-mono); font-size: 0.92rem; font-weight: 600; color: var(--p-fg-muted); }
.bound__arrow { font-size: 1.1rem; color: var(--p-accent); }
.bound__by { font-size: 1.05rem; line-height: 1.3; color: var(--p-fg); }
</style>

<!--
- The policy pack has two mandatory rules: Team and CostCenter tags on every inference profile, and no IAM policy that allows model invocation on every resource.
- A mandatory violation fails the preview, so nothing reaches AWS. The pack has unit tests, and step seven runs it.
- Credentials, for the curious: every command in the demo runs through a Pulumi ESC environment that mints short-lived AWS credentials over OIDC. No static key anywhere.
-->

---
routeAlias: stage-howfast
---

# Where this breaks today

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">Limits of this setup</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Profiles do not work with Responses and Chat Completions</li>
      <li>One profile per team and model</li>
      <li>The alarm only changes state, nothing is notified</li>
      <li>A per-team AWS Budget needs activated cost allocation tags</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">What to do about it</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Use principal attribution or request metadata there</li>
      <li>Add profiles as teams add models</li>
      <li>Wire an alarm action before you rely on it</li>
      <li>Step 10 in the repo adds the budget once the tags have had a day</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
- Say these plainly. AWS says profiles are not supported by the Responses and Chat Completions APIs; use principal attribution or request metadata there.
- One profile per team and model, so add profiles as teams add models.
- The demo alarm has no alarm action: it changes state and nothing more.
- The invoice view is the slow clock: activate the Team tag as a cost allocation tag, wait up to a day, and only spend after activation is tagged. Step 10 adds a budget on top of that; it is pre-baked, not part of today's demo.
-->

---

# The solution: one stack, one component per team

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1">
    <ph-buildings class="chain__icon" />
    <div class="gpu-caption">Foundation</div>
    <span>Log group, invocation logging, dashboard</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2">
    <ph-cube class="chain__icon" />
    <div class="gpu-caption gpu-caption--accent">Component per team</div>
    <span>Profile, role, metrics, alarm</span>
  </div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3">
    <ph-chart-line class="chain__icon" />
    <div class="gpu-caption">CloudWatch</div>
    <span>Token counts per team</span>
  </div>
</div>

<aside class="info-card chain__rule" v-click="4">
  <p>Adding a team is adding an entry to the teams list.</p>
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
- One Pulumi stack, because invocation logging covers the whole account in a Region.
- The foundation is created once: log group, invocation logging, dashboard.
- Each team is an entry in the teams config value, and each entry becomes one MeteredModelAccess component.
-->

---

# A call becomes a per-team token metric

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1">
    <span class="plan__num">1</span>
    <ph-terminal-window class="plan__icon" />
    <p>Team calls its profile</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="3">
    <span class="plan__num">2</span>
    <ph-file-text class="plan__icon" />
    <p>Invocation record in the log group</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card plan__step" v-click="5">
    <span class="plan__num">3</span>
    <ph-funnel class="plan__icon" />
    <p>Metric filter counts tokens</p>
  </div>
  <ph-arrow-right class="plan__arrow" v-click="6" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="7">
    <span class="plan__num">4</span>
    <ph-chart-line class="plan__icon" />
    <p>Dashboard and alarm per team</p>
  </div>
</div>

<aside class="info-card plan__foot" v-click="8">
  <ph-lightning class="plan__foot-icon" />
  <p>Input and output tokens, one metric each, per team.</p>
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
- The invocation record carries the token counts and the caller's ARN.
- Two metric filters per team turn that into input and output token metrics, per minute.
- Metrics lag the calls by a minute or two. Say so before running them.
-->

---
routeAlias: stage-demo
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Per-team Bedrock metering.</h1>
  </div>
  <StageMap size="lg" />
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
- Switch to the terminal. Everything from here runs in the numbered demo folders.
-->

---

# What we are going to do

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card step" v-click><ph-key class="step__icon" /><p>Credentials from Pulumi ESC, a foundation stack</p></div>
  <div class="gpu-card step" v-click><ph-tag class="step__icon" /><p>A tagged profile and a scoped role per team</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-chart-line class="step__icon" /><p>Token counts per team in CloudWatch</p></div>
  <div class="gpu-card gpu-card--accent step" v-click><ph-gavel class="step__icon" /><p>A policy that fails the preview, then teardown</p></div>
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
- Four outcomes: credentials and foundation, then the teams, then the metrics, then the guardrails and teardown.
- Eleven steps in the repo; step ten, the budget, is pre-baked and skipped today.
-->

---

# Steps 1 and 2: credentials through ESC, then the foundation <DemoBadge kind="live" />

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="big-code code-sm">

```bash
01-credentials/check.sh
02-platform/up.sh
02-platform/test-call.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-vault /><span>Check prints the AWS identity from ESC</span></li>
    <li><ph-eye /><span>Up previews, then applies, with no teams</span></li>
    <li><ph-chart-bar /><span>Expect the logging configuration printed, no profiles yet</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<div class="cue"><ph-terminal-window class="cue-ico" /><span>ADAM: run check.sh, then start up.sh and keep talking</span></div>

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
- check.sh prints sts get-caller-identity with credentials from the ESC environment. If it fails, stop and fix the role trust.
- up.sh sets teams to an empty list, previews, applies, and prints the invocation logging configuration. Talk over the apply.
- test-call.sh makes one call with the admin credentials and shows the record it left in the log group; the first record takes about a minute.
-->

---

# Step 3: one team is one inference profile and one role <DemoBadge kind="live" />

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="big-code code-sm">

```bash
03-first-team/up.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-tag /><span>Profile search-nova with Team and CostCenter tags</span></li>
    <li><ph-identification-badge /><span>A role scoped to that profile</span></li>
    <li><ph-bell /><span>Two metric filters and one alarm</span></li>
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
- Team search, cost center cc-1001. One config entry, one component.
- The script lists application inference profiles in a table. Expect search-nova and its ARN.
-->

---

# Step 4: every call names a team and a token count <DemoBadge kind="live" />

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="big-code code-sm">

```bash
04-calls/send-calls.sh search 20
04-calls/show-log.sh
04-calls/check-metrics.sh search
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-terminal-window /><span>Twenty Converse calls through the profile</span></li>
    <li><ph-file-text /><span>The log shows who called</span></li>
    <li><ph-chart-line /><span>Metrics follow a few minutes later</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<div class="cue"><ph-chat-circle-dots class="cue-ico" /><span>ENGIN: take chat while the metrics lag</span></div>

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
- Twenty Converse calls through the search profile, prompts of varying length, usage printed per call.
- show-log.sh reads the newest invocation records: caller ARN, model, input and output tokens.
- check-metrics.sh sums the last hour. Metrics lag a minute or two, so say so first and fill the gap with chat questions.
-->

---

# Steps 5 and 6: support joins, and cannot use search's profile <DemoBadge kind="live" />

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="big-code code-sm">

```bash
05-second-team/up.sh
04-calls/send-calls.sh support 20
06-cross-team/try-cross-team.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-plus-circle /><span>Team support, cost center cc-2002</span></li>
    <li><ph-x-circle /><span>Expect AccessDenied from the cross-team call</span></li>
    <li><ph-shield-check /><span>The script fails if the call succeeds</span></li>
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
- One more config entry, same component. Team support, cost center cc-2002.
- Twenty calls as support, like step four, so both teams have metrics.
- Then support calls the search profile. Expect AccessDenied; the script treats a success as an error.
-->

---

# Steps 7 and 8: the pack passes clean code, fails two mistakes <DemoBadge kind="live" />

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="big-code code-sm">

```bash
07-policy/run-preview.sh
08-violations/break.sh
08-violations/fix.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-check-circle /><span>Clean preview first</span></li>
    <li><ph-warning /><span>Then an untagged profile and a wildcard invoke</span></li>
    <li><ph-shield-warning /><span>Expect two mandatory violations</span></li>
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
- The pack is bedrock-metering-guardrails. A clean preview first: the rules do not block correct code.
- break.sh turns on demoViolations: an untagged profile and a wildcard invoke grant. Expect two mandatory violations and a failed preview; nothing reaches AWS.
- fix.sh switches it off and previews clean again.
-->

---

# Step 9: one team pushes its output tokens over the alarm line <DemoBadge kind="live" />

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="big-code code-sm">

```bash
09-alarm/trip-alarm.sh search
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-chart-line-up /><span>Eight long answers from one team</span></li>
    <li><ph-bell /><span>Alarm threshold on output tokens per minute</span></li>
    <li><ph-clock /><span>State changes within a few minutes</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<div class="cue"><ph-terminal-window class="cue-ico" /><span>ADAM: fire trip-alarm now, re-check the state before teardown</span></div>

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
- The alarm sums a team's output tokens in one minute against a threshold, 3000 by default.
- Eight long answers from search, up to a thousand tokens each. The script then reads the alarm state.
- Expect it to change after a few minutes; re-run the describe if it still reads OK. The alarm has no action, so nothing else happens.
-->

---

# Step 11: teardown removes everything and proves it <DemoBadge kind="live" />

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="big-code code-sm">

```bash
11-teardown/teardown.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-trash /><span>Destroys the stack, removes the stack</span></li>
    <li><ph-list-checks /><span>Three checks that nothing is left</span></li>
    <li><ph-check-circle /><span>No profiles, no logging, no log group</span></li>
  </ul>
  </v-clicks>
</div>

</div>

<div class="cue"><ph-terminal-window class="cue-ico" /><span>ADAM: start teardown, talk over it</span></div>

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
- Run it even if the room is in a hurry. Profiles and logging cost or linger if left behind.
- Destroys the stack, removes the stack, then three checks: no application profiles, empty logging configuration, no /workshop/ log groups. Then the ESC environment goes.
-->

---
routeAlias: stage-wrap
---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-5 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/bedrock-per-team-token-metering" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → bedrock-per-team-token-metering</div>
  </div>
  <div class="res-card">
    <QRCode data="https://docs.aws.amazon.com/bedrock/latest/userguide/cost-mgmt-application-inference-profiles.html" dark="#000000" />
    <div class="res-card__title">Application inference profiles and cost allocation</div>
    <div class="res-card__body">docs.aws.amazon.com/bedrock</div>
  </div>
  <div class="res-card">
    <QRCode data="https://docs.aws.amazon.com/bedrock/latest/userguide/model-invocation-logging.html" dark="#000000" />
    <div class="res-card__title">Bedrock model invocation logging</div>
    <div class="res-card__body">Model invocation logging</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/esc/providers/login/aws-login/" dark="#000000" />
    <div class="res-card__title">Pulumi ESC aws-login (OIDC)</div>
    <div class="res-card__body">pulumi.com/docs/esc</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/" dark="#000000" />
    <div class="res-card__title">Write a Pulumi policy pack</div>
    <div class="res-card__body">Policy pack authoring</div>
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
- Point at the QR codes. The repo has every script we ran plus step ten, the budget.
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
      Clone the repo and run it in your own account
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
- Name the next step: clone the repo, run it in your own account, and bring questions to Slack.
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-16">
  <div class="thanks__kicker">Thank you</div>
  <h1 class="!text-[4.5rem] !leading-[1.02] !font-semibold !tracking-tight !mt-3 !mb-12 text-center">Questions?</h1>
  <div class="thanks">
    <div class="thanks__person">
      <img class="thanks__avatar" src="/img/adam-gordon-bell.png" alt="Adam Gordon Bell" />
      <div class="thanks__name">Adam Gordon Bell</div>
      <div class="thanks__org">Community Engineer, Pulumi</div>
      <div class="thanks__handles">
        <span><carbon-logo-x />@adamgordonbell</span>
        <span><carbon-logo-github />adamgordonbell</span>
      </div>
      <div class="thanks__qr"><QRCode data="https://www.linkedin.com/in/adamgordonbell/" dark="#000000" /></div>
      <div class="thanks__qr-label"><carbon-logo-linkedin />adamgordonbell</div>
    </div>
    <div class="thanks__person">
      <img class="thanks__avatar" src="/img/engin-diri.jpg" alt="Engin Diri" />
      <div class="thanks__name">Engin Diri</div>
      <div class="thanks__org">Senior Solutions Architect, Pulumi</div>
      <div class="thanks__handles">
        <span><carbon-logo-x />@_ediri</span>
        <span><carbon-logo-github />dirien</span>
      </div>
      <div class="thanks__qr"><QRCode data="https://www.linkedin.com/in/engin-diri/" dark="#000000" /></div>
      <div class="thanks__qr-label"><carbon-logo-linkedin />engin-diri</div>
    </div>
    <div class="thanks__person">
      <div class="thanks__avatar thanks__avatar--icon"><carbon-logo-github /></div>
      <div class="thanks__name">Workshop repo</div>
      <div class="thanks__org">slides · demo</div>
      <div class="thanks__handles">
        <span>pulumi/workshops</span>
      </div>
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/bedrock-per-team-token-metering" dark="#000000" /></div>
      <div class="thanks__qr-label">bedrock-per-team-token-metering</div>
    </div>
  </div>
</div>

<style scoped>
.thanks__kicker { font-family: var(--slidev-font-mono); font-size: 1.15rem; font-weight: 700; letter-spacing: 0.6em; text-transform: uppercase; color: var(--p-fg-muted); }
.thanks { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.5rem; justify-items: center; }
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
- Questions. Engin reads the queue from the Q&A tab; Adam answers from the terminal where it helps.
-->
