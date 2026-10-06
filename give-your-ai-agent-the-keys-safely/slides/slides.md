---
theme: "@pulumi/slidev-theme"
title: "Give your AI agent the keys, safely"
info: |
  Give your AI agent the keys, safely: Build and govern an MCP-based infrastructure agent that can propose changes but not apply them.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/give-your-ai-agent-the-keys-safely
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
    Give your AI agent the keys, safely
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Build and govern an MCP-based infrastructure agent that can propose changes but not apply them
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

<!--
[1 min] Welcome. Title and what we will do in 90 minutes.
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
[1 min] Speaker introduction (placeholder until confirmed).
-->

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

<!--
[0.5 min] Housekeeping and agenda divider.
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
[1 min] Housekeeping: questions any time, the repo link comes after merge.
-->

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>When agents get infrastructure access</li>
  <li>Questions to answer before trusting one</li>
  <li>MCP, scoped tokens and approvals</li>
  <li>The agent we will build</li>
  <li>Live demo: propose, review, block, apply</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

<!--
[1 min] Agenda: the incident, six questions, the stack we build, the demo.
-->

---
# An agent with write access to production deleted the database, then admitted it

<div class="grid grid-cols-2 gap-10 mt-6 quote-slide">
  <div class="gpu-card gpu-card--primary quote-card" v-click>
    <div class="gpu-caption gpu-caption--accent">The agent's own words, as The Register reported them</div>
    <p>"a catastrophic error of judgement"… "violated your explicit trust and instructions"</p>
  </div>
  <div>
    <v-clicks>
    <ul class="!mt-2 !text-[1.2rem] !leading-relaxed space-y-3">
      <li>SaaStr founder Jason Lemkin, vibe coding on Replit, July 2025</li>
      <li>Replit bills itself as "The safest place for vibe coding"</li>
      <li>The agent said rollback was impossible. The rollback worked.</li>
    </ul>
    </v-clicks>
  </div>
</div>

<div class="psst" v-click>
  <ph-detective class="psst__icon" />
  <span><strong>Lemkin, 20 July:</strong> "There is no way to enforce a code freeze in vibe coding apps like Replit."</span>
</div>

<style scoped>
.quote-card p { font-size: 1.35rem; line-height: 1.5; font-style: italic; margin-top: 1rem; }
.psst { display: flex; align-items: center; gap: 1.1rem; margin-top: 2.4rem; font-size: 1.63rem; color: var(--p-fg); }
.psst__icon { flex-shrink: 0; font-size: 2.5rem; color: var(--p-primary); }
.psst strong { color: var(--p-primary); }
</style>

<!--
[2.5 min] Start with a real incident, not a hypothetical. July 2025, Jason Lemkin of SaaStr is vibe coding on Replit. The agent deletes his production database. Then it admits it, in its own words: a catastrophic error of judgement, it violated his explicit trust and instructions. It also told him rollback was impossible. That was wrong, the rollback worked. Lemkin's conclusion on 20 July: there is no way to enforce a code freeze. Source is The Register, July 2025. Say plainly: we are not here to pile on one vendor. This is what an agent does when the only thing between its idea and your database is its own judgement.
-->
---
<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">A reviewed diff is a safety net.</h1>
</div>

<!--
[0.5 min] Two lines. First one. You can read a proposed change, reject it, revert it. Let it sit for a second.
-->
---
<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">An applied change is not.</h1>
</div>

<!--
[0.5 min] Second line. Once the tool call has run, there is no diff left to review. Only the damage and the cleanup.
-->
---
# A pull request waits for a human; an agent's tool call does not

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">A human-authored change</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Pull request opened</li>
      <li>A reviewer reads the diff</li>
      <li>Merge, then apply</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">An agent with an apply tool</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>The agent calls the tool</li>
      <li>The change is applied</li>
      <li>The review step was never in the path</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[2 min] Why is this hard? Because the pause in a pull request is not in the tool. It is in the workflow around it. Somebody has to click merge. An agent that holds an apply tool skips all of that: the call is the change. So the safety has to live in what the agent can call, and in who it acts as. That is the whole workshop in one sentence.
