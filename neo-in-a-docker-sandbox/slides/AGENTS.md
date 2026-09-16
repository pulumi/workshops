# AGENTS.md — the deck's brief and sources

This file records what the deck was asked to be and which sources it was
built from, so anyone (human or agent) editing `slides.md` works from the
same brief. Conventions for the whole workshop folder are in `../AGENTS.md`.

## The workshop

"Neo in a Docker Sandbox: Using Pulumi's Coding Agent for All Things Infra
Safely and Securely". Americas session September 16, 2026, EMEA rerun
October 14, 2026, 60 minutes. Speakers: Adam Gordon Bell (Pulumi), Engin Diri
(Pulumi), Mike Coleman (Docker). Pulumi owns the deck and the demo; Mike
covers the Docker Sandboxes part.

## The original request

The deck was drafted from these inputs, in this order of authority:

1. The workshop page, whose promised learning outcomes are the spine of the
   deck: https://www.pulumi.com/events/neo-in-a-docker-sandbox/
2. The reference workshop, the style source of truth for folder layout and
   slides (Slidev with `@pulumi/slidev-theme`, its separator and content slide
   patterns, `style.css`):
   https://github.com/pulumi/workshops/tree/main/getting-started-with-kubernetes-google-cloud
3. Neo CLI docs: https://www.pulumi.com/docs/ai/neo/pulumi-cli/ and the
   launch post https://www.pulumi.com/blog/pulumi-neo-cli/ (`pulumi neo`,
   approval modes manual/balanced/auto, permission modes default/read-only,
   Plan Mode, AGENTS.md support, handoff from other agents)
4. Docker Sandboxes: https://docs.docker.com/ai/sandboxes/ and the shell agent
   page https://docs.docker.com/ai/sandboxes/agents/shell/ (`sbx run shell`,
   `sbx secret set`, custom agents via kits)
5. Engin's kit: https://github.com/dirien/infrastructure-sandbox-kit (README,
   `kit/spec.yaml`, `sandbox-kit/spec.yaml`, `template/Dockerfile`, `docs/`);
   it defines a custom agent, injects the Pulumi token through the credential
   proxy, and ships the Pulumi MCP server and guardrail hooks

Structure asked for (60 minutes): intro and why this matters (5), what
changes when the agent's target is infra (5), Neo in the CLI (10), the
infrastructure sandbox kit (10), a clearly marked 10-minute Docker Sandboxes
slot for Mike with a title slide and placeholders (microVM isolation, kits,
secret injection), the demo (15) with a section slide plus one slide per demo
step, Pulumi ESC and short-lived credentials (3), wrap-up with resources and
Q&A (2). Speaker notes on every content slide.

## Sources added during the fact check

- Neo docs index https://www.pulumi.com/docs/ai/neo/, permissions model
  https://www.pulumi.com/docs/ai/neo/permissions/, tasks
  https://www.pulumi.com/docs/ai/neo/tasks/, editors
  https://www.pulumi.com/docs/ai/neo/editors/, agent skills
  https://www.pulumi.com/docs/ai/skills/, the `pulumi neo` command reference
  https://www.pulumi.com/docs/iac/cli/commands/pulumi_neo/, and the CLI source
  in pulumi/pulumi (`pkg/cmd/pulumi/neo/`)
- Pulumi ESC https://www.pulumi.com/docs/esc/ and the AWS OIDC guide
  https://www.pulumi.com/docs/esc/guides/configuring-oidc/aws/
- Docker Sandboxes agents, kits, kit spec reference, credentials, isolation,
  defaults, architecture, templates, release notes, and the `sbx` CLI
  reference (docker/docs `data/sbx_cli/*.yaml`)
- Pulumi terminology (brand guidelines): Pulumi Neo, Pulumi ESC, Pulumi
  Cloud, Pulumi IaC, Pulumi console; never Copilot, Pulumi Service, Insights

Every claim on a slide or in its notes is mapped back to one of these sources
in the presenter's fact-check log (kept out of the repo, see `../AGENTS.md`).

## Rules that still bind

- Facts come from the sources above, not memory. Unclear docs become an open
  question, not a guess. Nothing unverified stays on a slide.
- Every `sbx` and `pulumi` command on a slide is one the demo runs, same flags
  (the one deliberate exception is `sbx run shell` on the "two ways" slide).
- One idea per slide. The headline is a claim, not a topic. At most six lines
  of body text, at most eight words per line, no paragraphs, no full sentences
  with commas and subclauses. Code blocks at most eight lines. Everything cut
  from a slide goes into the speaker notes. Separator slides carry a title
  and nothing else.
- Keep the reference deck's layouts, font sizes and separator/content
  patterns (`zoom-content` lists, `gpu-card`/`gpu-caption`, `info-card`,
  `big-code`, `style.css`). No new components.
- No dashes, no counted or balanced headline formulas, no stage-managed lines
  in the notes ("say it plainly", "the thesis of the hour").
- Slides marked `<!-- MIKE: replace -->` are Mike's; leave them as
  placeholders unless his content is provided.
- Every content slide from 10 on builds up with `v-click` / `<v-clicks>`, one
  block at a time; the title is always there. Section slides, the Kermit slide,
  Resources (48) and the closing slide (50) reveal at once. Keep that when you
  edit: give new blocks the directive, and use an absolute `v-click="n"` when an
  arrow has to arrive with the card it points at.
- Do not change the part durations or the timing table; if a rule forces a
  structural change, say why in the commit message.

## Changes after the brief (September 15, 2026, Engin)

- The demo and section 4 use the published
  [infrastructure-sandbox-kit](https://github.com/dirien/infrastructure-sandbox-kit)
  (`ghcr.io/dirien/infrastructure-sandbox-kit:v0.10.0`) instead of a custom
  Neo kit; building a kit on stage was too much for the slot. Section 4 now
  explains why kits sit on top of templates, how kits compose, and how
  `sbx secret set pulumi` makes the token available to every sandbox.
- The Pulumi ESC part (four slides) was removed from the deck. ESC still mints
  the demo's AWS credentials and appears on the boundary and recap slides. The
  60-minute structure above still gives ESC 3 minutes; decide where they go.

## Check before committing

```bash
npm run build && npm run export          # both must pass
```

A checker for the slide rules (six lines, eight words, eight-line code
blocks, notes on every slide) is in the session scratch notes of the
original build; re-derive it from the rules above if needed. Read the
exported PDF page by page for overflow, truncated code and orphan headlines.
