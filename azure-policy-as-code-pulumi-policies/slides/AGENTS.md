## Story

1. **The moment.** Microsoft's threat analysis of Azure Blob Storage, published 2025-10-20 on the Microsoft Security blog: "Threat actors enumerate Blob Storage to identify publicly exposed data and credentials that they can leverage later in the attack chain." Quoted verbatim, read 2026-10-15.
2. **The tension.** "Your Pulumi stack can be clean." / "Azure takes requests from every other caller too."
3. **Why it is hard.** A rule on a wiki does not stop a request. Policy as code lives in the repo, is inherited from a management group, and is enforced at the request or at preview.
4. **The questions.** Where does a rule live so every subscription inherits it? What does Azure do when a request breaks the rule? How do we manage the baseline as code? What about resources that already exist, and exceptions? What stops it before Azure is called? Which layer owns what?
5. **The answers.** Management group inheritance; effects audit, deny, modify; definition, initiative, assignment and one component in Pulumi IaC; remediation task and waiver exemption; Pulumi Policies at preview with mandatory enforcement; then the demo and discussion for the layering rule.
6. **The proof.** Steps 1 to 8 build the baseline and end with a policy pack that stops the same setting at preview. The last question (which layer owns what) is answered by the closing discussion: Pulumi Policies in CI, Azure Policy as the backstop.

## Workshop

Azure Policy as code with Pulumi: management groups, initiatives, assignments and preventive Pulumi Policies.

## Original request, in order of authority

1. The brief: https://workprentice.ai/documents/6ab8faf4-9a49-42d6-adac-b380dc9b3920 (the contract).
2. The slides assignment: build the Slidev deck from the demo flow, following the workshop-deck skill and the reference deck `neo-in-a-docker-sandbox/slides`.
3. The pipeline README and build notes.

## Structure and minute budget

44 slides, 75 minutes of speaker-note budget in total. Frame 9 slides (12.5 min incl. closing discussion), Act 1: 5 slides, Act 2: 17 slides, solution: 3 slides, Act 3: 10 slides plus the generated divider. Program code on slides: none. Commands on slides: 17 lines in total.

## Sources (read 2026-10-15)

- Microsoft Security blog, 2025-10-20, threat analysis of Azure Blob Storage (the moment).
- Microsoft Learn: management groups overview, policy effect basics, remediation structure, exemption structure.
- Pulumi docs: policy as code concepts, write a policy pack, enforcement levels.
- Pulumi registry: azure-native installation and configuration.

## Brief section 5 deviations

- The brief's 75 minutes cover the numbered steps. The deck budgets 75 minutes in total including story, frame and discussion, so the live step times are shorter than the brief's. Presenter should pre-deploy steps 2 to 5 if time is tight.
- Step 9 (discussion) has no slide of its own. It lives in the closing Questions slide notes and the layering-rule slide.
- Demo steps 7 and 8 and teardown were never run against a live Azure tenant. The notes say so.

## Rules

Frame slides come from `deck_frame.py`; never edit them by hand. Story and demo slides are copied from `deck_frame.py patterns`. No Mermaid, no theme layouts except `image`, no hard-coded colours.

## marketing-web slidev-deck skill

Commit read: 9b37f9afe8c7b0d406f19bc9116b16d5689389ce

## Headlines