-->
---
# Six questions decide whether you can hand an agent the keys

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-plugs-connected class="step-icon" /><div class="gpu-caption gpu-caption--muted">1 · Call</div><p>What can it call?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--muted">2 · Acting as</div><p>Who is it acting as?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--muted">3 · Change</div><p>What may that identity change?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-hand-palm class="step-icon" /><div class="gpu-caption gpu-caption--muted">4 · Human</div><p>When must a human step in?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-magnifying-glass class="step-icon" /><div class="gpu-caption gpu-caption--muted">5 · Review</div><p>What must a reviewer check?</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-shield-warning class="step-icon" /><div class="gpu-caption gpu-caption--muted">6 · Pushing</div><p>Does the boundary hold when the agent pushes?</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
[3 min] These are the six questions we will answer, and they are the spine of the next hour. What can the agent call. Who is it acting as. What may that identity change. When must a human step in. What must a reviewer check on an agent's diff. And the last one, the one that matters: does the boundary still hold when the agent pushes against it? The first five are design. The sixth we prove in the demo.
-->
---
<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The first question is what the agent can call.</h1>
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
[0.5 min] Question one. Before identity, before approvals: what is on the menu.
-->
---
# An MCP server turns your stack into a list of tools the agent can call

<div class="zoom-content">

<div class="plan">
  <div class="gpu-card gpu-card--primary plan__step" v-click="1"><span class="plan__num">1</span><ph-robot class="plan__icon" /><p>The agent decides what to do</p></div>
  <ph-arrow-right class="plan__arrow" v-click="2" />
  <div class="gpu-card plan__step" v-click="2"><span class="plan__num">2</span><ph-plugs-connected class="plan__icon" /><p>The MCP client lists and calls tools</p></div>
  <ph-arrow-right class="plan__arrow" v-click="3" />
  <div class="gpu-card plan__step" v-click="3"><span class="plan__num">3</span><ph-cube class="plan__icon" /><p>The Pulumi MCP server runs them</p></div>
  <ph-arrow-right class="plan__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary plan__step" v-click="4"><span class="plan__num">4</span><ph-cloud-check class="plan__icon" /><p>Pulumi Cloud and your stack answer</p></div>
</div>

<aside class="info-card plan__foot" v-click="5">
  <ph-list-checks class="plan__foot-icon" />
  <p><strong>The tool list is the menu.</strong> The agent can only ask for what the server offers.</p>
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
[2 min] MCP is the protocol that lets an agent discover and call tools. The Pulumi MCP server is one such tool provider. Per the Pulumi docs it lets an assistant query stacks, search resources, read the Registry, see policy violations, manage members, and hand work to Pulumi Neo. The agent never touches your cloud directly. It sees a list of tools and picks. So the list is the first boundary. Source: the Pulumi MCP server page on pulumi.com/docs, read 6 October 2026.
-->
---
# The stock server hands over everything, including the tool that applies

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">The stock server, 0.2.0</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>12 tools</li>
      <li>Includes <code>pulumi-cli-up</code> and <code>deploy-to-aws</code></li>
      <li>No allow-list, no read-only flag</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">Behind our guard.mjs</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>8 tools</li>
      <li>Read and preview only</li>
      <li>Anything else is refused</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[2 min] Here is the catch. The npm package we run, @pulumi/mcp-server version 0.2.0, has no allow-list and no read-only mode. Twelve tools, including pulumi-cli-up and deploy-to-aws. So for the demo we put our own proxy in front, guard.mjs. It lets eight tools through and refuses the rest. Be clear with the room: guard.mjs is workshop code, not a Pulumi feature. The demo shows both lists side by side.
-->
---
<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The second question is who the agent is acting as.</h1>
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
[0.5 min] Question two. Even a perfect tool list runs as somebody.
-->
---
# The agent acts as whatever token you hand it

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1"><ph-robot class="chain__icon" /><div class="gpu-caption">Agent</div><span>No identity of its own</span></div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card chain__node" v-click="2"><ph-cube class="chain__icon" /><div class="gpu-caption">MCP server</div><span>Runs with a token</span></div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="3"><ph-key class="chain__icon" /><div class="gpu-caption gpu-caption--accent">Access token</div><span>The identity</span></div>
  <ph-arrow-right class="chain__arrow" v-click="4" />
  <div class="gpu-card chain__node" v-click="4"><ph-cloud-check class="chain__icon" /><div class="gpu-caption">Pulumi Cloud</div><span>Its permissions decide</span></div>
</div>

<aside class="info-card chain__rule" v-click="5">
  <p>The agent can do what the token can do. Nothing less is enforced for you.</p>
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
.chain { grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; }
</style>

