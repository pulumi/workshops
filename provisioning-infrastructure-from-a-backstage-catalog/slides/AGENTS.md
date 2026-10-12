# AGENTS.md: the deck's brief and sources

This file records what the deck was asked to be and which sources it was built from, so anyone (human or agent) editing `slides.md` works from the same brief. Conventions for the whole workshop folder are in `../AGENTS.md`.

## Story

Written before any slide, per the workshop-deck skill. Every slide advances one of these six parts or goes.

1. **The moment.** Guidewire's engineering blog, "Unlocking Developer Velocity: Platform Engineering with KubeVela" (https://medium.com/guidewire-engineering-blog/unlocking-developer-velocity-platform-engineering-with-kubevela-7604a1529ada), carries the subtitle "How KubeVela & Crossplane helped us eliminate state files, drift, and deliver infrastructure faster." That subtitle is the only text of the article quoted on a slide. medium.com blocked this workstation (HTTP 403 from the download tool and from a browser), so the article body was not read when the spine was written; the subtitle was read in search-result metadata. The fact-check pass must retry the body and either confirm the framing or replace the moment. The brief gives the posting date as 2026-08-26; the search metadata suggests January 13. The slide shows no date until it is confirmed.
2. **The tension.** "The portal is the front door to infrastructure." / "Behind it, Create opens a ticket."
3. **Why it is hard.** A portal is good at a catalog and a form. State, credentials, policy and history belong to whatever runs the infrastructure. A before-and-after contrast: a form that submits a ticket against a form that runs a program.
4. **The questions.** Six, taken from brief §5: where does my code run when someone clicks Create; how does it reach my cloud account without a static key; where do I see what happened and roll it back; can a bad request be stopped before it becomes a resource; does this only work for AWS; what does the platform team build once, and what does every consuming team get.
5. **The answers.** In order: a Backstage scaffolder action runs in the Backstage backend and calls the Pulumi Automation API (Q1); Pulumi ESC issues short-lived AWS credentials over OIDC (Q2); Pulumi Cloud keeps state and history (Q3); Pulumi Policies block before deploy (Q4); the program shape is not tied to one provider, stated as a claim about the pattern and not demonstrated (Q5); the platform team builds the action, template, ESC environment and policy pack once (Q6, closed by the demo).
6. **The proof.** Seven demo steps from the demo folders: portal up, template renders, Create makes a real bucket, static keys removed, history in Pulumi Cloud, policy blocks an untagged bucket, teardown. The demo answers Q6 last: a developer clicks Create and gets a tagged, checked resource.

## The workshop

"Provisioning real infrastructure from a Backstage catalog with Pulumi". Audience: platform engineers and SREs who run or are evaluating Backstage. Level: intermediate. Length: 105 minutes (brief §1). Sessions and speakers: not announced; the deck carries one placeholder speaker slide.

## The original request

The deck was drafted from these inputs, in this order of authority:

1. The workshop brief, "Workshop brief: Provisioning real infrastructure from a Backstage catalog with Pulumi" (§1 promise and length, §3 learning outcomes, §4 demo plan, §5 story and questions, §8 sources).
2. The demo code in the sibling folders `01-backstage-host` to `07-teardown` and the folder `README.md`: every command on a slide is one the demo runs, with the same flags.
3. The reference workshop deck, `neo-in-a-docker-sandbox/slides`: the style source of truth for the fixed frame and the slide patterns.
4. The workshop-deck, slidev-deck and slidev skills, and the frame tool `deck_frame.py` with its pattern file.

## Structure

Length 105 minutes. Slide count 41, including the fixed frame. Time budgets are in each slide's speaker notes and sum to 105.0 minutes.

| Part | Slides | Minutes |
| --- | --- | --- |
| Opening frame (title, speaker, divider, housekeeping, agenda) | 5 | 6 |
| Act 1: the pain | 6 | 13 |
| Act 2: the tech | 16 | 36 |
| The solution we will build | 2 | 5 |
| Demo divider | 1 | 0.5 |
| Act 3: the demo | 8 | 36 |
| Closing frame (Resources, journey, Thank you / Questions) | 3 | 8.5 |

Act 3 is 8 of 41 slides, under a quarter. Program code appears on one slide (the solution slide), ten lines at most; each demo slide has one command and no program code; the deck holds twenty lines of code and commands at most.

