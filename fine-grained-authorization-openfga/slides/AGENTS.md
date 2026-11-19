## Story

1. **The moment.** Arcade.dev, "Enterprise-Managed Authorization Is a Foundation, Not a Ceiling" (Manveer Chawla, 2026-06-23), read 2026-10-01: https://www.arcade.dev/blog/enterprise-managed-authorization-per-action-authorization-ai-agents/ . Verbatim: "No authorization layer distinguished a user-initiated action from an injection-initiated one." and "The agent was who it claimed to be." The incident it describes is Johann Rehberger's ChatGPT "ZombAI" proof of concept, where one prompt injection planted persistent instructions in ChatGPT's memory. Original post (Embrace The Red, 2025-01-06, read 2026-10-01): https://embracethered.com/blog/posts/2025/spaiware-and-chatgpt-command-and-control-via-prompt-injection-zombai/ . Verbatim there: "it is possible to compromise and remotely control ChatGPT instances through prompt injection". No survey number found, and the brief gives none. Attribute the quote to Arcade and the incident to Rehberger.
2. **The tension.** "The agent is exactly who it claims to be." / "Nothing asks whether this action should run."
3. **Why it is hard.** A role says who you are and what that whole class of people may do. An agent acts for a user but must hold fewer rights than the user, per object. Roles need a new role for every agent and every resource to say that.
4. **The questions.** (1) Who is acting, a person or an agent? (2) What may it touch, and through which relationship? (3) Where is the decision made? (4) How does the model become reviewable code? (5) How do we prove it works and leave nothing behind?
5. **The answers.** Q1: agents are their own principals (`user` and `agent` types). Q2: ReBAC tuples (user, relation, object) with computed relations `can_view` and `can_deploy`. Q3: the OpenFGA server and one Check call. Q4: Pulumi IaC with three dynamic resources (store, model, tuples) plus a Docker container, applied with `pulumi up`. Q5 is answered by the demo.
6. **The proof.** The demo checks `agent:deploy-bot can_deploy stack:production` (false), adds one deployer tuple with `pulumi up`, checks again (true), checks `user:alice` (true throughout), then runs `pulumi destroy` and verifies nothing is left. It answers Q5 last.

Notes: speakers are unknown, so `frame.json` holds one placeholder speaker. Keycloak is not built; mention it only under "Beyond this workshop" if at all.

## Headlines

### Opening frame [generated]

1. Fine-grained authorization as code: OpenFGA relationship-based access control with Pulumi — [frame] — ~1min
2. Speaker (placeholder) — [frame] — ~1min
3. Housekeeping and Agenda — [frame] — ~0.5min
4. Housekeeping — [frame] — ~1min
5. Today's Agenda — [frame] — ~1min

### Act 1: the pain

6. A single prompt injection met an agent with every capability already switched on — pattern: quote-card — ~2min
7. Can this AI agent deploy to production? — pattern: big-statement — ~1min
8. The agent is exactly who it claims to be. — pattern: big-statement — ~0.5min
9. Nothing asks whether this action should run. — pattern: big-statement — ~0.5min
10. A role says who you are; an agent needs a rule for each thing it touches — pattern: compare — ~2.5min
11. Before you let an agent deploy, five questions need an answer — pattern: card-grid — ~2.5min

### Act 2: the tech