<!--
[1.5 min] On the wire the agent has no identity of its own. The MCP server starts with an access token, and Pulumi Cloud sees that token. So the question 'who is the agent' becomes 'which token did you give the server'. Pick it on purpose. Do not let it inherit whatever was lying in your shell.
-->
---
# Personal, organization and team tokens carry different amounts of power

<div class="zoom-content">

<div class="modes">
  <div class="gpu-card gpu-card--muted mode" v-click>
    <div class="mode__head"><ph-user class="mode__icon" /><code class="mode__name">personal</code></div>
    <p>Acts as one person</p>
    <div class="mode__note">Carries that user's permissions</div>
  </div>
  <div class="gpu-card gpu-card--primary mode" v-click>
    <div class="mode__head"><ph-buildings class="mode__icon" /><code class="mode__name">organization</code></div>
    <p>Acts as the org</p>
    <div class="mode__note">An RBAC role limits it</div>
  </div>
  <div class="gpu-card  mode" v-click>
    <div class="mode__head"><ph-users-three class="mode__icon" /><code class="mode__name">team</code></div>
    <p>Acts as a team</p>
    <div class="mode__note">Limited to what the team may do</div>
  </div>
</div>

<div class="gates" v-click>
  <div class="gpu-caption gpu-caption--accent">For an agent</div>
  <span class="gate"><ph-buildings />organization token</span>
  <ph-caret-right class="gates__sep" />
  <span class="gate"><ph-lock-key />read-only role</span>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.modes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; align-items: stretch; }
.mode { display: flex; flex-direction: column; gap: 0.9rem; padding-inline: 1.4rem; }
.mode p { margin: 0 !important; white-space: nowrap; font-size: 1.25rem; }
.mode__head { display: flex; align-items: center; gap: 0.7rem; }
.mode__icon { font-size: 2rem; color: var(--p-primary); }
.mode__name { font-size: 1.25rem !important; font-weight: 600; }
.mode__track { display: flex; align-items: center; gap: 0.45rem; height: 1.8rem; color: var(--p-primary); font-size: 1.35rem; }
.mode__track i { width: 0.6rem; height: 0.6rem; border-radius: 999px; background: var(--p-accent); opacity: 0.55; }
.mode__track b { font-family: var(--slidev-font-mono); font-size: 0.85rem; color: var(--p-fg-muted); margin-left: 0.2rem; }
.mode__note { margin-top: auto; font-size: 0.95rem; color: var(--p-fg-muted); border-top: 1px dashed var(--p-border); padding-top: 0.7rem; }
.gates { display: flex; align-items: center; gap: 0.9rem; margin-top: 1.6rem; }
.gates .gpu-caption { margin-right: 0.4rem; }
.gate { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.95rem; border-radius: 999px; background: var(--p-bg-elevated); border: 1px solid var(--p-border); font-size: 1.1rem; color: var(--p-fg); }
.gate svg { color: var(--p-primary); font-size: 1.2rem; }
.gates__sep { color: var(--p-fg-subtle); font-size: 1.1rem; }
</style>

<!--
[2 min] Pulumi Cloud has three kinds of access token. A personal token acts as you, with all your permissions. An organization token acts as the organization and is limited by an RBAC role you choose, and the audit log shows the organization rather than a person. A team token acts as a team. For an agent that nobody supervises second by second, the organization token with a deliberately small role is the right default. Source: the access tokens page on pulumi.com/docs, read 6 October 2026. Mention that org tokens and the audit log detail depend on your Pulumi Cloud edition, so check yours.
-->
---
# Two questions covered, four to go

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-plugs-connected class="step-icon" /><div class="gpu-caption gpu-caption--accent">1 · Call</div><p>The tool list is the boundary</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">2 · Acting as</div><p>Pick the token on purpose</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-lock-key class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">3 · Change</div><p>What may that identity change?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-hand-palm class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">4 · Human</div><p>When must a human step in?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-magnifying-glass class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">5 · Review</div><p>What must a reviewer check?</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-shield-warning class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">6 · Pushing</div><p>Does the boundary hold when the agent pushes?</p></div>
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
[0.5 min] Quick recap. One: the tool list is the first boundary. Two: the agent is whoever the token says, so pick the token on purpose. Four to go.
-->
---
<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The third question is what that identity may change.</h1>
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
[0.5 min] Question three. Now we decide how much the token may do.
-->
---
# A read-only role makes Pulumi Cloud refuse the write even if the proxy fails

<div class="zoom-content">

