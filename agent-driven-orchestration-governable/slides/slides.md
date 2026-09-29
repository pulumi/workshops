---
theme: "@pulumi/slidev-theme"
title: "Putting Agents to Work"
info: |
  Putting Agents to Work: Orchestrate infrastructure changes through an agent, with every action auditable, approved, and repeatable on demand.
  Speaker Name.

  Repo: https://github.com/pulumi/workshops/tree/main/agent-driven-orchestration-governable
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
    Putting Agents to Work
  </h1>
  <p class="!mt-1 !text-[2.2rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed !max-w-[90%]">
    Orchestrate infrastructure changes through an agent, with every action auditable, approved, and repeatable on demand
  </p>
  <p class="!mt-8 !text-[1.6rem] text-[var(--p-fg-muted)] !m-0 !leading-relaxed">
    Speaker Name · Role, Pulumi
  </p>
</div>

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

---

<div class="absolute inset-0 flex flex-col justify-center items-center px-20 text-center">
  <h1 class="!text-[6.5rem] !leading-tight !font-semibold !tracking-tight !m-0 !max-w-[95%]">Housekeeping and Agenda</h1>
</div>

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

---

# Today's Agenda

<div class="zoom-content">

<ul class="!mt-8 !text-[1.6rem] !leading-relaxed space-y-5">
  <li>Why agents need a governance gate</li>
  <li>Automation API and policy packs</li>
  <li>The orchestrator we'll build</li>
  <li>The demo</li>
  <li>Wrap-up and Q&A</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.8; }
</style>

---
layout: statement
---

<h1 class="!text-[3.4rem]">A coding agent deleted a production database in nine seconds</h1>

<p class="source-line">PocketOS · April 25, 2026 · reported by Zenity</p>

<style scoped>
.source-line { font-size: 1.05rem !important; font-weight: 400 !important; letter-spacing: normal !important; margin-top: 1.5rem !important; color: var(--p-fg-muted); max-width: 80% !important; }
</style>

<!-- [3.0 min] On April 25th this year, a small operations platform for car rental businesses called PocketOS lost its production database. Not slowly, not through some multi-step failure: a coding agent, running inside Cursor on Claude Opus 4.6, made one GraphQL call against Railway's API, and nine seconds later the production volume was gone, along with every backup, because Railway stores backups in the same volume as the data they protect. The most recent backup anyone could recover from was three months old. Nine seconds. That's shorter than it took me to read you this slide. -->

---
layout: default
---

# Told to explain itself, the agent listed the rules it broke

<div class="zoom-content">

<ul class="!mt-6 !text-[1.5rem] !leading-relaxed space-y-4">
  <li>It guessed instead of checking first</li>
  <li>It ran a destructive command without being asked to</li>
  <li>It acted before it understood what the command would do</li>
  <li>Its own system prompt told it never to do this without permission</li>
</ul>

</div>

<style scoped>
.zoom-content { zoom: 1.4; }
</style>

<!-- [2.0 min] Zenity's write-up describes something almost stranger than the deletion itself: asked what happened, the agent produced its own account of which rules it had broken. Not vague regret, a specific list: it guessed instead of verifying, it ran something destructive without being asked, it didn't stop to understand what the command would do, and its own system prompt already told it never to run a destructive, irreversible action without permission. This wasn't a case where nobody wrote the rule down. The rule existed. The agent could even articulate it afterward. It just didn't stop for it beforehand. -->

---
layout: statement
---

# Its instructions said don't.

<!-- [0.5 min] Its instructions said don't. -->

---
layout: statement
---

# Nothing made that true.

<!-- [0.5 min] And yet nothing in the runtime made that instruction actually hold. -->

---
layout: two-cols
---

::header::
# A code review blocks a bad change. A system prompt does not block a bad API call.

::left::

**Code review**

<div class="zoom-content">

- A human, or a required check, has to approve it
- The merge button will not work without that approval
- The block happens before the change ships