## Headlines

Pattern for each story and demo slide, chosen before any slide is written. Read in order, the headlines tell the story.

Act 1: the pain
1. Guidewire's platform team set out to eliminate state files and drift (the article subtitle, quoted verbatim) — pattern: quote-card
2. "The portal is the front door to infrastructure." — pattern: big-statement
3. "Behind it, Create opens a ticket." — pattern: big-statement
4. A form that submits a ticket is not a form that runs a program — pattern: compare
5. A good Create is a request that becomes a resource, with no queue between — pattern: flow
6. Six questions stand between a Create button and trust — pattern: card-grid

Act 2: the tech
7. Where does the code run when someone clicks Create? — pattern: section-opener
8. A catalog entry becomes a form, and the form becomes a task — pattern: flow
9. The custom action runs in the Backstage backend, as ordinary TypeScript — pattern: zones
10. The Automation API turns up, preview and destroy into a typed SDK — pattern: stack
11. An inline program fits an action that ships with the portal — pattern: compare
12. How does it reach my cloud without a static key? — pattern: section-opener
13. A static key on the portal host is a standing breach waiting to happen — pattern: compare
14. ESC trades a short-lived token for temporary AWS credentials — pattern: chain
15. Two questions covered, four to go — pattern: recap-grid
16. Where do I see what happened, and roll it back? — pattern: section-opener
17. A portal-created stack is a first-class stack in Pulumi Cloud — pattern: zones
18. Can a bad request be stopped before it becomes a resource? — pattern: section-opener
19. Pulumi Policies block the update before AWS is touched — pattern: flow
20. The same program shape works with any provider Pulumi supports — pattern: options
21. Where this breaks today — pattern: card-grid
22. Five questions answered, one to go — pattern: recap-grid

The solution we will build
23. One click in Backstage ends as a tagged, checked, recorded bucket — pattern: flow
24. The action is a short function around one Automation API program — pattern: terminal or big-code (a ten-line code block, the only program code in the deck; copy it from `03-scaffolder-action/src`)

Demo divider: generated by `deck_frame.py`.

Act 3: the demo
25. Seven steps take a catalog entry to a policy-checked bucket and back — pattern: demo-overview
26. Step 1: Backstage is up and the catalog is browsable — pattern: demo-step
27. Step 2: the template renders, and Create fails on a missing action — pattern: demo-step
28. Step 3: registering the action turns Create into a real bucket — pattern: demo-step
29. Step 4: the host holds no AWS key, and Create still works — pattern: demo-step
30. Step 5: the stack and its history are already in Pulumi Cloud — pattern: demo-step
31. Step 6: an untagged bucket is blocked before it exists — pattern: demo-checks
32. Step 7: teardown leaves nothing behind but the host you stop — pattern: demo-outcome

Patterns used: quote-card, big-statement, compare, flow, card-grid, section-opener, zones, stack, chain, recap-grid, options, terminal, demo-overview, demo-step, demo-checks, demo-outcome. Slides 1 to 32 are the story and demo; the other nine are the frame.

Gate: Act 1 has the moment, tension, why it is hard and the questions (6 slides, range 4 to 7). Act 2 has 16 slides (range 8 to 16), ends with "Where this breaks today" and the recap. Act 3 has 8 of 41 slides.

## Brief inconsistencies and how the deck resolves them

- Length: §1 says 105 minutes; §5 says "32 slides" and the handoff and §4 risk text say "90-minute slot". The deck follows §1 (105 minutes) and uses 41 slides because the fixed frame adds nine.
- §5 says "no code"; the workshop-deck skill allows one solution slide with ten lines at most. The deck follows the skill.
- §4 lists `aws.s3.BucketV2`; the demo uses `aws.s3.Bucket` because `BucketV2` is deprecated in the pinned provider. Slides name no resource class beyond what the demo uses.
- §4 step 3 says the demo makes a supporting IAM role and OIDC provider; the demo pre-creates the OIDC provider and role in `04-esc-oidc/bootstrap` (brief §6 agrees). `07-teardown` only removes the OIDC provider with `--full`.
- Policy enforcement: the demo runs the policy pack locally through `PULUMI_POLICY_PACK_PATH`; the brief's wording is about Pulumi Cloud policy groups. The slides say what the demo does.
- §1 asks for Pulumi Policies; the brief's open item (policy rename) is checked against current docs in the fact-check log.
- The Guidewire post date differs between the brief and search metadata (see Story, part 1).