<div class="bounds">
  <div class="bound" v-click><ph-plugs-connected /><div class="bound__want">apply tool call</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Refused by <code>guard.mjs</code> before it reaches the server</div></div>
  <div class="bound" v-click><ph-cloud-check /><div class="bound__want">a stack update</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Refused by Pulumi Cloud: the Stack Read permission set has no write</div></div>
  <div class="bound" v-click><ph-warning /><div class="bound__want">no permission sets</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Edition limit: then the guard is the only enforced layer</div></div>
  <div class="bound" v-click><ph-users /><div class="bound__want">an agent token</div><ph-arrow-right class="bound__arrow" /><div class="bound__by">Organization token, role built on Stack Read</div></div>
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
[2.5 min] Two layers, and the second does not trust the first. Layer one is guard.mjs, which refuses the apply tool call. Layer two is Pulumi Cloud: give the token a role built on the Stack Read permission set and an update is refused by the service even if the proxy had a bug. The caveat, stated up front: custom permission sets need a Pulumi Cloud edition that includes them. Without that, the guard is your only enforced layer. Sources: the permission sets page on pulumi.com/docs, read 6 October 2026.
-->
---
<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The fourth question is when a human must step in.</h1>
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
[0.5 min] Question four. Who clicks the button.
-->
---
# Neo ships the same idea as task modes and a read-only mode

<div class="zoom-content">

<div class="modes">
  <div class="gpu-card gpu-card--primary mode" v-click>
    <div class="mode__head"><ph-hand-palm class="mode__icon" /><code class="mode__name">Review</code></div>
    <p>Approval before preview, up and pull request</p>
    
  </div>
  <div class="gpu-card gpu-card--accent mode" v-click>
    <div class="mode__head"><ph-scales class="mode__icon" /><code class="mode__name">Balanced</code></div>
    <p>Approval before <code>up</code></p>
    
  </div>
  <div class="gpu-card  mode" v-click>
    <div class="mode__head"><ph-lightning class="mode__icon" /><code class="mode__name">Auto</code></div>
    <p>Never asks</p>
    
  </div>
</div>

<div class="gates" v-click>
  <div class="gpu-caption gpu-caption--accent">Read-only mode</div>
  <span class="gate"><ph-eye />no writes in Pulumi Cloud</span>
  <ph-caret-right class="gates__sep" />
  <span class="gate"><ph-vault />ESC still reachable</span>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.modes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; align-items: stretch; }
.mode { display: flex; flex-direction: column; gap: 0.9rem; padding-inline: 1.4rem; }
.mode p { margin: 0 !important; white-space: nowrap; font-size: 1.25rem; }
.mode__head { display: flex; align-items: center; gap: 0.7rem; }
.mode__icon { font-size: 2rem; color: var(--p-primary); }
.mode__name { font-size: 1.25rem !important; font-weight: 600; }
.mode__track { display: flex; align-items: center; gap: 0.45rem; height: 1.8rem; color: var(--p-primary); font-size: 1.35rem; }
.mode__track i { width: 0.6rem; height: 0.6rem; border-radius: 999px; background: var(--p-accent); opacity: 0.55; }
.mode__track b { font-family: var(--slidev-font-mono); font-size: 0.85rem; color: var(--p-fg-muted); margin-left: 0.2rem; }
.mode__note { margin-top: auto; font-size: 0.95rem; color: var(--p-fg-muted); border-top: 1px dashed var(--p-border); padding-top: 0.7rem; }
.gates { display: flex; align-items: center; gap: 0.9rem; margin-top: 1.6rem; }
.gates .gpu-caption { margin-right: 0.4rem; }
.gate { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.95rem; border-radius: 999px; background: var(--p-bg-elevated); border: 1px solid var(--p-border); font-size: 1.1rem; color: var(--p-fg); }
.gate svg { color: var(--p-primary); font-size: 1.2rem; }
.gates__sep { color: var(--p-fg-subtle); font-size: 1.1rem; }
</style>

<!--
[2 min] Pulumi Neo is the product version of this idea. A task runs in one of three approval modes. Review asks before it previews, updates, or opens a pull request. Balanced asks before an update. Auto never asks. There is also a read-only mode that removes write access in Pulumi Cloud, though it does not cut off ESC. And Neo never has more access than the user who started it. We are not demoing Neo today. We use it to show that the pause point is a design choice the product makes explicit. Sources: the Neo tasks, get-started and permissions pages on pulumi.com/docs, read 6 October 2026.
-->
---
<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Propose is cheap. Apply needs a person.</h1>
</div>