10. Attackers go looking for public storage — pattern: quote-card
11. Your Pulumi stack can be clean. — pattern: big-statement
12. Azure takes requests from every other caller too. — pattern: big-statement
13. A rule on a wiki doesn't stop a request — pattern: compare
14. Six questions before you trust a baseline — pattern: card-grid
15. Where does a rule live so every subscription inherits it? — pattern: section-opener
16. Assign once at a management group, subscriptions inherit — pattern: zones
17. What does Azure do when a request breaks the rule? — pattern: section-opener
18. The effect decides what Azure does — pattern: options
19. Two questions covered, four to go — pattern: recap-grid
20. How do we manage the baseline as code? — pattern: section-opener
21. Definition, initiative, assignment: one chain, one component — pattern: flow
22. What about resources that already exist, and exceptions? — pattern: section-opener
23. Audit finds it, a waiver excuses it, remediation fixes the tag — pattern: flow
24. Four questions covered, two to go — pattern: recap-grid
25. What stops it before Azure is even called? — pattern: section-opener
26. Pulumi Policies has four enforcement levels — pattern: options
27. A violation stops the preview, and Azure is never called — pattern: flow
28. Deny acts late. — pattern: big-statement
29. Preview acts early. — pattern: big-statement
30. Where this breaks today: each layer has a blind spot — pattern: compare
31. Five questions covered, one to go — pattern: recap-grid
32. Two layers guard the same setting — pattern: zones
33. We build the baseline in four steps, then the pack — pattern: flow
34. Now we build it. — pattern: big-statement

Demo (after the generated divider):

36. What we are going to do — pattern: demo-overview
37. 1 · Setup: the stack and the Azure provider are ready — pattern: demo-step
38. 2 · A management group now holds the subscription — pattern: demo-step
39. 3 · One custom definition rejects public blob access — pattern: demo-step
40. 4 · The initiative adds a tag rule to the group — pattern: demo-step
41. 5 · The assignment turns the baseline on — pattern: demo-step
42. 6 · The same chain is now one component — pattern: demo-checks
43. 7a · Audit flags it, a waiver excuses it, remediation fixes the tag — pattern: demo-outcome
44. 7b · Deny rejects the second account in Azure — pattern: demo-outcome
45. 8 · The policy pack blocks it before anything is sent — pattern: demo-checks

## Fact-check

