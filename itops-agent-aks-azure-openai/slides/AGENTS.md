# AGENTS.md — the deck's brief and sources

This file records what the deck was asked to be and which sources it was
built from, so anyone (human or agent) editing `slides.md` works from the
same brief. Conventions for the whole workshop folder are in `../AGENTS.md`.

## The workshop

"AI Agents for IT Ops: Custom Agent on AKS with Azure OpenAI." Scheduled
delivery 2026-09-23, plus one undated second regional delivery of the same
title, 90 minutes each. Speakers not yet assigned for either session. Pulumi
owns the deck and the demo.

## The original request

The deck was drafted from these inputs, in this order of authority:

1. The workshop brief, whose learning outcomes and 14-slide outline are the
   spine of this deck:
   https://workprentice.ai/documents/906ca05e-04b4-4a30-876d-09640a805b31
2. The demo code in this folder (`01-empty-program/` through
   `06-teardown/`), the second source of truth for every command, resource
   name, config key, and version shown on a slide.

## Sources added during the fact check

Copied verbatim from the brief's section 8 sources table, all read
2026-09-22:

| Link | What it is | Date read |
| --- | --- | --- |
| Notion page 3a5fdbdf-1cce-8102-8856-effd38fff249 | Scheduled delivery, 2026-09-23 | 2026-09-22 |
| Notion page 3a5fdbdf-1cce-8158-8958-c4707b8a9951 | Undated second regional delivery, same title | 2026-09-22 |
| pulumi.com/docs/iac/download-install/ | Pulumi CLI version 3.263.0 | 2026-09-22 |
| GitHub Releases API, pulumi/pulumi-azure-native | Provider version v3.28.0 | 2026-09-22 |
| pulumi.com/registry/packages/azure-native/api-docs/containerservice/managedcluster/ | AKS resource type confirmed | 2026-09-22 |
| pulumi.com/registry/packages/azure-native/api-docs/cognitiveservices/account/ and /deployment/ | Azure OpenAI resource types confirmed | 2026-09-22 |
| pulumi.com/docs/esc/providers/azure-login/ | OIDC-based credential pattern for Azure | 2026-09-22 |
| azure.microsoft.com/en-us/pricing/details/kubernetes-service/ | AKS cost reference | 2026-09-22 |
| azure.microsoft.com/en-us/pricing/details/azure-openai/ | Azure OpenAI cost reference | 2026-09-22 |

## Rules that still bind

- Folder-wide conventions in `../AGENTS.md` govern this subfolder too:
  fact sources (pulumi.com/registry, learn.microsoft.com), pinned versions
  (Pulumi CLI 3.263.0, `pulumi-azure-native` 3.28.0, `pulumi-kubernetes`
  >=4.0.0,<5.0.0), per-folder resource conventions, and the commit
  convention (`docs(itops-agent-aks-azure-openai): …`).
- Naming precision: Pulumi Neo (or Neo), Pulumi ESC, Pulumi Cloud, Pulumi
  IaC, lowercase "pulumi console". Never "Copilot", "Pulumi Service",
  "Insights", or "CrossGuard" as a product name.
- Every command on a slide is one the demo actually runs, same flags. No
  invented flags, no commands the demo folders don't use.

## Changes after the brief (2026-09-23, Anvil)

1. Added a prerequisites slide (slide 2) because brief section 6 lists
   participant prerequisites for a follow-along session: an Azure
   subscription with Owner or Contributor rights and Azure OpenAI access,
   the Pulumi CLI, Python 3.11+, `az` CLI logged in, `kubectl`. The brief's
   14 slide entries in section 5 all follow afterward, in the same order.
2. Brief section 5's slide 13 entry says "the three learning outcomes,"
   but section 3 lists four. The recap slide (slide 14) covers all four:
   provisioning both resources from one program, authenticating without a
   static secret, deploying the agent and making a real call, and tearing
   down with verification.
3. Brief section 5 has no slide dedicated to demo step 1
   (`01-empty-program/`); it is folded into the "Pulumi program structure"
   slide (slide 5), since that is where that folder's content belongs.
4. Brief section 5 entries 8 and 9 both map to `05-agent-deployment/`:
   entry 8 (slide 9 here) is the `pulumi up` deployment; entry 9 (slide 10
   here) is the port-forward-plus-curl verification the same folder
   documents.
5. Brief section 5 entry 7 names "Pulumi ESC / OIDC" for credentials
   (slide 7). The demo actually implements native AKS workload identity: a
   `UserAssignedIdentity`, a `FederatedIdentityCredential`, and a
   `RoleAssignment`. Pulumi ESC stays a presenter fallback per brief section
   7 (a short-lived key shown once on screen if OIDC federation is fiddly
   live), not the primary mechanism. The slide shows what the demo does and
   names ESC as the documented fallback, not the mechanism.
6. The speaker-note-with-time-budget convention is taken from
   `getting-started-with-kubernetes-google-cloud/slides/slides.md` because
   `neo-in-a-docker-sandbox/slides/slides.md` (the deck named as this
   task's reference) carries zero speaker notes despite its own AGENTS.md
   requiring them.

## Check before committing

```bash
npm run build && npm run export          # both must pass
```

Read the exported PDF page by page for overflow, truncated code, and
orphan headlines.