<!--
[0.5 min] This is the one rule the demo enforces. The agent may read, may propose, may show a diff. A human applies.
-->
---
<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">The fifth question is what a reviewer must check.</h1>
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
[0.5 min] Question five. The diff is on the table. Who reads it, and for what.
-->
---
# An agent's diff needs two checks a human's does not

<div class="zoom-content">

<div class="grid grid-cols-2 gap-10 mt-6">
  <div class="gpu-card gpu-card--muted" v-click>
    <div class="gpu-caption gpu-caption--muted">A human's diff</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Does it do what I meant?</li>
      <li>Does it build and preview cleanly?</li>
    </ul>
  </div>
  <div class="gpu-card gpu-card--primary" v-click>
    <div class="gpu-caption gpu-caption--accent">An agent's diff adds two checks</div>
    <ul class="!mt-4 !text-[1.2rem] !leading-relaxed space-y-2">
      <li>Did it keep the file's own conventions?</li>
      <li>Did it ask for more than the task needed?</li>
    </ul>
  </div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!--
[2.5 min] A human colleague knows your tagging rule and would not add a surprise resource. An agent knows neither unless the diff shows it. So there are two extra checks. One: did it follow the conventions already in the file, tags, naming, outputs. Two: did it ask for more than the task needed, a wider policy, an extra resource. Hold on to check one. In the demo the agent's diff really does miss something.
-->
---
# Where this breaks today: the guard is ours, the audit trail is thin, and state can race

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-shield-warning class="step-icon" /><div class="gpu-caption gpu-caption--muted">The guard is ours</div><p>Stock 0.2.0 has no allow-list, so we built <code>guard.mjs</code></p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-scroll class="step-icon" /><div class="gpu-caption gpu-caption--muted">Thin audit trail</div><p>The activity log does not tell agent-proposed from human-typed</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--muted">State locking</div><p>Stops corruption, not two people disagreeing</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-warning class="step-icon" /><div class="gpu-caption gpu-caption--muted">Not run live</div><p><code>pulumi up</code> and <code>destroy</code> never ran against AWS in the build</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-key class="step-icon" /><div class="gpu-caption gpu-caption--muted">Token layer unverified</div><p>The read-only token refusal is documented, not executed</p></div>
  <div class="gpu-card gpu-card--muted step-card" v-click><ph-arrows-clockwise class="step-icon" /><div class="gpu-caption gpu-caption--muted">Docs moved on</div><p>Docs point to the hosted server; the demo pins local 0.2.0</p></div>
</div>

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
.step-card { display: flex; flex-direction: column; gap: 0.5rem; }
.step-card p { margin: 0 !important; font-size: 1.15rem; line-height: 1.4; }
.step-icon { font-size: 1.8rem; color: var(--p-primary); opacity: 0.85; }
</style>

<!--
[3 min] Now the honest slide. One: the stock MCP server version we pin has no allow-list, so the guard is workshop code. Two: the Pulumi Cloud activity log records who ran an update and when, but does not on its own tell you whether a person typed it or an agent proposed it. Three: state locking prevents two applies from corrupting state, it does not stop a human and an agent from disagreeing. Four, about this build specifically: the apply and destroy steps and the token layer were not run against live AWS or Pulumi Cloud when we built the demo, so rehearse them before you present. Five: the docs now point at the hosted server, we pin the local package so a guard can sit in front. Say all of that out loud.
-->
---
# Five questions answered, one to go: does the boundary hold?

<div class="zoom-content">

<div class="grid grid-cols-3 gap-6 mt-4">
  <div class="gpu-card gpu-card--primary step-card"><ph-plugs-connected class="step-icon" /><div class="gpu-caption gpu-caption--accent">1 · Call</div><p>Tool list, filtered by the guard</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-user-circle class="step-icon" /><div class="gpu-caption gpu-caption--accent">2 · Acting as</div><p>Organization token</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-lock-key class="step-icon" /><div class="gpu-caption gpu-caption--accent">3 · Change</div><p>Read-only role</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-hand-palm class="step-icon" /><div class="gpu-caption gpu-caption--accent">4 · Human</div><p>Approval before apply</p></div>
  <div class="gpu-card gpu-card--primary step-card"><ph-magnifying-glass class="step-icon" /><div class="gpu-caption gpu-caption--accent">5 · Review</div><p>Two extra review checks</p></div>
  <div class="gpu-card gpu-card--muted step-card"><ph-shield-warning class="step-icon step-icon--muted" /><div class="gpu-caption gpu-caption--muted">6 · Pushing</div><p>Does the boundary hold when the agent pushes?</p></div>
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
[1 min] Five answers. Tool list filtered by the guard. An organization token. A read-only role. Approval before apply. Two extra review checks. The sixth question, does the boundary hold when the agent pushes against it, is what the demo is for.
-->
---
# The agent we build proposes through a guard and a read-only token

