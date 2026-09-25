# AGENTS.md — the deck's brief and sources

See `../AGENTS.md` for the demo code's own brief and sources. This file covers the slide deck only.

## The workshop

"Defense in depth as code: Kyverno admission control and Pulumi Policies." 90 minutes, intermediate level, for platform/DevOps/security engineers already using Pulumi. Sessions and speakers are not yet booked; the deck ships with one placeholder speaker slide (photo, name, role, socials, bio all marked for replacement) since the actual count is unknown.

## The original request

In order of authority:

1. Workshop brief: "Workshop brief: Defense in depth as code — Kyverno admission control and Pulumi Policies", https://workprentice.ai/documents/afeeb0b5-3897-4640-bb4e-36a7f21b866a
2. The demo code on this branch (5 numbered folders under `../`) — the deck follows the demo where the two differ.
3. The `workshop-deck` and `slidev-deck` skills for shape and mechanics.
4. The reference workshop `pulumi/workshops/neo-in-a-docker-sandbox` on `main`, for style and quality bar only (not copied as a scaffold).

## Structure and minute budget (totals exactly 90)

| # | Slide | Layout | Minutes |
|---|---|---|---|
| 1 | Title | cover | 1 |
| 2 | Speaker (placeholder) | image-left | 1 |
| 3 | Housekeeping | default | 1 |
| 4 | Agenda | default | 2 |
| 5 | Prerequisites | default | 3 |
| 6 | Why one policy needs two layers | diagram-right | 8 |
| 7 | The scenario | statement | 3 |
| 8 | How admission control works | diagram-left | 9 |
| 9 | Demo divider | section | 1 |
| 10 | Install Kyverno (02-kyverno) | code | 8 |
| 11 | The ClusterPolicy (03-cluster-policy) | code | 8 |
| 12 | Admission denied (04-admission-denied) | code | 7 |
| 13 | The pipeline layer | diagram-left | 7 |
| 14 | The Pulumi Policy Pack (05-pipeline-policy) | code | 8 |
| 15 | Blocked before `pulumi up` (05-pipeline-policy) | code | 7 |
| 16 | What each layer catches | two-cols | 5 |
| 17 | What you can do now | default | 3 |
| 18 | Cleanup and takeaways | code | 4 |
| 19 | Follow-up (3 QR codes) | default | 2 |
| 20 | Thank you / Q&A | end | 2 |

Every content slide carries a speaker note with its own minute figure in an HTML comment; a small regex sum during the build check confirmed the total is 90.

## Deviations from the brief's §5 slide outline

The brief's §5 outline maps directly to slides 6-8 and 10-18 above, in order. Two slides are additions, not in §5:

- **Slide 5, Prerequisites.** Added because this is a hands-on workshop and participants follow along; the brief's §7 risks (Docker resource needs, webhook readiness) belong here as things to check before starting, not only in speaker notes.
- **Slide 17, "What you can do now."** A short recap tying back to the brief's §3 learning outcomes, placed right after the layer comparison and before cleanup.

Nothing from §5 was dropped or reordered.

## Sources (read 2026-09-25)

- AWS containers blog, Falco on EKS: https://aws.amazon.com/blogs/containers/implementing-runtime-security-in-amazon-eks-using-cncf-falco/
- KubeCon EU 2026, OPA Intro & Deep Dive (Apple): https://kccnceu2026.sched.com/event/2EF4m/open-policy-agent-opa-intro-deep-dive-charlie-egan-anders-eknert-apple
- Red Hat Developer, cert-manager mTLS/zero trust: https://developers.redhat.com/articles/2026/06/25/implement-mtls-and-zero-trust-cert-manager-and-trust-manager
- Unit 42 (Palo Alto Networks), SPIFFE/SPIRE identity misuse: https://unit42.paloaltonetworks.com/kubernetes-spiffe-spire-identity-spoofing/
- ArtifactHub, Kyverno Helm chart 3.9.1: https://artifacthub.io/packages/helm/kyverno/kyverno

## Scaffold decisions

Followed the theme's proven pins from the reference workshop rather than the newly published `@slidev/cli` 53.0.0: `@slidev/cli`/`client`/`types` `^0.50.0`, `@pulumi/slidev-theme` `^0.4.0`, plus `mermaid ^11.17.2` (the theme ships no runtime dependency on it) and `qrcode ^1.5.4` for the follow-up and closing QR codes. `components/QRCode.vue` was copied from the reference workshop's deck, as the theme package does not ship one. `public/img/speaker-placeholder.png` is a generated neutral placeholder image, not a stock photo.

## A layout quirk worth knowing

This theme's `two-cols` layout takes three **named** slots only — `::header::`, `::left::`, `::right::` — and has no default slot. Writing a two-cols slide the way vanilla Slidev expects (heading and left content directly after frontmatter, `::right::` before the right column) silently drops the left content; `npm run build` and `npm run export` both succeed with the bug present. Caught only by rendering the exported PDF and looking at every page. If you add another two-cols slide here, use the three named slots.

## The workshop repo QR code

The follow-up and closing slides point their repo QR at the branch tree URL (`.../tree/anvil/defense-in-depth-kyverno-pulumi-policies/defense-in-depth-kyverno-pulumi-policies`) since the folder does not exist on `main` yet. Repoint it at the `main` tree URL once this branch merges.

## Check before committing

- `npm run build` and `npm run export` both pass.
- Every command shown on a slide is a command the demo's README actually runs, with the same flags.
- Minute-note sum is exactly 90 (see the table above).
- `mermaid` and `qrcode` are both declared in `package.json`.
- Rendered PDF pages were looked at, not just built: cover, speaker, every diagram slide, the two-cols slide, both QR slides.
- No `node_modules`, `dist`, `*.pdf`, or `.slidev` state staged.