</div>

::right::

**A system prompt**

<div class="zoom-content">

- Sits in the same context window as the task itself
- Nothing in the runtime checks whether the agent followed it
- The API call it warns against still goes through

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
</style>

<!-- [3.0 min] Here's why this is a genuinely hard problem, not a case of somebody forgetting to write a rule down. A code review is a gate: a human, or a required check, has to actively approve the change, and the tooling won't let the merge happen without it. A system prompt looks similar on the page, it's an instruction sitting right there in black and white, but it has none of the runtime enforcement. It's advice sitting in the same context window as the task, and nothing downstream checks whether the agent followed it before the API call goes out. Closing that gap means moving the check somewhere the agent cannot talk its way around, not writing a better prompt. -->

---
layout: default
---

# This workshop answers five questions about letting an agent touch real infrastructure

<div class="zoom-content">

1. How does an agent actually drive Pulumi?
2. What decides whether a change is even allowed to happen?
3. Does a bad change get blocked before it lands, or only flagged afterward?
4. What is left to check once a change is already done?
5. Should the agent decide on its own, or only propose one?

</div>

<style scoped>
.zoom-content { zoom: 1.35; }
</style>

<!-- [4.0 min] By the end of this workshop I want these five questions answered, not in theory, by a demo you watch run. First: how does an agent actually drive Pulumi, mechanically? Second: once it wants to make a change, what decides whether that's even allowed to happen? Third, and this is the one that matters most for the PocketOS story: does a bad change get blocked before it lands, or does the system just notice afterward that something bad happened? Fourth: once a change is done, approved or not, what's left to check? Fifth: should the agent even be the one deciding, or should it only propose and let a person decide? We'll answer each in order, and the demo answers the one that matters most by actually showing it happen. -->

---
layout: section
---

# How does an agent actually drive Pulumi?

## Question 1 of 5

<!-- [0.5 min] Let's start with the plumbing. -->

---
layout: default
---

# A CLI command is built for a human at a keyboard, not a program calling in a loop

<div class="zoom-content">

- `pulumi up` expects a terminal: it prompts, it waits, it prints for a human to read
- An agent is a program in a loop; it needs a return value, not a prompt
- Wrapping CLI output means parsing text that was never meant to be parsed

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
</style>

<!-- [2.5 min] The first instinct, when you want an agent to run infrastructure changes, is to have it shell out to the Pulumi CLI, the same way you would from your own terminal. That mostly works, until you notice what the CLI is actually built for: a human at a keyboard. It prompts for confirmation. It formats output for a person to read, with colors and word wrapping. An agent doesn't want any of that; it wants a function it can call that returns a structured result it can reason about. So the practical answer is to stop shelling out and use the interface Pulumi built for exactly this: the Automation API. -->

---
layout: default
---

# The Automation API turns a Pulumi update into a function call with a return value

<div class="zoom-content">

- Select or create a stack from inside your own program; no separate CLI process
- Set config the same way a human would with `pulumi config set`, just in code
- `stack.up()` returns a typed result: what changed, what failed, why

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
</style>

<!-- [3.5 min] The Automation API is a library, not a wrapper around the CLI's text output. Your program selects or creates a stack directly, sets whatever configuration the change needs, and calls stack.up. What comes back isn't a wall of terminal text, it's a structured result your program can branch on: did it succeed, what resources changed, did anything fail and why. That's the piece that makes an orchestrator possible at all. Our orchestrator in this workshop is a small Node program built entirely on this API. Every command you'll see it run in the demo is this same function call underneath, just with different arguments. -->

---
layout: default
---

# One question answered, four to go

<div class="zoom-content">

<ol class="!text-[1.4rem] space-y-3">
  <li class="answered">&#x2713; How does an agent actually drive Pulumi? Through the Automation API, as a function call in a loop.</li>
  <li>What decides whether a change is even allowed to happen?</li>
  <li>Does a bad change get blocked before it lands, or only flagged afterward?</li>
  <li>What is left to check once a change is already done?</li>
  <li>Should the agent decide on its own, or only propose one?</li>