<div class="zoom-content">

<div class="chain">
  <div class="gpu-card chain__node" v-click="1"><ph-robot class="chain__icon" /><div class="gpu-caption">Agent</div><span>Claude Desktop or probe.mjs</span></div>
  <ph-arrow-right class="chain__arrow" v-click="2" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="2"><ph-shield-check class="chain__icon" /><div class="gpu-caption gpu-caption--accent">guard.mjs</div><span>Allow-list</span></div>
  <ph-arrow-right class="chain__arrow" v-click="3" />
  <div class="gpu-card chain__node" v-click="3"><ph-cube class="chain__icon" /><div class="gpu-caption">MCP server</div><span>@pulumi/mcp-server</span></div>
  <ph-arrow-right class="chain__arrow" v-click="4" />
  <div class="gpu-card gpu-card--primary chain__node" v-click="4"><ph-cloud-check class="chain__icon" /><div class="gpu-caption gpu-caption--accent">Pulumi Cloud</div><span>Read-only org token</span></div>
  <ph-arrow-right class="chain__arrow" v-click="5" />
  <div class="gpu-card chain__node" v-click="5"><ph-database class="chain__icon" /><div class="gpu-caption">AWS stack</div><span>VPC, subnet, bucket</span></div>
</div>

<aside class="info-card chain__rule" v-click="6">
  <p>Two enforcers: the proxy refuses the call, Pulumi Cloud refuses the write.</p>
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
.zoom-content { zoom: 1.2; }
.chain { grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr auto 1fr; }
.chain__node span { font-size: 0.9rem; }
</style>

<!--
[2 min] This is the architecture we end up with. The agent, either Claude Desktop or the probe script, talks to guard.mjs. The guard forwards allowed calls to the Pulumi MCP server. The server talks to Pulumi Cloud with a read-only organization token. Behind that is the AWS stack. Two enforcers, as we said: the proxy and Pulumi Cloud.
-->
---
# The stack the agent will change is a VPC, a subnet and one bucket

<div class="zoom-content">

<div class="compose">
  <div class="compose__stack">
    <div class="gpu-caption">The stack the agent will change</div>
    <div class="piece piece--mixin" v-click="3"><ph-database />S3 bucket · artifacts</div>
    <div class="piece piece--sandbox" v-click="2"><ph-git-branch />Subnet · one</div>
    <div class="piece piece--template" v-click="1"><ph-cloud />VPC</div>
  </div>
  <ul class="rules" v-click="4">
    <li><ph-code /><span>Pulumi IaC, TypeScript</span></li>
    <li><ph-globe /><span>AWS, <code>us-east-1</code></span></li>
    <li><ph-plus-circle /><span>The agent will be asked to add one log bucket</span></li>
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
[1.5 min] Deliberately small. A VPC, one subnet, and one S3 bucket for artifacts, written in TypeScript with Pulumi IaC in us-east-1. The agent will be asked to add a log bucket for it. Small stack, so the interesting part is the boundary and not the infrastructure.
-->
---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Agent with scoped keys.</h1>
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
[0.5 min] Demo divider.
-->

---
# Eight steps take us from a stack to a human-approved change

<div class="zoom-content">

<div class="steps">
  <div class="gpu-card  step" v-click><ph-stack class="step__icon" /><p>1 · The stack exists before any agent touches it</p></div>
  <div class="gpu-card  step" v-click><ph-list-bullets class="step__icon" /><p>2 · The raw server lists twelve tools</p></div>
  <div class="gpu-card  step" v-click><ph-shield-check class="step__icon" /><p>3 · Through the guard, eight tools</p></div>
  <div class="gpu-card gpu-card--primary step" v-click><ph-note-pencil class="step__icon" /><p>4 · The agent proposes a log bucket as a diff</p></div>
  <div class="gpu-card  step" v-click><ph-magnifying-glass class="step__icon" /><p>5 · We review it and find a flaw</p></div>
  <div class="gpu-card gpu-card--accent step" v-click><ph-prohibit class="step__icon" /><p>6 · The apply attempt is refused</p></div>
  <div class="gpu-card  step" v-click><ph-user-check class="step__icon" /><p>7 · A human fixes it and applies</p></div>
  <div class="gpu-card  step" v-click><ph-trash class="step__icon" /><p>8 · Teardown, checked in the console</p></div>
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
[2 min] Eight steps, one folder each, numbered the same way in the repo. The stack. The raw server with twelve tools. The guarded server with eight. The agent proposes a log bucket. We review the diff. The apply is refused. A human fixes and applies. Teardown. Each step slide names the folder and what you should see.
-->
---
# 01 · The stack exists before any agent touches it

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-folder-open />01-base-stack</div>
    <div class="big-code code-sm">

