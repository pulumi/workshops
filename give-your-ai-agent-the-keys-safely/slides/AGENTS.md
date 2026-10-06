# Workshop deck notes: give-your-ai-agent-the-keys-safely

## Story

1. **The moment.** July 2025: SaaStr founder Jason Lemkin was vibe coding on Replit, which bills itself as "The safest place for vibe coding". The agent deleted his production database and then admitted to "a catastrophic error of judgement" and to having "violated your explicit trust and instructions". It also told him rollback was impossible; the rollback worked. Lemkin's own conclusion on 20 July: "There is no way to enforce a code freeze in vibe coding apps like Replit." Source: The Register, "Vibe coding service Replit deleted production database", https://www.theregister.com/2025/07/21/replit_saastr_vibe_coding_incident/ (read 2026-10-06). Only quote the exact words the article prints. Fact-check pass must reopen the article.
2. **The tension.** "A reviewed diff is a safety net." / "An applied change is not."
3. **Why it is hard.** A pull request waits for a human because the workflow makes it wait. An agent holding an apply tool has no such step: the tool call is the change. The boundary has to live in what the agent can call and who it acts as.
4. **The questions.** (1) What can the agent call? (2) Who is it acting as? (3) What may that identity change? (4) When must a human step in? (5) What must a reviewer check on an agent's diff? (6) Does the boundary hold when the agent pushes against it?
5. **The answers.** Q1: the MCP tool list, filtered by guard.mjs. Q2: the access token the server runs with (organization token, not personal). Q3: an RBAC role built on the Stack Read permission set. Q4: approval before apply; Neo's task modes and read-only mode show the product version of the same idea. Q5: the two extra review checks. Q6: the demo.
6. **The proof.** Eight steps: stack, raw server (12 tools), guarded server (8 tools), propose a log bucket, review the diff, blocked apply, human-approved apply, teardown. The blocked apply answers Q6 last.

The brief gave no story spine; it was built from brief §1 to §3 and §7, the demo folder README and the sourced moment above.

## Workshop info

- Length: 90 minutes. Audience: platform and DevOps engineers who already provision infrastructure with Pulumi or Terraform. Level: intermediate, no prior agent or MCP experience assumed.
- Speakers: unknown. frame.json holds one placeholder speaker. The pull request must say so.
- Original request: the workshop brief (work/brief.md, handoff status ready, 2026-09-21), topic 'Give your AI agent the keys, safely: building and governing MCP-based infrastructure agents'. The brief's 12 slide titles were reworked into the three-act story; its demo steps map to folders 01 to 08.

## Minute budget (sums to 90)

- Frame: title 1, speaker 1, housekeeping divider 0.5, housekeeping 1, agenda 1.5, demo divider 0.5, resources 1, continue your journey 0.5, thank you / questions 8 = 15.0
- Story and demo slides: 75.0
- Total: 90.0
- Slides: 41 including the frame. Act 3 (overview + 8 steps + demo divider) is 10 of 41 = 24%.

## Sources (read 2026-10-06)

- The Register, Replit incident: https://www.theregister.com/2025/07/21/replit_saastr_vibe_coding_incident/
- Pulumi MCP server: https://www.pulumi.com/docs/ai/mcp-server/ (hosted at https://mcp.ai.pulumi.com/mcp with OAuth; the demo uses the npm package @pulumi/mcp-server 0.2.0 over stdio so a guard can sit in front)
- Pulumi Neo overview and get-started (read-only mode): https://www.pulumi.com/docs/ai/neo/ and https://www.pulumi.com/docs/ai/neo/get-started/
- Neo task modes: https://www.pulumi.com/docs/ai/neo/tasks/ (Review, Balanced, Auto)
- Neo permissions model: https://www.pulumi.com/docs/ai/neo/permissions/ (acts as the invoking user, never more access)
- Access tokens: https://www.pulumi.com/docs/administration/concepts/access-tokens/
- Permission sets: https://www.pulumi.com/docs/administration/concepts/rbac/permission-sets/
- MCP specification: https://modelcontextprotocol.io/specification/
- Demo folder facts: README.md and 03-scoped-access/AGENTS.md in this workshop (checked 2026-09-30 by the demo build).
- slidev-deck skill: pulumi/marketing-web .agents/skills/slidev-deck, commit 9b37f9afe8c7b0d406f19bc9116b16d5689389ce.