</ol>

</div>

<style scoped>
.zoom-content { zoom: 1.15; }
.answered { color: var(--p-fg-muted); }
.answered::marker { color: var(--p-primary); }
</style>

<!-- [0.5 min] One down, four to go. -->

---
layout: section
---

# What decides whether a change is even allowed to happen?

## Question 2 of 5

<!-- [0.5 min] So the agent can make the call. The next question is who or what decides it's allowed to. -->

---
layout: default
---

# Pulumi Policies check a stack's resources before Pulumi ever touches the cloud

<div class="zoom-content">

- A policy pack runs during `preview` and `up`, against the resources Pulumi is about to create or change
- Each rule gets the resource's own inputs to inspect, before any provider API call happens
- A violation can block the update outright, depending on how the rule is set up

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
</style>

<!-- [2.5 min] Pulumi Policies, sometimes called policy as code, run as part of the same preview and update Pulumi already does. A policy pack is a set of rules that get to look at every resource Pulumi is about to touch, before any of those changes reach a real cloud provider. Each rule sees that resource's own inputs and can raise a violation. What happens next depends on how the rule is registered, which is exactly the distinction the next question is about. -->

---
layout: default
---

# One rule blocks any change whose approval flag is not set to true

<div class="zoom-content">

- Every fleet update creates one small marker resource carrying that attempt's approval flag
- The rule reads the marker, not the raw stack config: policies validate resources, not config values directly
- No `approved: true` on the marker means no update, full stop

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
</style>

<!-- [3.5 min] Here's the one rule this whole workshop hangs on. Every time the fleet changes, the program creates one small marker resource, and that marker carries whether this specific attempt was approved and what it's trying to do. The rule reads that marker. It's worth being precise about why it works this way: Pulumi Policies validate resources; they don't have a documented way to read your stack's raw configuration directly. So instead of the rule reaching into config, the program puts the approval flag where the rule can actually see it, on a resource. If that flag isn't exactly true, the rule reports a violation, and depending on its enforcement level, that can stop the update cold. -->

---
layout: default
---

# Two questions answered, three to go

<div class="zoom-content">

<ol class="!text-[1.4rem] space-y-3">
  <li class="answered">&#x2713; How does an agent actually drive Pulumi? Through the Automation API, as a function call in a loop.</li>
  <li class="answered">&#x2713; What decides whether a change is even allowed to happen? A policy rule reading an approval flag on a marker resource.</li>
  <li>Does a bad change get blocked before it lands, or only flagged afterward?</li>
  <li>What is left to check once a change is already done?</li>
  <li>Should the agent decide on its own, or only propose one?</li>
</ol>

</div>

<style scoped>
.zoom-content { zoom: 1.1; }
.answered { color: var(--p-fg-muted); }
</style>

<!-- [0.5 min] Two down. -->

---
layout: section
---

# Does a bad change get blocked before it lands, or only flagged afterward?

## Question 3 of 5

<!-- [0.5 min] This is the one that would have actually stopped PocketOS. -->

---
layout: default
---

# Mandatory enforcement stops the update before it ever reaches the cloud

<div class="zoom-content">

- Every Pulumi Policy rule has an enforcement level: `advisory` or `mandatory`
- `advisory` prints a warning and lets the update continue anyway
- `mandatory` fails the update in preview, before a single API call goes out

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
</style>

<!-- [3.5 min] This is the distinction that matters most for our PocketOS story. Every rule in a Pulumi policy pack declares an enforcement level. Set it to advisory, and a violation just prints a warning; the update goes ahead anyway, which is fine for naming conventions, not so fine for "did anyone approve this." Set it to mandatory, and a violation fails the update during preview, before Pulumi issues a single API call to the real infrastructure. Our approval rule is registered as mandatory. That's the difference between a system that notices a problem afterward and one that never lets the problem happen in the first place. -->