```bash
pulumi up --stack dev
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-cloud /><span>A VPC and one subnet</span></li>
    <li><ph-database /><span>One artifacts bucket</span></li>
    <li><ph-warning /><span>Not run against AWS in the build; rehearse</span></li>
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
[5 min] Step one, folder 01-base-stack. Run pulumi up in that folder on the dev stack. You should see a VPC, a subnet and the artifacts bucket. Be honest: this step was not run against AWS when we built the demo, so rehearse it before you present.
-->
---
# 02 · The raw server lists twelve tools, including the one that applies

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
node 02-mcp-server/probe.mjs -- npx -y @pulumi/mcp-server@0.2.0 stdio
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-list-bullets /><div><div class="gpu-caption gpu-caption--accent">1 · Count</div><code>12 tools</code></div></div>
  <div class="gpu-card check" v-click><ph-rocket-launch /><div><div class="gpu-caption gpu-caption--accent">2 · Apply</div><code>pulumi-cli-up</code></div></div>
  <div class="gpu-card check" v-click><ph-cloud-arrow-up /><div><div class="gpu-caption gpu-caption--accent">3 · Deploy</div><code>deploy-to-aws</code></div></div>
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
[5 min] Step two, folder 02-mcp-server. The probe script speaks MCP over stdio and asks the stock server for its tool list. Twelve tools. Find pulumi-cli-up and deploy-to-aws in that list. That is what an agent would get by default.
-->
---
# 03 · Through the guard the agent sees eight tools, and apply is not one

<div class="zoom-content">

<div class="checks__cmd big-code code-sm">

```bash
node 02-mcp-server/probe.mjs -- node 03-scoped-access/guard.mjs
```

</div>

<div class="checks">
  <div class="gpu-card check" v-click><ph-list-bullets /><div><div class="gpu-caption gpu-caption--accent">1 · Count</div><code>8 tools</code></div></div>
  <div class="gpu-card check" v-click><ph-prohibit /><div><div class="gpu-caption gpu-caption--accent">2 · Apply</div><code>pulumi-cli-up</code> absent</div></div>
  <div class="gpu-card check" v-click><ph-eye /><div><div class="gpu-caption gpu-caption--accent">3 · What stays</div>read and preview</div></div>
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
[5 min] Step three, folder 03-scoped-access. Same probe, but pointed at guard.mjs, which starts the same server behind its allow-list. Eight tools. The apply tool is not in the list. Read and preview tools remain.
-->
---
# 04 · Asked for a log bucket, the agent returns a diff, not a change

<div class="zoom-content">

<div class="s5">
  <div class="s5__flow">
    <div class="s5__step" v-click="1"><ph-note-pencil /><span>Prompt: add a log bucket, change nothing else</span></div>
    <ph-arrow-down class="s5__arrow" v-click="2" />
    <div class="s5__step" v-click="2"><ph-eye /><span>The agent reads the stack through the guard</span></div>
    <ph-arrow-down class="s5__arrow" v-click="3" />
    <div class="s5__step s5__step--stop" v-click="3"><ph-git-pull-request /><span>It returns <code>proposed.diff</code>, nothing is applied</span></div>
  </div>
  <div class="s5__side">
    <aside class="info-card" v-click="4"><div class="info-card__label">Folder 04-propose-change</div><p>PROMPT.md holds the prompt, verbatim.</p></aside>
    <aside class="info-card" v-click="5"><div class="info-card__label">Be clear with the room</div><p>AGENT-SESSION.md is illustrative, not a captured transcript.</p></aside>
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
[6 min] Step four, folder 04-propose-change. The prompt is in PROMPT.md and we give it to the agent word for word: add a second S3 bucket for access logs, export its name, change nothing else. What comes back is a diff file, not a change to the live stack. One honesty point: AGENT-SESSION.md in the folder is an illustrative walk-through, not a recording of a real session. Do not present it as one.
-->
---
# 05 · The review finds the new bucket is missing the stack's tags

<div class="zoom-content">

<div class="checks">
  <div class="gpu-card check" v-click><ph-tag /><div><div class="gpu-caption gpu-caption--accent">1 · Conventions</div>Fails: no tags on the new bucket</div></div>
  <div class="gpu-card check" v-click><ph-arrows-out /><div><div class="gpu-caption gpu-caption--accent">2 · Scope</div>Passes, but verify it</div></div>
  <div class="gpu-card check" v-click><ph-file-text /><div><div class="gpu-caption gpu-caption--accent">3 · Where</div>Folder <code>05-review-the-diff</code></div></div>
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
[6 min] Step five, folder 05-review-the-diff. We run the two agent-specific checks from the REVIEW.md checklist. Check one, did it keep the file's own conventions: it fails, the new bucket has no tags. Check two, did it ask for more than the task needed: it passes, but you still verify. This is a real flaw in this build's diff, which is the point.
-->
---
# 06 · The apply attempt is refused at the proxy

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-prohibit />06-blocked-apply</div>
    <div class="big-code code-sm">

```bash
06-blocked-apply/try-apply.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-shield-check /><span>A well-formed JSON-RPC error, not a crash</span></li>
    <li><ph-chat-text /><span>Message: blocked by workshop guard</span></li>
    <li><ph-warning /><span>Token-layer refusal documented, not run</span></li>
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
[4 min] Step six, folder 06-blocked-apply. The script asks for pulumi-cli-up through the guard. The answer is a proper JSON-RPC error that says the call was blocked by the workshop guard. That answers question six. The second attempt in the script, with a real read-only Pulumi Cloud token, is documented but we did not execute it in the build, so say so and rehearse it.
-->
---
# 07 · A human fixes the tags and applies the corrected change

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-user-check />07-approve-and-apply</div>
    <div class="big-code code-sm">

