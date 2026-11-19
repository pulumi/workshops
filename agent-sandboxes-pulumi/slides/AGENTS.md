# AGENTS.md — the deck's brief and sources

This file records what the deck was asked to be and which sources it was built from, so anyone (human or agent) editing `slides.md` works from the same brief. Conventions for the whole workshop folder are in `../AGENTS.md`.

## Story

1. **The moment.** Two conference scenes, both read on 2026-10-10. AI Engineer World's Fair 2026 (San Francisco, June 29 to July 2, 2026) lists at least ten sessions with "sandbox" in the title (ten counted by a title match), for example "Sandboxes Aren't Optional: Runtime Isolation Patterns for Coding Agents at Scale" and "Your agent needs a sandbox, not a desert". KubeCon + CloudNativeCon North America 2026 opens Tuesday, November 10 with the keynote "Sandbox Your Agents" (Jessica Forrester, 9:55 AM to 10:00 AM). Its abstract says: "A problematic agent with too much access, either through choice or a lack of knowledge, can take down entire production stacks and wipe databases." Sources: https://ai.engineer/worldsfair/2026/sessions.json and https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/?id=1301749. There is no single named incident in the brief; the scene is the conference programme itself, and the slide says so.
2. **The tension.** "An agent with your long-lived key is an incident waiting for a prompt." / "A shared, wide-open sandbox is the same incident, slower." (brief §5).
3. **Why it is hard.** A shared sandbox looks safe and is not: every task sees every other task's data, the credential outlives the task, and nobody owns cleanup. The contrast slide sets one shared sandbox against one environment per task.
4. **The questions.** Five, in the order the deck answers them: (1) What does an agent need to work, and nothing more? (2) How do credentials expire without anyone remembering to rotate them? (3) How do you prove a sandbox follows the rules before it exists? (4) Where does the audit trail live? (5) How do you stop sandboxes piling up?
5. **The answers.** (1) One Pulumi stack per task through the Automation API, plus an IAM role under a permissions boundary. (2) Pulumi ESC `aws-login` through OIDC, one-hour credentials. (3) A Pulumi Policies pack that runs at preview. (4) Pulumi Cloud: one stack, one update history, one set of tags per sandbox. (5) Expiry tags and a reaper; TTL stacks are the managed option and need the Pro or Enterprise edition.
6. **The proof.** The demo builds all of it and ends on question 5: the reaper deletes the expired sandbox and leaves the other three. Along the way it shows a denied cross-sandbox read (question 1) and a bad sandbox failing at preview (question 3).

## The workshop

"Disposable Cloud Sandboxes for AI Agents: One Pulumi Stack per Task". 90 minutes. Sessions, dates and speakers: not decided yet, so the deck has one placeholder speaker slide. Pulumi owns the deck and the demo.

## The original request

The deck was built from these inputs, in this order of authority:

1. The workshop brief, "Workshop brief: Disposable cloud sandboxes for AI agents, one Pulumi stack per agent task with short-lived credentials and automatic teardown" (workspace document). Its §1 sets the length, §2 and §5 the story, §4 the demo steps, §9 the checklist.
2. The demo in this folder (`../README.md` and folders `01-setup` to `09-teardown`), which is the source of every command on a slide.
3. The reference deck, `../../neo-in-a-docker-sandbox/slides/slides.md`, for the story moves and the slide patterns.
4. The workshop-deck skill and `deck_frame.py` (frame, patterns, check).

## Structure and time budget

Total 90 minutes over 40 slides. Every slide's speaker notes carry its budget.

- Opening frame: 5 slides, 3.75 min
- Act 1, the pain: 6 slides, 11.25 min
- Act 2, the tech: 13 slides, 16.75 min
- The solution we will build: 3 slides, 6 min
- Demo divider: 1 slide, 0.25 min
- Act 3, the demo: 9 slides, 46 min (with the divider, 10 of 40 slides, a quarter of the deck)
- Closing frame: 3 slides, 6 min (Resources 1, Continue your journey 0.5, Thank you / Questions 4.5)

## Sources

Read on 2026-10-10 unless noted.

- AI Engineer World's Fair 2026 sessions list: https://ai.engineer/worldsfair/2026/sessions.json
- KubeCon + CloudNativeCon NA 2026, "Sandbox Your Agents": https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/?id=1301749
- Pulumi Automation API guide: https://www.pulumi.com/docs/iac/guides/building-extending/automation-api/
- Pulumi ESC, configuring OIDC for AWS: https://www.pulumi.com/docs/esc/environments/configuring-oidc/aws/
- Pulumi Policies, policy as code: https://www.pulumi.com/docs/discovery-governance/concepts/policy-as-code/
- TTL stacks: https://www.pulumi.com/docs/deployments/concepts/ttl/
- Everything else in the brief §4 and §8 (registry pages, PyPI and npm versions), read by the brief's author and the demo build on 2026-10-10.
- Slide-level claims are logged under "Fact-check" at the end of this file.