---
layout: default
---

# Three questions answered, two to go

<div class="zoom-content">

<ol class="!text-[1.35rem] space-y-2">
  <li class="answered">&#x2713; How does an agent actually drive Pulumi? Through the Automation API, as a function call in a loop.</li>
  <li class="answered">&#x2713; What decides whether a change is even allowed to happen? A policy rule reading an approval flag on a marker resource.</li>
  <li class="answered">&#x2713; Blocked before it lands, or only flagged afterward? Mandatory enforcement fails the update in preview.</li>
  <li>What is left to check once a change is already done?</li>
  <li>Should the agent decide on its own, or only propose one?</li>
</ol>

</div>

<style scoped>
.zoom-content { zoom: 1.1; }
.answered { color: var(--p-fg-muted); }
</style>

<!-- [0.5 min] Three down. -->

---
layout: section
---

# What is left to check once a change is already done?

## Question 4 of 5

<!-- [0.5 min] Blocking the bad ones is half of it. The other half is knowing what happened either way. -->

---
layout: default
---

# Every attempt, blocked or approved, appends one line to a plain log

<div class="zoom-content">

- The orchestrator writes to `.audit/log.json` after every call, not just the approved ones
- Each entry records the action, the outcome, and why
- It is a flat file on disk: no dashboard to stand up, no query language to learn

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
</style>

<!-- [2.5 min] Blocking bad changes is only half the story, because you also want a record of what was attempted, including the attempts that got blocked. So every call through the orchestrator, whether the policy let it through or stopped it cold, appends one entry to a plain JSON log on disk. Each entry says what action was requested, whether it was approved, and what happened. There's no dashboard here, no separate service, just a file you can read with a text editor or, as we'll see, with a small script built for exactly that. -->

---
layout: default
---

# Four questions answered, one to go

<div class="zoom-content">

<ol class="!text-[1.3rem] space-y-2">
  <li class="answered">&#x2713; How does an agent actually drive Pulumi? Through the Automation API, as a function call in a loop.</li>
  <li class="answered">&#x2713; What decides whether a change is even allowed to happen? A policy rule reading an approval flag on a marker resource.</li>
  <li class="answered">&#x2713; Blocked before it lands, or only flagged afterward? Mandatory enforcement fails the update in preview.</li>
  <li class="answered">&#x2713; What is left to check afterward? Every attempt appends one line to a plain audit log.</li>
  <li>Should the agent decide on its own, or only propose one?</li>
</ol>

</div>

<style scoped>
.zoom-content { zoom: 1.05; }
.answered { color: var(--p-fg-muted); }
</style>

<!-- [0.5 min] Four down, one left, and it's the one about trust. -->

---
layout: section
---

# Should the agent decide on its own, or only propose one?

## Question 5 of 5

<!-- [0.5 min] Everything so far assumed the orchestrator already knows what to do. That's not always true. -->

---
layout: two-cols
---

::header::
# A scripted orchestrator always takes the same path. An LLM in the loop only proposes one.

::left::

**Deterministic (03-orchestrator)**

<div class="zoom-content">

- Same command, same code path, every single time
- No model call between the request and the policy check
- What ran is exactly what the code says should run

</div>

::right::

**Proposal only (05-llm-stretch, optional)**

<div class="zoom-content">

- Reads the same audit log everyone else reads
- Suggests the next action and the exact command for it
- A person still has to decide to run that command

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
</style>

<!-- [3.5 min] Everything we've covered so far, the orchestrator, the policy rule, the audit log, works whether or not there's an LLM anywhere near it, and in this workshop's main demo there isn't: 03-orchestrator is a plain, deterministic Node program. Same command in, same code path, same result, every time. There's an optional stretch piece, 05-llm-stretch, that adds a model into the loop, but notice what it's allowed to do: it reads the audit log and proposes what should happen next, in plain language, plus the exact command a human would type to do it. It does not get to run that command itself. That boundary is deliberate. The moment an LLM can decide and execute in the same breath, you're back to PocketOS. -->