12. Who is acting: a person or an agent? — pattern: section-opener — ~0.5min
13. An agent is its own principal with narrower rights than its owner — pattern: compare — ~3.5min
14. RBAC cannot say 'this agent may view production but not deploy to it' — pattern: big-statement — ~1.5min
15. What may it touch, and through which relationship? — pattern: section-opener — ~0.5min
16. A tuple is three words: user, relation, object — pattern: chain — ~3.5min
17. Permissions are computed from relations, so a grant is one tuple — pattern: stack — ~3.5min
18. Two questions answered, three to go — pattern: recap-grid — ~1.5min
19. Where is the decision made? — pattern: section-opener — ~0.5min
20. OpenFGA decides, your application and agent only ask — pattern: zones — ~3.5min
21. Check is one HTTP call that returns allowed true or false — pattern: flow — ~3.5min
22. How does the model become reviewable code? — pattern: section-opener — ~0.5min
23. Store, model and tuples are three Pulumi resources, created in order — pattern: flow — ~3.5min
24. A change is a tuple diff, a new model version or a new store — pattern: options — ~3.5min
25. Four questions answered, one to go — pattern: recap-grid — ~1.5min
26. Where this breaks today: no native provider, in-memory data, immutable models — pattern: boundaries — ~3.5min

### The solution we will build

27. The whole stack runs on localhost for $0 — pattern: zones — ~3min
28. One Pulumi program holds the container, the store, the model and the tuples — pattern: stack — ~3min

### Demo divider [generated]

29. Demo: OpenFGA with Pulumi. — [frame] — ~0.5min

### Act 3: the demo

30. Eight steps take you from empty Docker to an agent that may deploy — pattern: demo-overview — ~2min
31. Step 1: One pulumi up starts OpenFGA with the playground open — pattern: demo-step — ~5min
32. Step 2: The store exists as a Pulumi resource — pattern: demo-checks — ~3min
33. Step 3: The model is code, written once and versioned — pattern: demo-checks — ~3min
34. Step 4: Two tuples give alice ownership and the agent view only — pattern: demo-checks — ~4min
35. Step 5: The agent is denied deploy — pattern: demo-step — ~3min
36. Step 6: One new tuple, and the agent may deploy — pattern: demo-outcome — ~5.5min
37. Step 7: Alice could deploy before and after the change — pattern: demo-checks — ~3min
38. Step 8: pulumi destroy leaves nothing behind — pattern: demo-step — ~4min

### Closing frame [generated]

39. Resources — [frame] — ~1min
40. Continue your Pulumi journey! — [frame] — ~1min
41. Thank you / Questions? — [frame] — ~1min

Total: 41 slides, 90 minutes.

## Workshop

- Slug: fine-grained-authorization-openfga
- Title: Fine-grained authorization as code: OpenFGA relationship-based access control with Pulumi
- Length: 90 minutes, 41 slides

## Original request

Build the slides for the workshop brief, from the demo flow in this folder.

## Structure

- Opening frame, slides 1 to 5: 4.5 min
- Act 1, the pain, slides 6 to 11: 9 min
- Act 2, the tech, slides 12 to 26: about 40 min
- The solution we build, slides 27 and 28: 6 min
- Demo divider, slide 29: 0.5 min
- Act 3, the demo, slides 30 to 38: 28.5 min
- Closing frame, slides 39 to 41: 3 min

## Sources

- https://openfga.dev/docs/concepts (read 2026-10-01)
- https://openfga.dev/docs/getting-started/perform-check (read 2026-10-01)
- https://openfga.dev/docs/getting-started/immutable-models (read 2026-10-01)
- https://openfga.dev/docs/modeling/roles-and-permissions (read 2026-10-01)
- https://www.pulumi.com/docs/iac/concepts/resources/dynamic-providers/ (read 2026-10-01)
- The demo code in this folder (01-stack, 02-checks, 03-teardown)

## Deviations

- Speakers are placeholders; the speaker is not named in the brief.
- Keycloak as a second identity source is not built; it is out of scope for the deck.

## Binding rules

- Every story and demo slide is built from a deck_frame.py pattern; pattern names are never layout values.
- No theme layouts except image, no Mermaid.
- Program code on one slide only (slide 28, at most 10 lines); one command per demo slide, copied from the demo.
- Icon list text sits in one span; no hard-coded colours.
- Pulumi names: Pulumi IaC, Pulumi ESC, Pulumi Cloud, Pulumi Neo.

## marketing-web skill

Read commit 9b37f9afe8c7b0d406f19bc9116b16d5689389ce on 2026-10-01.