## Deviations from the brief

- Brief §5 outlines about 30 slides; §9 allows 25 to 40 and the workshop-deck skill caps Act 3 at a quarter of the deck. One slide per demo folder plus an overview makes ten Act 3 slides, so the deck has 40.
- The brief lists the questions with "stop sandboxes piling up" third and "audit trail" fifth. The deck puts piling up last so the demo (the reaper) answers the final question. The same five questions, a different order.
- The brief's "hallway question" is not a quote. It appears as our own framing, not attributed to anyone.
- The TTL stacks versus reaper slide sits in "The solution we will build", not in Act 2, because it is the reason for the design and it keeps question 5 open for the demo.
- The brief's outline has no code; the deck has one slide with the shape of the orchestrator (four lines), as the workshop-deck skill allows.
- Brief §6 prerequisites go into the Housekeeping slide notes and the demo overview notes, not a slide of their own.
- Speakers, session dates and event page are unknown, so the deck has one placeholder speaker slide and the repo QR code only.
- Brief §7 risks go into the speaker notes of the slides where they bite: ESC and setup (steps 1 and 2 run beforehand, with a recorded fallback), the retry on STS assume (step 6), three tasks only (step 5), TTL needs Pro (solution section).

## Rules that bind

- Pulumi names: Pulumi Neo, Pulumi ESC, Pulumi Cloud, Pulumi IaC, Pulumi Policies, Pulumi console in lowercase. No Docker and no Neo content: that workshop is `neo-in-a-docker-sandbox`.
- Every command on a slide is one the demo runs, with the same flags (see "Headlines" and `../README.md`).
- Code budget: program code on one slide, four lines; commands on demo slides at most three lines each; twenty lines of code and commands in the whole deck at most.
- The frame (opening, demo divider, closing) comes from `deck_frame.py` and `frame.json`. Change `frame.json` and run `init --frame-only`; never edit those slides by hand.
- Story and demo slides are copies of the reference patterns. No theme layout except `image`, no Mermaid.
- Speaker notes are spoken, carry a time budget, and have been through the humanizer.
- Credentials, `node_modules/`, `dist/`, `export-pages/`, PDFs and state never enter a commit.
- If the demo code is wrong, the slides stay true to the code and the PR says so; the demo is not changed from this folder's deck work.

## Marketing-web skill

The `slidev-deck` skill lives in the private repository `pulumi/marketing-web`. On 2026-10-10 `gh` on the build machine was not logged in, so it could not be read and no commit sha is recorded. The theme package `@pulumi/slidev-theme` 0.4.0 was used instead (`node_modules/@pulumi/slidev-theme/README.md`, `starter.md`, `layouts/*.vue`), as the skill's own fallback says.

## Headlines

Every slide, in order, with its pattern and time budget, taken from `slides.md` on 2026-10-10 (40 slides). Read alone, the headlines tell the story. Step 1 (`01-setup/setup.sh`) has no slide of its own: its command sits on "What we are going to do".

### Opening frame (generated)

1. Disposable Cloud Sandboxes for AI Agents: One Pulumi Stack per Task — pattern: frame — 0.5 min
2. Speaker Name — pattern: frame — 1 min
3. Housekeeping and Agenda — pattern: frame — 0.25 min
4. Housekeeping — pattern: frame — 1 min
5. Today's Agenda — pattern: frame — 1 min

### Act 1: the pain

6. At least ten conference sessions this summer had "sandbox" in the title — pattern: quote-card — 2.75 min
7. An agent with your long-lived key is an incident waiting for a prompt. — pattern: big-statement — 0.5 min
8. A shared, wide-open sandbox is the same incident, slower. — pattern: big-statement — 0.5 min
9. Disposable means one environment per task, scoped and deleted on schedule — pattern: compare — 2.5 min
10. Every sandbox has three ways to be too open — pattern: boundaries — 2 min
11. Five questions decide whether you can trust a sandbox — pattern: card-grid — 3 min

### Act 2: the tech

12. Q1. What does an agent need to work, and nothing more? — pattern: section-opener — 0.25 min
13. One stack per task makes a sandbox something you can create and delete — pattern: flow — 2 min
14. A permissions boundary caps what the task's role can ever do — pattern: chain — 2.5 min
15. Q2. How do credentials expire without anyone remembering to rotate them? — pattern: section-opener — 0.25 min
16. ESC trades an OIDC token for one-hour AWS credentials — pattern: flow — 2.5 min
17. Two questions covered, three to go — pattern: recap-grid — 0.75 min
18. Q3. How do you prove a sandbox follows the rules before it exists? — pattern: section-opener — 0.25 min
19. Policies run at preview, before any resource exists — pattern: zones — 2.5 min
20. Q4. Where does the audit trail live? — pattern: section-opener — 0.25 min
21. Pulumi Cloud keeps one record per sandbox — pattern: stack — 2 min
22. Four questions answered, one to go — pattern: recap-grid — 1 min
23. Where this breaks today: the sandbox is S3 and IAM, nothing more — pattern: compare — 2 min
24. Give every task its own cloud, and take it back on schedule. — pattern: big-statement — 0.5 min