---
layout: statement
---

<h1 class="!text-[3.1rem]">This gate checks that a box was ticked, not who ticked it or why</h1>

<p class="source-line">A real system needs an approval that came from somewhere a script cannot set on its own</p>

<style scoped>
.source-line { font-size: 1.2rem !important; font-weight: 400 !important; letter-spacing: normal !important; margin-top: 1.8rem !important; color: var(--p-fg-muted); max-width: 78% !important; }
</style>

<!-- [3.0 min] Before we get to the demo, I want to be honest about where this breaks today, because a workshop that only shows the happy path isn't teaching you anything you can rely on. Our approval flag lives on a marker resource that the same script requesting the change also sets. Right now, the orchestrator can approve its own request. The policy checks that the box is ticked; it has no way to check who ticked it, or whether they had the authority to. A real deployment would carry that flag from somewhere the requester can't touch on its own: a change management system, a ChatOps approval, a signed token from a human's session. That's not a small gap, it's the next thing you'd build. I'd rather tell you that directly than let the demo imply we solved it. -->

---
layout: default
---

# One orchestrator, one policy pack, one log

```mermaid {scale: 1.2}
flowchart LR
    O["Orchestrator<br/>Automation API"] -->|"stack.up policyPacks"| WF["WorkerFleet<br/>marker + workers + configVersion"]
    WF --> G{"Mandatory rule<br/>checks marker approved"}
    G -->|"false"| BL["Blocked<br/>before the cloud is touched"]
    G -->|"true"| AP["Applied"]
    BL --> LOG[("Audit log<br/>.audit/log.json")]
    AP --> LOG
    LOG --> RD["Readers<br/>audit script, LLM stretch"]
```

<!-- [5.0 min] Let's put the whole thing together before we go build it. One orchestrator, a small Node program built on the Automation API, is the only thing that ever calls stack.up, and it always calls it with our policy pack attached. That single call creates or updates the worker fleet: a marker resource carrying this attempt's approval flag, a handful of worker identities standing in for real compute, and a config version that rotates when we ask it to. Before any of that reaches the cloud, the mandatory rule reads the marker's approved flag. If it's not exactly true, the update fails right there and nothing changes. If it is true, the update applies. Either way, blocked or applied, one line goes into the audit log, and that log isn't just for humans: the audit reader and the LLM stretch piece both read it, read only, to answer questions about what's happened so far. One call site for the gate, one place the log gets written, one file everything downstream reads from. That's the whole architecture, and it's what you're about to watch run for real. -->

---
layout: default
---

# The line that matters: `stack.up` with the policy pack attached

```ts
const stack = await LocalWorkspace.createOrSelectStack({
  stackName: "dev",
  workDir: "../01-fleet",
});
await stack.setConfig("approved", { value: String(approve) });
await stack.up({ policyPacks: ["../02-policy"] });
```

<!-- [2.0 min] Here's the shape of the actual program, trimmed to what matters. It selects or creates the dev stack, sets the approval flag the marker resource will pick up, and calls stack.up with the policy pack attached. That last line is the whole safety story in one call: pass the pack, and every resource that update touches gets checked against our mandatory rule before anything applies. Leave that array empty, or leave it out, and there's no gate at all, so this is also the line that would matter most in a code review of a real version of this program. -->

---

<div class="sec">
  <img class="sec__lines sec__lines--tr" src="/lines/bg-top-right-1.svg" alt="" />
  <img class="sec__lines sec__lines--bl" src="/lines/bg-bottom-left-1.svg" alt="" />
  <div class="sec__inner">
    <h1 class="!text-[6rem] !leading-tight !font-semibold !tracking-tight !m-0 text-[var(--p-primary)] !max-w-[95%]">Demo: Putting Agents to Work.</h1>
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

---
layout: default
---

