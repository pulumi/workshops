# AGENTS.md — the deck's brief and sources

This file records what the deck was asked to be and which sources it was
built from, so anyone (human or agent) editing `slides.md` works from the
same brief. Conventions for the whole workshop folder are in `../AGENTS.md`.

## The workshop

"Supply Chain Signing as Code: Notation Image Signing, Admission Enforcement
and Kubescape Posture Scanning with Pulumi". Sessions and dates: unknown.
Speakers: unknown (placeholder slides). 90 minutes. Audience: platform and
security engineers, intermediate level (Kubernetes and registry familiarity
assumed, no prior Pulumi experience required).

## The original request

The deck was drafted from these inputs, in order of authority:

1. [Workshop brief](https://workprentice.ai/documents/0a1f7c46-3c0f-4d94-b8aa-ac088ef6ea87),
   whose promised learning outcomes (§3) are the spine of the recap slide and
   whose demo plan (§4/§5) is the spine of the demo section.
2. The reference workshop, `neo-in-a-docker-sandbox/`, the style source of
   truth for folder layout, `package.json` scripts, the `QRCode.vue`
   component, and the deck's layouts and closing-slide patterns
   (`journey-card`, `thanks__*`).
3. The demo code in this folder (`00-signing-key/` through `08-teardown/`,
   built in an earlier commit on this branch, `33b39e3`), which is the source
   of every command and version pin shown on a slide.
4. `pulumi.com/docs` pages, read live during this run rather than from
   training memory, for anything specific to Pulumi products.

Structure asked for (§5, 15 entries, 90 minutes): title, speaker intro,
housekeeping, agenda, hook, pain, three solution slides (Notation, Kyverno,
Kubescape), architecture, live demo (two entries covering ten brief steps),
recap, Q&A. The workshop-deck skill's fixed frame (prerequisites, follow-up,
end slide) was added around it; see Deviations below for how the demo section
was expanded and why nothing in §5 was dropped or reordered.

## Sources (read during this run, 2026-09-27, unless noted)

From the brief's §8, read by Radar on 2026-09-26:

- Safeguard, "AWS ECR Signing Policies with Notation" (published 2026-02-05)
  https://safeguard.sh/resources/blog/aws-ecr-signing-policies-notation
- K8s Security Pro, "Kubernetes Security Tools Comparison" (published
  2026-02-09) https://k8s-security.pro/blog/kubernetes-security-tools-comparison/
- Jit.io, "Kubernetes Security Posture Management: 7 Essentials to Know"
  (published 2026-01-01)
  https://www.jit.io/resources/cloud-sec-tools/kubernetes-security-posture-management-7-essentials-to-know
- ProgressiveRobot, "FreeBSD 15 py310-tuf Vulnerability Patch Remediation"
  (published 2026-02-20), the hook slide's source
  https://www.progressiverobot.com/2026/02/20/freebsd-15-py310-tuf-vulnerability-patch-remediation/
- KubeCon NA 2026 schedule
  https://events.linuxfoundation.org/kubecon-cloudnativecon-north-america/program/schedule/
- GitHub Universe 2026 catalog
  https://reg.githubuniverse.com/flow/github/universe26/attendee-portal/page/sessioncatalog
- Open Source Summit NA/EU 2026 programs (Wayback only, no live URL at read
  time)

Read this run, building demo code (recorded in the demo commit) and reused
here for version accuracy:

- `notation` CLI releases, current stable 1.3.2 at build time
- `kubescape` CLI releases, current stable line is 4.x (4.0.14), not the 3.0.0
  the brief's §4 named
- Kyverno Helm chart releases, current stable 3.9.1, not the brief's 3.3.0

## Deviations from §5's literal slide count

§5 gives the live demo two entries (steps 1-5, steps 6-9) plus a step-10
teardown entry, which is more content than three slides can hold without
crowding code and narration onto the same slide. The deck instead uses:

- one `section` divider ("Live demo")
- one `layout: code` slide per numbered demo folder, 00 through 08 (nine
  slides), in the folder's numeric order, which is also §5's order
- §5's three-entry grouping is preserved as speaker-note framing (00-04 under
  "steps 1-5", 05-07 under "steps 6-9", 08 alone as step 10) even though each
  folder now has its own slide

No §5 entry was dropped, merged, or reordered; the demo section was widened,
not changed in content or order.

Added beyond §5, per the workshop-deck skill's fixed frame: a prerequisites
slide (from the brief's §6, so attendees can follow along), a follow-up slide
with QR codes before Q&A, and a closing `end` slide. Speaker slides use the
skill's placeholder pattern (`speaker-placeholder.png`, `<!-- TODO(presenter)
-->`) since the brief's §1 gives no speaker names.

## Version pins: slides follow the demo code, not the brief

The brief's §4 pinned notation v1.3.0, kubescape v3.0.0, and Kyverno chart
3.3.0. The demo code (`lib.sh`) pins what was actually current when it was
built: notation 1.3.2, kubescape 4.0.14, Kyverno chart 3.9.1 (kubescape's
3.0.0 line does not exist as a release; the tool is on a 4.x line). The
prerequisites slide and every version mentioned in speaker notes carry the
demo code's pins, not the brief's, and the deviation is called out in the
pull request.

## Rules that still bind

- Facts come from `pulumi.com/docs` and the sources above, read live, never
  from memory. An unclear point becomes an open question in the pull request,
  not a guess.
- Every command shown on a slide is one a numbered demo folder's script
  actually runs, with the same flags.
- One idea per slide, named layouts only (`cover`, `section`, `statement`,
  `two-cols`, `code`, `diagram`/`diagram-left`/`diagram-right`, `quote`,
  `end`), six lines maximum on a content slide.
- Speaker notes are spoken, not written; each carries a `Time budget: N min`
  comment, and the budgets sum to 90 (verified: 24 slides, sum = 90.0).
- No em dashes or en dashes anywhere in `slides.md`, checked after every edit.
- `mermaid` and `qrcode` are both real `package.json` dependencies; `Mermaid`
  diagrams carry no theme overrides, only a `{scale: N}` tuned by rendering
  and looking.
- Speaker slides stay placeholders until real names, roles, and photos are
  supplied; do not invent them.

## Check before committing

```bash
npm run build && npm run export
```

Both must pass. After exporting, render the PDF to PNGs (`pdftoppm -png`) and
look at every slide for clipping, diagram overflow, and QR code legibility,
rather than trusting a passing export alone.