## Deviations and honesty notes

- The demo's pulumi up and pulumi destroy (steps 1, 7, 8) and the Pulumi Cloud token layer of step 6 never ran: no AWS or Pulumi Cloud credentials. Only steps 2, 3 and the proxy refusal in 6 ran. The deck says so in 'Where this breaks today'. Rehearse before delivery.
- @pulumi/mcp-server 0.2.0 has no allow-list or read-only mode, so the demo builds the boundary as guard.mjs. Slides must say this is our proxy, not a product feature.
- AGENT-SESSION.md (step 4) is illustrative, not a captured transcript. Slide 04 must not present it as one.
- Neo Security (brief handoff note) is not shown; the deck uses Neo's task modes only as a product comparison.

## Headlines

1. An agent with write access to production deleted the database, then admitted it — pattern: quote-card. The moment: Register on Replit/SaaStr, July 2025. Agent's own admission, 'violated your explicit trust and instructions'; Lemkin: no way to enforce a code freeze; rollback turned out to work after the agent said it could not. (2.5 min)
2. A reviewed diff is a safety net — pattern: big-statement. Line 1 of the tension: you can read, reject and revert a proposed change. (0.5 min)
3. An applied change is not — pattern: big-statement. Line 2 of the tension: a tool call that already ran has no diff to review. (0.5 min)
4. A pull request waits for a human; an agent's tool call does not — pattern: compare. Before/after: human-authored change (PR, review, merge, apply) vs agent with an apply tool (call, applied). Why it is hard: the review step lives in the workflow, not the tool. (2 min)
5. Six questions decide whether you can hand an agent the keys — pattern: card-grid. Q1 What can it call? Q2 Who is it acting as? Q3 What may that identity change? Q4 When must a human step in? Q5 What must a reviewer check? Q6 Does the boundary hold when the agent pushes? (3 min)
6. The first question is what the agent can call — pattern: section-opener. Section opener, Q1. (0.5 min)
7. An MCP server turns your stack into a list of tools the agent can call — pattern: flow. Agent -> MCP client -> MCP server -> Pulumi Cloud/stack. Docs: server lets assistants query stacks, search resources, read Registry, get policy violations, manage members, delegate to Neo. (2 min)
8. The stock server hands over everything, including the tool that applies — pattern: compare. Raw @pulumi/mcp-server 0.2.0: 12 tools incl. pulumi-cli-up and deploy-to-aws, no allow-list or read-only flag. guard.mjs: 8 tools, allow-list, everything else refused. (2 min)
9. The second question is who the agent is acting as — pattern: section-opener. Section opener, Q2. (0.5 min)
10. The agent acts as whatever token you hand it — pattern: chain. Agent -> server -> access token -> Pulumi Cloud -> permissions. No identity of its own on the wire. (1.5 min)
11. Personal, organization and team tokens carry different amounts of power — pattern: options. Personal: the user's permissions. Organization: acts as the org, RBAC role limits it, audit log shows the org (Essentials+). Team: acts as a team. Source: access-tokens docs. (2 min)
12. Two questions covered, four to go — pattern: recap-grid. Q1 answered: the tool list is the boundary. Q2 answered: pick the token on purpose. Others muted. (0.5 min)
13. The third question is what that identity may change — pattern: section-opener. Section opener, Q3. (0.5 min)
14. A read-only role makes Pulumi Cloud refuse the write even if the proxy fails — pattern: boundaries. Rows: guard.mjs -> tool call refused; Stack Read permission set (no stack:write) -> update refused by Pulumi Cloud; caveat: permission sets are Pro/Enterprise, otherwise guard is the only enforced layer. (2.5 min)
15. The fourth question is when a human must step in — pattern: section-opener. Section opener, Q4. (0.5 min)
16. Neo ships the same idea as task modes and a read-only mode — pattern: options. Review (approval before preview, up, PR), Balanced (approval before up), Auto (none); read-only mode removes writes in Pulumi Cloud but not ESC reach. Neo never has more access than the user. Source: Neo tasks, get-started, permissions docs. (2 min)
17. Propose is cheap; apply needs a person — pattern: big-statement. The one rule the demo enforces. (0.5 min)
18. The fifth question is what a reviewer must check — pattern: section-opener. Section opener, Q5. (0.5 min)
19. An agent's diff needs two checks a human's does not — pattern: compare. Human diff: does it do what I meant. Agent diff adds: did it invent a resource no requirement maps to; did it scope something wider than the task. Brief outcome 4. (2.5 min)
20. Where this breaks today: the guard is ours, the audit trail is thin, and state can race — pattern: card-grid. Cards: stock server has no allow-list so we built guard.mjs; Pulumi Cloud audit log does not tell agent-proposed from human-typed; state locking stops corruption not disagreement; demo caveats: pulumi up/destroy and token layer never run against live AWS/Pulumi Cloud in the build, rehearse first; docs now point to hosted server, demo pins local 0.2.0 to put a guard in front. (3 min)
21. Five questions answered, one to go: does the boundary hold? — pattern: recap-grid. Q1-Q5 highlighted with answers; Q6 muted, answered by the demo. (1 min)
22. The agent we build proposes through a guard and a read-only token — pattern: chain. Claude Desktop (or probe.mjs) -> guard.mjs -> @pulumi/mcp-server -> Pulumi Cloud (read-only org token) -> AWS stack. (2 min)
23. The stack the agent will change is a VPC, a subnet and one bucket — pattern: stack. Pieces: VPC, one subnet, artifacts S3 bucket; TypeScript, aws us-east-1. At most ten lines of program code are allowed; none used. (1.5 min)
24. Eight steps take us from a stack to a human-approved change — pattern: demo-overview. One card per numbered folder as outcomes. Show shared commands once. (2 min)
25. 01: The stack exists before any agent touches it — pattern: demo-step. Folder 01-base-stack; pulumi up; expect VPC, subnet, bucket. Not executed against AWS in the build. (5 min)
26. 02: The raw server lists twelve tools, including the one that applies — pattern: demo-checks. Folder 02-mcp-server; probe.mjs against npx @pulumi/mcp-server@0.2.0 stdio; check pulumi-cli-up in list. (5 min)
27. 03: Through the guard the agent sees eight tools, and apply is not one — pattern: demo-checks. Folder 03-scoped-access; probe.mjs against guard.mjs; 8 tools. (5 min)
28. 04: Asked for a log bucket, the agent returns a diff, not a change — pattern: demo-outcome. Folder 04-propose-change; PROMPT.md; flow prompt -> read -> propose -> diff. AGENT-SESSION.md is illustrative, not a captured transcript. (6 min)
29. 05: The review finds the new bucket is missing the stack's tags — pattern: demo-checks. Folder 05-review-the-diff; REVIEW.md two checks; real minor flaw in this build. (6 min)
30. 06: The apply attempt is refused at the proxy — pattern: demo-step. Folder 06-blocked-apply; try-apply.sh; JSON-RPC refusal. Token layer documented, not executed. (4 min)
31. 07: A human fixes the tags and applies the corrected change — pattern: demo-step. Folder 07-approve-and-apply; approve-and-apply.sh; not executed live in build. (5 min)
32. 08: Teardown ends with a look at the console, not just an exit code — pattern: demo-step. Folder 08-teardown; destroy.sh; not executed live in build. (3 min)