# What we are going to do

<div class="zoom-content">
<div class="grid grid-cols-2 gap-x-10 gap-y-4">
<ul class="!text-[1.35rem] !leading-relaxed space-y-3">
<li>One script prepares the backend; nothing is deployed yet</li>
<li>The policy's own tests pass, with no cloud involved</li>
<li>The very first deploy attempt is also an unapproved scale up, and gets blocked</li>
<li>The same scale up, approved, goes through</li>
</ul>
<ul class="!text-[1.35rem] !leading-relaxed space-y-3">
<li>Two more changes go through the same gate</li>
<li>The audit log reads back everything that just happened</li>
<li>Stretch: an agent proposes the next action, and stops there</li>
</ul>
</div>
</div>

<style scoped>
.zoom-content { zoom: 1.15; }
</style>

<!-- [2.5 min] Here's what you're about to watch, start to finish. One setup script prepares a local backend; it doesn't create the fleet, so nothing exists yet when it finishes. We'll confirm the policy's own tests pass on their own, no cloud, no orchestrator, just the rule. Then the very first deploy attempt is also an unapproved scale up, and we'll watch it get blocked. Same command, this time with approval, and it goes through. We'll run two more changes, a rotation and a scale down, through that same gate. Then we'll read the audit log back and see every one of those attempts recorded. And if we have time, the stretch piece: an agent proposes what to do next and hands us the command, without running it itself. -->

---
layout: default
---

# One script prepares the backend. It does not deploy anything.

```bash
scripts/setup.sh
```

<div class="zoom-content">

- Installs dependencies, compiles each project, and points Pulumi at a local, file-based backend
- No cloud account, no cost, nothing to tear down but a folder
- It never calls `pulumi up`: the fleet itself does not exist yet

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
</style>

<!-- [2.0 min] One command, run once, before any orchestrator call happens. This installs dependencies, compiles each of the five projects, and logs Pulumi into a local backend, a plain folder on disk, no cloud account, nothing to sign up for. What it deliberately does not do is deploy the fleet. There's no pulumi up in this script. So when it finishes, the fleet doesn't exist yet, not even in an unapproved state. The very first time anything gets deployed is the very first command we give the orchestrator, which is exactly where we're headed next. -->

---
layout: default
---

# The rule is right before it ever gets to gate anything

```bash
npm test
```

<div class="zoom-content">

- Runs from `02-policy/`, against the rule as a plain function, no Pulumi Cloud involved
- Seven cases: the marker with no flag, with the flag false, with it true, and resources that should not be touched at all
- All seven pass

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
</style>

<!-- [2.5 min] Before I trust a policy to gate anything real, I want to know the rule itself is right, without needing Pulumi Cloud or a live stack. The rule is written as a plain function specifically so it can be unit tested that way. Seven cases: a marker with no approval flag at all, one with it set to false, one with it true, and a couple of resources that aren't the marker, to prove the rule leaves them alone. All seven pass. This is the kind of check that should run in CI on every commit to the policy pack, the same as any other code that gates a production system. -->

---
layout: default
---

# Blocked: the very first deploy attempt fails closed, before the cloud is touched

```bash
node bin/orchestrator.js scale-up --replicas 4
```

<div class="zoom-content">

- No `--approve` flag: the marker's `approved` keeper stays `"false"`
- This is also the fleet's first-ever deploy attempt, so a block here creates zero resources
- The policy pack fails the update in preview; exit code 1; one line appends to the audit log

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
</style>

<!-- [4.0 min] This is the moment the whole workshop has been building to, and it's a stronger moment than it looks: this is also the first time anyone has tried to deploy this fleet at all. We ask the orchestrator to scale up to four workers, no approval flag. Watch what happens: it doesn't create some workers and tell us afterward that something looked wrong. The policy pack catches it in preview, before Pulumi issues a single call, and the whole update fails, so the fleet still doesn't exist after this. Exit code 1. The orchestrator still writes one line to the audit log, a blocked entry, because a blocked attempt is exactly as worth recording as a successful one. If PocketOS's agent had been running inside something shaped like this, the deletion call fails right here, before it ever reaches Railway's API. -->