## Sources, read for the deck

Read 2026-10-07 unless noted. Brief §8 lists its own sources, read 2026-09-29.

- Guidewire engineering blog, article title and subtitle only (body blocked, see Story): https://medium.com/guidewire-engineering-blog/unlocking-developer-velocity-platform-engineering-with-kubevela-7604a1529ada
- SiliconANGLE, Spotify's Tyson Singer on Backstage and cognitive load (read in full): https://siliconangle.com/2026/03/25/platform-engineering-essential-age-ai-agents-kubeconeu/
- Backstage, writing custom scaffolder actions: https://backstage.io/docs/features/software-templates/writing-custom-actions/
- Pulumi Automation API: https://www.pulumi.com/docs/iac/packages-and-automation/automation-api/
- Pulumi ESC, AWS login: https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/aws-login/
- Pulumi Policies: https://www.pulumi.com/docs/insights/policy/
- Pulumi ESC overview: https://www.pulumi.com/docs/esc/
- slidev-deck skill source: pulumi/marketing-web `.agents/skills/slidev-deck/SKILL.md`, commit recorded below.

## Binding rules for this deck

- The frame (opening slides, demo divider, closing slides) comes from `frame.json` through `deck_frame.py`; never edit it by hand. Change `frame.json`, run `init … --frame-only`, then `check`.
- `deck_frame.py check .` must pass before every commit.
- Every story and demo slide is a reference pattern; no theme layout except `image`; no Mermaid; icon-list text sits in one `<span>`.
- Headlines are claims. Product names: Pulumi Neo, Pulumi ESC, Pulumi Cloud, Pulumi IaC, Pulumi Policies; never "Copilot", "Pulumi Service", "Insights" or "CrossGuard" as a product name.
- Speaker notes carry a time budget on every slide.
- Do not change `package.json` scripts, `style.css` or the headmatter.
- No credentials, `node_modules/`, `dist/` or exports in a commit.

## slidev-deck skill source

Commit read: 9b37f9afe8c7b0d406f19bc9116b16d5689389ce (pulumi/marketing-web, read 2026-10-07).

## Fact-check log

Separate pass run 2026-10-07 after the deck was drafted. 27 claims extracted from slides and speaker notes, moment first.

Sources opened this run (2026-10-07):
- https://www.pulumi.com/docs/iac/automation-api/ (Automation API: strongly typed SDK for up, preview, destroy, stack init; inline programs)
- https://www.pulumi.com/docs/esc/environments/configuring-oidc/aws/ (ESC authenticates to AWS with OpenID Connect through an IAM role)
- https://www.pulumi.com/docs/esc/providers/login/ (login providers issue short-lived credentials)
- https://www.pulumi.com/docs/insights/policy/ (policies, policy packs, policy groups in Pulumi Cloud)
- https://backstage.io/docs/features/software-templates/ and https://backstage.io/docs/features/software-templates/writing-custom-actions/ (templates, parameters, tasks, custom actions)
- Demo folder and its teardown.sh, README.md in this branch (commands, cost, teardown modes)
- Medium blocked page body again (HTTP 403, 2026-10-07). The Guidewire title text was read in the search snippet of a Medium listing page only.

Results:
- Moment: the quoted line "How KubeVela & Crossplane helped us eliminate state files, drift, and deliver infrastructure faster." is confirmed as Guidewire engineering blog text via the Medium listing snippet. The article body was not read. Slides claim only what that line says. Open question for review: confirm the post date and whether the line is a title or subtitle.
- Confirmed against docs: Automation API as a typed SDK with up, preview and destroy; inline programs; ESC and OIDC to AWS; login providers issue short-lived credentials; policies, packs and policy groups; scaffolder templates, tasks and custom actions.
- Confirmed against the demo folder: commands and flags on the demo slides, the under-$1 cost line, teardown modes.
- Corrected: "Many platform teams make the same trade for the same reasons" removed (unsupported). Step 7 headline said teardown leaves nothing but the host; the default script keeps the OIDC bootstrap stack, so the headline now says every bucket stack is removed and --full removes the rest, and the note says --full also stops the Compose host.
- Not demonstrated, stated as pattern claims only: use with other providers (slide 25 marks them as not shown).
