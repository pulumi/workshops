# AGENTS.md — the deck's brief and sources

This file exists for whoever edits this deck next. It records where the
content came from and what was decided along the way. It does not replace
`../AGENTS.md`, which is the demo folder's own build record; read that one
first for the cluster mechanics this deck narrates.

## The workshop

Title: "GPU-aware batch scheduling for AI training on Kubernetes with
Pulumi." Length: 90 minutes. Audience: intermediate to advanced platform
engineers supporting ML/AI training teams. No session dates or event have
been assigned yet, so there is no scheduled slot to write toward. Speaker:
unknown. The deck ships one speaker placeholder slide and one placeholder
QR on the closing slide, both carrying `TODO(presenter)` comments.

## The original request

In order of authority: the workshop brief (workspace document, id
`8adfafa3-3b73-4b3a-9941-55aa6061cb19`), the backlog row
`cncf-batch-scheduling-ai-training`, the six demo folders already committed
in `gpu-aware-batch-scheduling-volcano/`, the `slidev-deck` and
`workshop-deck` skills, and `pulumi/workshops/neo-in-a-docker-sandbox` as
the reference implementation for theme usage and deck shape.

Per-section minute budget (sums to 90, computed from the notes at build
time):

| Slide | Minutes |
| --- | --- |
| Cover | 1 |
| Speaker | 1 |
| Housekeeping | 1 |
| Agenda | 1 |
| Prerequisites | 2 |
| The problem: default scheduler for AI training | 5 |
| Gang scheduling and fair-share, defined | 6 |
| Volcano: CNCF status and evidence | 4 |
| Why Pulumi, not `kubectl apply` | 5 |
| Live demo divider | 1 |
| 1: cluster + scheduler | 8 |
| 2: two team queues | 5 |
| 3: gang scheduling, all or nothing | 9 |
| 4: fair-share, one job per team | 8 |
| DRA and fractional GPU sharing | 6 |
| 5: one GPU, two jobs | 8 |
| Where this breaks in production | 5 |
| Volcano vs. Armada vs. Kueue | 4 |
| Teardown | 4 |
| Recap | 3 |
| Keep going (follow-up) | 2 |
| Questions | 1 |
| **Total** | **90** |

## Sources

Every source below was read fresh on 2026-09-27 for this build, not recalled
from training data:

- Workshop brief, document id `8adfafa3-3b73-4b3a-9941-55aa6061cb19`.
- Volcano introduction and CNCF Incubating status (Incubating since 2022):
  https://volcano.sh/en/docs/Home/Introduction
- Volcano Queue and VolcanoJob CRDs:
  https://volcano.sh/en/docs/Concepts/Queue,
  https://volcano.sh/en/docs/Concepts/VolcanoJob
- Volcano releases, v1.15.2 current (v1.15.0/v1.15.1 carry a disclosed
  DRA-capacity-accounting DoS, GHSA-j38h-7pfq-cxmw):
  https://github.com/volcano-sh/volcano/releases
- Kubernetes Dynamic Resource Allocation:
  https://kubernetes.io/docs/concepts/scheduling-eviction/dynamic-resource-allocation/
- Kubernetes v1.37 "Garhwal" (2026-08-26) and its DRA updates, per the
  brief's §2 evidence.
- Independent article, 2026-04-08, "GPU Costs Are Killing AI Budgets -
  Volcano's Unified Scheduling Cuts Waste," per the brief's §2.
- Independent academic paper, 2026-08, on multi-tenant Kubernetes for AI,
  citing Armada's gang-scheduling, per the brief's §2.
- KubeCon NA 2026 program entries the brief cites: "Volcano for the Agentic
  AI Era: Unified Scheduling Across Training, Inference, and Agents" and
  "Why Are You Still Wasting Whole GPUs? Hardware-Level Sharing, Scheduled
  with DRA."
- Kueue release cadence (v0.19.6, landed 2026-09-24), consulted only for the
  Volcano-vs-alternatives slide.
- `README.md` and each demo folder's `index.ts` in this workshop, re-read at
  slide-build time for every command, flag, context name and resource name
  shown on a slide.

## Decisions and open questions

- **Volcano over Armada or Kueue**: stated on its own slide as a judgment
  call, not a settled community consensus. Volcano's more mature CNCF status
  (Incubating vs. Armada's Sandbox stage) and its dedicated KubeCon NA 2026
  session were the deciding factors; Kueue solves a similar fair-share
  problem without a custom scheduler and would be a reasonable alternative
  pick.
- **The GPU portion (step 5)**: this build environment has no AWS
  credentials and no GPU instance quota, so step 5 was verified by
  `npx tsc --noEmit` and code review only, never run live. The deck's
  speaker notes on the DRA and demo-5 slides carry the brief's §7 guidance
  verbatim: if GPU quota was not approved ahead of the session, play a
  recording of the segment and say so to the room rather than silently
  dropping learning outcome 5.
- **Speaker count**: unknown. The deck ships exactly one speaker placeholder
  slide; if more than one speaker presents, add a slide per speaker before
  the session using the same layout.

## Deviations from the brief's §5 outline

None. All fifteen §5 entries became one slide each, in the brief's order,
and all six demo folders (`01-cluster` through `06-teardown`) mapped 1:1
onto six demo slides with no substitution.

## Verification actually run

- `npm run build`: passed.
- `npm run export` (with `--wait-until networkidle --wait 1500
  --timeout 60000`): passed, producing a 22-page, ~580 KB PDF.
- The exported PDF was rendered to one PNG per slide and every slide was
  read at full size: both Mermaid diagrams (Why Pulumi, DRA fractional
  sharing), both QR-code slides (follow-up, Q&A), every code slide's
  commands against the matching demo folder, and the six-line guideline on
  every content slide.
- Two issues found this way and fixed before commit: the "Why Pulumi"
  diagram clipped its sixth node at `{scale: 1}` in the `diagram-right`
  right-hand column and was rescaled to `0.55`; the recap `statement` slide
  overflowed its frame and was shortened.
- `grep` for em dash and en dash across `slides.md`: zero matches, run after
  the visual pass.