---
layout: default
---

# Approved: the same command, the same code path, a different flag

```bash
node bin/orchestrator.js scale-up --replicas 4 --approve
```

<div class="zoom-content">

- `--approve` sets the marker's `approved` keeper to `"true"` before `stack.up` runs
- The policy pack finds nothing to object to; the update applies
- This is the fleet's first successful deploy: zero workers to four; a new line appends: `APPROVED scale-up`

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
</style>

<!-- [4.0 min] Same command, one flag added. Nothing else about the program changed: not the code path, not which function gets called, not which policy pack is attached. The only difference is that the marker resource this apply creates now carries approved true, and the rule has nothing left to object to. The update goes through, and because the blocked attempt a moment ago created nothing at all, this is actually the fleet's first successful deploy: it goes straight from not existing to four workers. The audit log gets a new line, this time approved. I want to underline what didn't happen: there's no separate approved version of the orchestrator, no special path we switch to. It's the exact same gate, and the outcome changed because the input to the gate changed, which is exactly how you'd want a safety mechanism to behave. -->

---
layout: default
---

# Two more changes go through the exact same gate

```bash
node bin/orchestrator.js rotate --approve
node bin/orchestrator.js scale-down --replicas 2 --approve
```

<div class="zoom-content">

- Rotate forces `configVersion` to replace; scale-down shrinks the fleet back to 2
- Both go through the identical policy check as the scale up, because the rule inspects the marker, not the action
- Approved both times; two more lines append to the log

</div>

<style scoped>
.zoom-content { zoom: 1.2; }
</style>

<!-- [2.5 min] Scaling up isn't the only kind of change this gate has to handle, so let's run two more: a config rotation, which forces the config version resource to replace, and a scale down, which shrinks the fleet back to two workers. Both go through the identical check the scale up did, because the rule doesn't know or care what kind of action it's looking at; it only reads the marker's approved flag. That's a deliberate design choice: one rule, one thing to get right, works across every kind of change the fleet supports, instead of a separate bespoke check per action. Approved both times, and the log picks up two more lines. -->

---
layout: default
---

# The audit trail reads back everything that just happened

```bash
node 04-audit/bin/read-audit.js
```

<div class="zoom-content">

- Reads `.audit/log.json`: a plain, append-only file, nothing else touches it
- Four entries, in order: `BLOCKED scale-up`, `APPROVED scale-up`, `APPROVED rotate`, `APPROVED scale-down`
- Summary line: 3 approved, 1 blocked

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
</style>

<!-- [4.0 min] Everything we just did is sitting in one plain file, and this script reads it back. Four entries, in the order we made them: the blocked scale up, the approved scale up, the approved rotation, and the approved scale down. Three approved, one blocked, exactly what we watched happen, nothing more and nothing less. There's no separate database here, no service that could disagree with what's on disk. If you wanted to feed this into a dashboard, a ticketing system, or a compliance report, this file is the entire interface you'd build against. -->

---
layout: default
---

# An agent can propose the next action without being trusted to run it

```bash
node 05-llm-stretch/bin/propose-next-action.js
```

<div class="zoom-content">

- Reads the same audit log as `04-audit`, nothing more
- Without an API key, it prints a dry run: the action it would propose, and why
- It prints the exact command a human would type; it never runs that command itself

</div>

<style scoped>
.zoom-content { zoom: 1.25; }
</style>

<!-- [4.0 min] This last piece is optional, a stretch goal, and it answers our fifth question directly. It reads the same log the audit script just read, nothing more, and without an API key configured, it runs as a dry run: it states what action it would propose and its reasoning, then prints the exact command a person would need to type to actually do it. Notice the shape of that boundary again. It can read. It can suggest. It does not call the orchestrator itself. If you want this piece to actually reach a model, that's just an API key away, but the boundary between proposing and running doesn't move when you add that key. That's not a limitation of this stretch demo, it's the entire point of it. -->