## Fact-check

Read date: 2026-10-01. Humanizer pass applied first (3 note edits, no em or en dashes found).

| Claim | Source | Read date | Outcome |
|---|---|---|---|
| Arcade quote: 'No authorization layer distinguished a user-initiated action from an injection-initiated one.' | https://www.arcade.dev/blog/enterprise-managed-authorization-per-action-authorization-ai-agents/ | 2026-10-01 | confirmed |
| Arcade quote: 'The agent was who it claimed to be.' | same | 2026-10-01 | confirmed |
| Arcade post date 2026-06-23, author Manveer Chawla | same | 2026-10-01 | confirmed |
| Rehberger demonstrated one prompt injection planting persistent instructions in ChatGPT memory | https://embracethered.com/blog/posts/2025/spaiware-and-chatgpt-command-and-control-via-prompt-injection-zombai/ | 2026-10-01 | confirmed |
| ZombAI post dated January 2025; remote control of ChatGPT instances (C2) | same (Posted on Jan 6, 2025) | 2026-10-01 | confirmed |
| Tuple = user, relation, object | https://openfga.dev/docs/concepts | 2026-10-01 | confirmed |
| Check response has allowed true/false | https://openfga.dev/docs/getting-started/perform-check | 2026-10-01 | confirmed |
| Check is one POST to the store's check endpoint, body with tuple_key and authorization_model_id | 02-checks/check.sh | 2026-10-01 | confirmed |
| Models are immutable, cannot be deleted or modified, each write is a new version | https://openfga.dev/docs/getting-started/immutable-models | 2026-10-01 | confirmed |
| Memory datastore is the default, data lost on restart | https://openfga.dev/docs/getting-started/setup-openfga/configure-openfga | 2026-10-01 | confirmed |
| Playground on port 3000 | https://openfga.dev/docs/getting-started/setup-openfga/playground | 2026-10-01 | confirmed |
| Dynamic providers supported only in TypeScript and Python; lighter weight than custom providers | https://www.pulumi.com/docs/iac/concepts/resources/dynamic-providers/ | 2026-10-01 | confirmed |
| No native Pulumi provider for OpenFGA | pulumi.com/registry/packages/openfga returns 404 on 2026-10-01 | 2026-10-01 | confirmed (absence on registry; not provable beyond that) |
| Deleting the store removes the model (slide 'Where this breaks today', notes) | https://openfga.dev/docs/api/service/stores/delete-a-store says it does not delete tuples or models | 2026-10-01 | corrected |
| model.json has exactly types user, agent, stack; owner takes user only, viewer/deployer take user and agent; can_view/can_deploy computed | 01-stack/model.json | 2026-10-01 | confirmed |
| Image openfga/openfga:v1.21.0, container openfga-workshop, ports 8080 and 3000, store name pulumi-workshop, memory engine | 01-stack/__main__.py | 2026-10-01 | confirmed |
| Tuples: alice owner, deploy-bot viewer, commented deployer line; three dynamic resources; commands check.sh, grant-deployer.sh, verify-teardown.sh | 01-stack/tuples.py, 01-stack/openfga_dynamic.py, 02-checks, 03-teardown | 2026-10-01 | confirmed |
| Destroy removes resources in reverse order of creation | demo dependency graph in __main__.py; Pulumi docs page not opened | 2026-10-01 | unverified (kept; standard dependency behavior, not run) |
| Docker image pulled and container started by Pulumi Docker provider | requirements.txt pulumi-docker, __main__.py | 2026-10-01 | confirmed |
| Demo run results (allowed false/true, teardown) | not executed in this pass | 2026-10-01 | unverified |

Counts: 17 confirmed, 1 corrected, 0 removed, 2 unverified (of 20 rows) (reverse destroy order, demo run results). Correction: slide and note said deleting the store removes models; OpenFGA says delete-store does not delete tuples or models, so the text now says the container removal clears them.