### The solution we will build

25. TTL stacks need Pro, so we build our own reaper — pattern: options — 2 min
26. One orchestrator, three stacks, one reaper — pattern: zones — 2 min
27. The orchestrator is a handful of Automation API calls — pattern: terminal — 2 min

### Demo divider (generated)

28. Demo: Agent Sandboxes. — pattern: frame — 0.25 min

### Act 3: the demo

29. What we are going to do — pattern: demo-overview — 5 min
30. Step 2 · The ESC environment hands out one-hour credentials — pattern: demo-step — 4 min
31. Step 3 · The boundary is a ceiling the agent's role cannot exceed — pattern: demo-step — 4 min
32. Step 4 · One task previews as five resources — pattern: frame — 5 min
33. Step 5 · Three tasks spawn at once, each with its own stack — pattern: demo-outcome — 7 min
34. Step 6 · An agent writes to its bucket and is denied its neighbour's — pattern: demo-checks — 5 min
35. Step 7 · A sandbox without a boundary fails at preview — pattern: demo-step — 5 min
36. Step 8 · The reaper deletes the expired sandbox and keeps the other three — pattern: demo-outcome — 7 min
37. Step 9 · Teardown leaves nothing behind — pattern: demo-step — 4 min

### Closing frame (generated)

38. Resources — pattern: frame — 1 min
39. Continue your Pulumi journey! — pattern: frame — 0.5 min
40. Thank you — pattern: frame — 4.5 min

### Time budget

Computed by script from the `[N min]` note on every slide: 90 minutes across 40 slides, the 90 minutes of brief §1. Every slide carries a note, frame slides included.

### Code budget

Counted from the fenced blocks in `slides.md`: program code on 0 slides (the solution slide, "The orchestrator is a handful of Automation API calls", lists call names only, no code block). Commands: 12 lines in total across 8 demo slides, at most 3 lines on one slide (step 4), well inside the 20-line limit. Every command is copied from `../README.md` with the same flags.

### Demo commands (copied from `../README.md`)

1. `01-setup/setup.sh` (on "What we are going to do", no slide of its own)
2. `02-esc/create-env.sh`
3. `03-boundary/apply.sh`
4. `cd 04-sandbox && pulumi stack init demo`, `pulumi config set taskId a && pulumi config set boundaryArn "$(cat ../.state/boundary-arn)"`, `pulumi preview`
5. `python 05-orchestrator/orchestrator.py spawn task-a task-b task-c --ttl-minutes 30`
6. `python 06-agent/agent.py task-a task-b`
7. `python 05-orchestrator/orchestrator.py spawn bad-task --noncompliant --policy-pack 07-policy`
8. `python 05-orchestrator/orchestrator.py spawn short --ttl-minutes 2`, then `python 08-reaper/reaper.py`
9. `09-teardown/teardown.sh`, then `09-teardown/leftovers.sh`

### Questions return at the close

Slide 22 ("Four questions answered, one to go") and the step 8 slide, slide 36 (question 5 answered). The closing notes name all five.

## Fact-check

Separate pass after the humanizer pass. Every claim below was checked against a source opened on 2026-10-10: Pulumi docs for product facts, the two conference pages for the opening moment, the demo files for what the demo does. Pulumi names used: Pulumi Neo is not on the slides; Pulumi IaC, Pulumi ESC, Pulumi Cloud and Pulumi Policies are.