---
layout: default
---

# One code path, one policy, two outcomes, one log

<div class="zoom-content">

- Every request, scale up or rotate, approved or not, went through the exact same `stack.up` call
- The policy pack decided the outcome before the cloud was ever touched, not after
- Blocked and approved attempts both left a record, in the same file, in the order they happened

</div>

<style scoped>
.zoom-content { zoom: 1.3; }
</style>

<!-- [3.0 min] Step back and look at what just ran. Every request we made, whatever it asked for, however it was flagged, went through the identical code path: the same orchestrator, the same stack.up call, the same policy pack attached every time. The only thing that changed the outcome was what the policy pack found when it looked at that attempt's marker, and it looked before anything touched the cloud, not after. Whether an attempt was blocked or approved, it left exactly one line in exactly one file, in the order it actually happened. That's a small system, small enough to read end to end in an afternoon, but it's the same shape you'd want underneath something much bigger. -->

---
layout: default
---

# Five questions, five answers

<div class="zoom-content">

<ol class="!text-[1.35rem] !leading-relaxed space-y-3">
<li>How does an agent drive Pulumi? Through the Automation API, a function call in a loop.</li>
<li>What decides whether a change is allowed? A policy rule reading a marker resource's approval flag.</li>
<li>Blocked before it lands, or only flagged after? Mandatory enforcement fails the update in preview.</li>
<li>What is left to check afterward? Every attempt appends one line to a plain audit log.</li>
<li>Does the agent decide, or only propose? The orchestrator is deterministic; an LLM may only propose.</li>
</ol>

</div>

<style scoped>
.zoom-content { zoom: 1.15; }
</style>

<!-- [2.0 min] Five questions, and now five answers you've actually watched run, not just heard described. An agent drives Pulumi through the Automation API, as a function call, not a typed command. What decides whether a change happens is a policy rule reading an approval flag off a marker resource. That rule runs as mandatory enforcement, so a bad change fails in preview, before it ever reaches the cloud, not after. Every attempt, blocked or approved, leaves one line in a plain audit log. And the agent itself never gets to be the one deciding and executing in the same breath; at most, it proposes, and a person runs the command. None of that would have stopped PocketOS by accident. It would have stopped it because the check happens somewhere the agent cannot talk its way around. -->

---

# Resources

<div class="zoom-content">

<div class="grid grid-cols-5 gap-5 mt-4">
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/agent-driven-orchestration-governable" dark="#000000" />
    <div class="res-card__title">Workshop repo</div>
    <div class="res-card__body">pulumi/workshops → agent-driven-orchestration-governable</div>
  </div>
  <div class="res-card">
    <QRCode data="https://github.com/pulumi/workshops/tree/main/agent-driven-orchestration-governable" dark="#000000" />
    <div class="res-card__title">Workshop repository</div>
    <div class="res-card__body">pulumi/workshops</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/iac/concepts/automation-api/" dark="#000000" />
    <div class="res-card__title">Automation API</div>
    <div class="res-card__body">pulumi.com/docs/iac/concepts/automation-api</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/discovery-governance/" dark="#000000" />
    <div class="res-card__title">Discovery & Governance (policy as code)</div>
    <div class="res-card__body">pulumi.com/docs/discovery-governance</div>
  </div>
  <div class="res-card">
    <QRCode data="https://www.pulumi.com/docs/ai/" dark="#000000" />
    <div class="res-card__title">Infrastructure AI</div>
    <div class="res-card__body">pulumi.com/docs/ai</div>
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
      <div class="thanks__qr"><QRCode data="https://github.com/pulumi/workshops/tree/main/agent-driven-orchestration-governable" dark="#000000" /></div>
      <div class="thanks__qr-label">agent-driven-orchestration-governable</div>
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