```bash
07-approve-and-apply/approve-and-apply.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-tag /><span>Adds the missing tags</span></li>
    <li><ph-eye /><span>Runs pulumi preview first</span></li>
    <li><ph-rocket-launch /><span>Then pulumi up, by a person</span></li>
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
[5 min] Step seven, folder 07-approve-and-apply. A human fixes what the review found, the tags, runs a preview, and only then runs the update. The approval is a person running the command. Not run live in the build, so rehearse.
-->
---
# 08 · Teardown ends with a look at the console, not just an exit code

<div class="zoom-content">

<div class="s1">
  <div class="s1__steps">
    <div class="s1__label"><ph-trash />08-teardown</div>
    <div class="big-code code-sm">

```bash
08-teardown/destroy.sh
```

</div>
  </div>
  <v-clicks>
  <ul class="s1__facts">
    <li><ph-trash /><span>Destroys the stack's resources</span></li>
    <li><ph-x-circle /><span>Then removes the stack</span></li>
    <li><ph-browser /><span>Check the Pulumi Cloud console</span></li>
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
[3 min] Step eight, folder 08-teardown. The script destroys the resources and then removes the stack. Do not stop at the exit code: open the Pulumi Cloud console and see it is empty. Not run live in the build, so rehearse.
-->
---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-5 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/give-your-ai-agent-the-keys-safely" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → give-your-ai-agent-the-keys-safely</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/ai/mcp-server/" dark="#000000" />
    <div class="res-card__title">Pulumi MCP server docs</div>
    <div class="res-card__body">pulumi.com/docs/ai/mcp-server</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/ai/neo/permissions/" dark="#000000" />
    <div class="res-card__title">Neo's permissions model</div>
    <div class="res-card__body">pulumi.com/docs/ai/neo/permissions</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/administration/concepts/access-tokens/" dark="#000000" />
    <div class="res-card__title">Pulumi Cloud access tokens</div>
    <div class="res-card__body">pulumi.com/docs/administration</div>
  </div>
  <div class="res-card">
    <QRCode data="https://modelcontextprotocol.io/specification/" dark="#000000" />
    <div class="res-card__title">Model Context Protocol specification</div>
    <div class="res-card__body">modelcontextprotocol.io</div>
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
[1 min] Resources: scan the QR codes.
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
[1 min] Continue your Pulumi journey.
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/give-your-ai-agent-the-keys-safely" dark="#000000" /></div>
      <div class="thanks__qr-label">give-your-ai-agent-the-keys-safely</div>
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
[8.0 min] Thank you. Questions: take them live.
-->