| Claim | Source | Date read | Outcome |
| --- | --- | --- | --- |
| At least ten sessions with sandbox in the title at AI Engineer World's Fair 2026 (10 counted) | [ai](https://ai.engineer/worldsfair/2026/sessions.json) | 2026-10-10 | confirmed |
| The fair ran this summer (June 29 to July 2, 2026) | [ai](https://ai.engineer/worldsfair/2026/sessions.json) | 2026-10-10 | confirmed |
| Session title "Sandboxes Aren't Optional: Runtime Isolation Patterns for Coding Agents at Scale" | [ai](https://ai.engineer/worldsfair/2026/sessions.json) | 2026-10-10 | confirmed |
| Keynote title "Sandbox Your Agents" at KubeCon + CloudNativeCon NA 2026 | [kc](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/?id=1301749) | 2026-10-10 | confirmed |
| Keynote on November 10 (9:55 AM, Salt Lake City) | [kc](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/?id=1301749) | 2026-10-10 | confirmed; slide changed from "KubeCon opens on November 10" to "KubeCon has the keynote", since the main days are November 10 to 12 and November 9 is a co-located day |
| Abstract quote "A problematic agent with too much access, either through choice or a lack of knowledge, can take down entire production stacks and wipe databases." | [kc](https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/?id=1301749) | 2026-10-10 | confirmed word for word |
| Pulumi Cloud exchanges an OIDC token for temporary AWS credentials by assuming an IAM role | [aws](https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/aws-login/) | 2026-10-10 | confirmed |
| ESC aws-login provider with oidc duration option (1h) | [aws](https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/aws-login/) | 2026-10-10 | confirmed |
| OIDC is the recommended way to log in to AWS from ESC (no static key) | [aws](https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/aws-login/) | 2026-10-10 | confirmed |
| TTL stacks are Pulumi Cloud managed expiry, Pro and Enterprise editions only | [ttl](https://www.pulumi.com/docs/deployments/deployments/ttl/) | 2026-10-10 | confirmed |
| Stack tags available in all editions ("works on any edition") | [stk](https://www.pulumi.com/docs/iac/concepts/stacks/) | 2026-10-10 | confirmed |
| Policy enforcement level mandatory blocks the deployment | [pol](https://www.pulumi.com/docs/insights/policy/policy-packs/) | 2026-10-10 | confirmed |
| A custom policy pack is tested with pulumi preview --policy-pack, so rules run at preview | [pol](https://www.pulumi.com/docs/insights/policy/policy-packs/) | 2026-10-10 | confirmed |
| Pulumi Cloud keeps the update history of a stack (pulumi stack history) | [his](https://www.pulumi.com/docs/iac/cli/commands/pulumi_stack_history/) | 2026-10-10 | confirmed |
| Deleting a stack removes its history from Pulumi Cloud (so reaper removes the stack after destroy) | [stk](https://www.pulumi.com/docs/iac/concepts/stacks/) | 2026-10-10 | confirmed, not stated on slides |
| Five resources in one preview: stack, bucket, scoped policy, role, attachment | demo files in `agent-sandboxes-pulumi/` | 2026-10-10 | confirmed (or changed, as noted) |
| Three tags: agent-task, owner, expires-at; role carries the boundary and 3600 s session | demo files in `agent-sandboxes-pulumi/` | 2026-10-10 | confirmed (or changed, as noted) |
| Boundary allows S3 on agent-sandbox-* only; IAM and EC2 denied by omission | demo files in `agent-sandboxes-pulumi/` | 2026-10-10 | confirmed (or changed, as noted) |
| Policy pack has two mandatory rules: role boundary, agent-task and expires-at tags on buckets and roles | demo files in `agent-sandboxes-pulumi/` | 2026-10-10 | confirmed (or changed, as noted) |
| Orchestrator calls create_or_select_stack, add_environments, set_tag (expires-at, owner), up with policy packs; three tasks in parallel (ThreadPoolExecutor, 3 workers) | demo files in `agent-sandboxes-pulumi/` | 2026-10-10 | confirmed (or changed, as noted) |
| Reaper calls list_stacks, list_tags, destroy, remove_stack; keeps unexpired and skips stacks without a tag | demo files in `agent-sandboxes-pulumi/` | 2026-10-10 | confirmed (or changed, as noted) |
| ESC environment agent-sandboxes/aws, aws-login, one hour, sessionName agent-sandboxes; create-env.sh runs sts get-caller-identity and prints the key id prefix (ASIA = temporary); changed the step 2 note from session token to key id prefix | demo files in `agent-sandboxes-pulumi/` | 2026-10-10 | confirmed (or changed, as noted) |
| Base role agent-sandbox-provisioner and OIDC provider created by setup.sh; README step 1 check is pulumi whoami | demo files in `agent-sandboxes-pulumi/` | 2026-10-10 | confirmed (or changed, as noted) |
| Teardown and leftovers scripts list agent-sandbox-* buckets, agent-* roles and policies | demo files in `agent-sandboxes-pulumi/` | 2026-10-10 | confirmed (or changed, as noted) |
| Step 4 slide listed four resources under 'Five to create'; changed to 'Five to create, the stack included' | demo files in `agent-sandboxes-pulumi/` | 2026-10-10 | confirmed (or changed, as noted) |
| Step 5 slide said buckets and roles 'appear in Pulumi Cloud'; changed to 'in AWS', stacks are what Pulumi Cloud shows | demo files in `agent-sandboxes-pulumi/` | 2026-10-10 | confirmed (or changed, as noted) |

Total claims checked: 26. Not run: the demo scripts need an AWS account and a Pulumi Cloud login, so the slide claims about their output come from the code and README, not from a run in this pass.