| # | Claim | Source | Date read | Outcome |
|---|---|---|---|---|
| 1 | Microsoft blog quote: 'Threat actors enumerate Blob Storage to identify publicly exposed data and credentials that they can leverage later in the attack chain.' (words identical; 'enumerate' is a hyperlink in the source) | https://www.microsoft.com/en-us/security/blog/2025/10/20/inside-the-attack-chain-threat-activity-targeting-azure-blob-storage/ | 2026-10-15 | Confirmed |
| 2 | Blog published 20 October 2025, Microsoft Security blog; it is a threat analysis of Blob Storage | same | 2026-10-15 | Confirmed |
| 3 | Governance conditions applied to a management group cascade by inheritance to all associated subscriptions | https://learn.microsoft.com/en-us/azure/governance/management-groups/overview | 2026-10-15 | Confirmed |
| 4 | Creating and managing groups needs permissions (write on group and subscription) | https://learn.microsoft.com/en-us/azure/governance/management-groups/overview | 2026-10-15 | Confirmed |
| 5 | 'The group must be empty to delete' (speaker note) | https://learn.microsoft.com/en-us/azure/governance/management-groups/overview and /manage | 2026-10-15 | Not found: removed from the note |
| 6 | audit flags a resource as non-compliant; deny rejects; modify alters the request (adds a tag) | https://learn.microsoft.com/en-us/azure/governance/policy/concepts/effect-basics (+ effect-modify) | 2026-10-15 | Confirmed |
| 7 | Azure processes several effects before handing the request to the resource provider; deny is evaluated before audit to avoid double logging | https://learn.microsoft.com/en-us/azure/governance/policy/concepts/effect-basics#order-of-evaluation | 2026-10-15 | Confirmed |
| 8 | deployIfNotExists and disabled also exist | https://learn.microsoft.com/en-us/azure/governance/policy/concepts/effect-basics | 2026-10-15 | Confirmed |
| 9 | Remediation applies modify (or deployIfNotExists) to existing resources, using the assignment's managed identity | https://learn.microsoft.com/en-us/azure/governance/policy/how-to/remediate-resources | 2026-10-15 | Confirmed |
| 10 | The identity needs the minimum role to remediate (demo: Tag Contributor, id 4a9ae827-...) | https://learn.microsoft.com/en-us/azure/governance/policy/how-to/remediate-resources; https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/management-and-governance | 2026-10-15 | Confirmed |
| 11 | 'Role assignments need time to propagate' (demo step 5 bullet and two notes) | https://learn.microsoft.com/en-us/azure/governance/policy/how-to/remediate-resources | 2026-10-15 | Not found: reworded to 'the role must exist before remediation' |
| 12 | Exemption categories Waiver (non-compliance temporarily accepted) and Mitigated (intent met another way); expiry supported | https://learn.microsoft.com/en-us/azure/governance/policy/concepts/exemption-structure | 2026-10-15 | Confirmed |
| 13 | Compliance results can take minutes (about five minutes after a new assignment; evaluation cycle every 24 hours) | https://learn.microsoft.com/en-us/azure/governance/policy/how-to/get-compliance-data | 2026-10-15 | Confirmed |
| 14 | Pulumi Policies enforcement levels: advisory warns, mandatory blocks, remediate fixes automatically, disabled turns off | https://www.pulumi.com/docs/insights/policy/policy-packs/ | 2026-10-15 | Confirmed |
| 15 | Policies are checked against the resources a program declares during pulumi preview and up, before anything changes in the cloud provider | https://www.pulumi.com/docs/discovery-governance/concepts/policy-as-code/ | 2026-10-15 | Confirmed |
| 16 | A mandatory violation stops the deployment | https://www.pulumi.com/docs/discovery-governance/concepts/policy-as-code/ | 2026-10-15 | Confirmed |
| 17 | 'Rules are written in TypeScript or Python' | https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/ | 2026-10-15 | Partially supported: OPA (Rego) also exists; slide note corrected |
| 18 | 'Covers Pulumi stacks only' (Pulumi Policies) | https://www.pulumi.com/docs/discovery-governance/concepts/policy-as-code/ | 2026-10-15 | Contradicted: also Terraform/OpenTofu with Pulumi Cloud remote execution; reworded to 'Checks the stacks that run the pack' |
| 19 | Pack is tested locally with pulumi preview --policy-pack <dir> | https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/ | 2026-10-15 | Confirmed |
| 20 | validateResourceOfType pattern shown in docs (with a provider resource class) | https://www.pulumi.com/docs/discovery-governance/guides/write-a-policy-pack/ | 2026-10-15 | Confirmed; azure-native class use is flagged as unrun in the note |
| 21 | Resources slide URLs open: policy-as-code concept, write-a-policy-pack, effect-basics, azure-native installation-configuration | fetched each | 2026-10-15 | Confirmed (all returned content) |
| 22 | Demo commands on slides (pulumi up, trigger-scan, config set effect Deny, deploySecondAccount, npm test, preview --policy-pack) match the demo README | ../README.md | 2026-10-15 | Confirmed (internal consistency) |
| 23 | 75 minutes total | brief | 2026-10-15 | Confirmed (brief) |

Total claims checked: 23. Confirmed: 19; changed or removed: 4.

Changes made:
- Removed the unconfirmed 'group must be empty to delete' from the slide 12 note.
- Replaced 'wait for the role to propagate' (demo step 5 bullet, two notes) with the confirmed point that the role must exist before remediation.
- Slide 26: 'Covers Pulumi stacks only' became 'Checks the stacks that run the pack'.
- Slide 22 note: languages now TypeScript, Python or OPA (Rego).
- Fixed four demo slides whose command block rendered as a Python tuple.
- Humanizer: removed windup phrases ('One detail worth saying', 'One honest caveat', 'A real limit stated plainly').

Not verified by a source: the demo's Azure behavior itself (never deployed to a live tenant); the slide 5 step-1 command omits the azure-native:location line of the README on purpose (three-line budget).

