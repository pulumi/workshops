# Open questions

Things that could not be verified or decided while preparing this folder, and
what unblocks each. Numbered so the deck and the runbook can point at them.

## Blocked on a host with `sbx` (Engin)

1. **End-to-end run and timing.** This folder was prepared inside a Docker
   Sandbox, which cannot run `sbx` (host tool, no nested virtualization). The
   pieces were tested in isolation: the guard and entrypoint with a test suite
   and inside the real `ghcr.io/dirien/infrastructure-sandbox:v0.9.0` image
   (`docker run`), the two Pulumi programs compile and `02-app` previews
   against a local backend, the slides build and export. The runbook itself
   (`DEMO.md`) has **not** been executed end to end, twice, from a clean state,
   and the 15-minute timing is a target, not a measurement. Do this on your
   Mac before the session and correct the timing table.
2. **Fallback recording.** For the same reason no asciinema recording exists.
   `01-sandbox/record.sh` produces it on the host; recordings are gitignored.
3. **Kit behaviours the Docker docs do not pin down** (kits are experimental):
   - whether `sbx run … -- <args>` is appended to a custom `sandbox.entrypoint`
     (the entrypoint accepts extra arguments; if `--` is not forwarded, pass the
     first prompt inside the TUI instead);
   - whether `sbx run --env NEO_SANDBOX_PERMISSION_MODE=read-only` on re-attach
     overrides the value baked from the kit argument at create time (the CLI
     reference says `--env` "applies to the agent session, so it takes effect
     on a re-attach too"; precedence over kit `environment.variables` is not
     documented). Fallback in DEMO.md: recreate with `--kit-arg`;
   - whether `sbx secret set -g pulumi` accepts a kit-declared service (the
     kit repo's README documents it; the CLI reference lists only built-in
     services) and how the first-run credential-binding prompt looks;
   - the exact `sbx policy log` columns (the runbook's expected output is
     paraphrased from the CLI reference).
4. **Neo's event stream through the proxy.** `pulumi neo` keeps an SSE stream
   open to `api.pulumi.com` over HTTP/2; the sandbox proxy injects the token on
   that host, which means it terminates TLS there. sbx 0.42.1 fixed an HTTP/2
   framing bug in that proxy; a long session has not been tested through it.
   Neo reconnects with `Last-Event-ID` on transient drops, and `pulumi neo
   resume <task-id>` is the manual recovery. Also check `sbx policy log` after
   the first task: if Neo contacts any host besides `api.pulumi.com`, add it to
   `neo-kit/spec.yaml`.

## Blocked on credentials (Engin)

5. **AWS account and Pulumi org for the demo.** `00-esc` needs an AWS account
   where you can create an IAM OIDC provider (or pass
   `existingOidcProviderArn` if `api.pulumi.com/oidc` already exists there: an
   account can have only one provider per URL) and a Pulumi organization with
   Neo enabled (Settings → Neo access) and Neo tokens available. The region is
   `eu-central-1` in both `00-esc/Pulumi.bootstrap.yaml` and the kit's
   allow-list; change both if you use another region.
6. **The stack's organization.** `02-app/Pulumi.dev.yaml` imports
   `neo-workshop/aws-oidc` relative to the stack's org, so the stack must be
   created as `<org>/dev` in the same org as the ESC environment.

## Needs Mike's input (Docker)

7. **The Docker Sandboxes segment.** Section 5 of the deck holds a title slide
   and three placeholders marked `<!-- MIKE: replace -->` (microVM isolation,
   kits, secret injection), written from the public docs. He may replace them
   with his own; the Pulumi slides only rely on those three ideas.
8. **Organization governance.** Org-level network/MCP policies are a paid
   Docker feature and override kit allow-lists ("only organization allow rules
   grant access"). The deck mentions this in one line; Mike may want to say
   more or less.

## Docs that are unclear (do not guess)

9. **AGENTS.md support in `pulumi neo`.** The workshop brief lists it, but
   none of the Neo pages read for this deck (CLI page, launch post, tasks,
   get-started, permissions model, agent skills) mention AGENTS.md, and the
   CLI source in `pulumi/pulumi` has no handling for it (its filesystem tool
   is restricted to the working directory, so it *can* read a project's
   AGENTS.md if the cloud agent asks for it). The demo ships
   `02-app/AGENTS.md` anyway; the slide says "ship one, Neo can read it" and
   does not claim it is loaded automatically. Verify on the host and update
   slide "Project instructions" if Neo reads it unprompted.
10. **What "low-risk" means in balanced mode.** The docs define balanced as
    "approval only before `pulumi up`" (console) and "auto-approves low-risk
    calls" (CLI flag help); the classification is server-side and not listed.
    The deck quotes the docs and does not enumerate.
11. **Read-only mode and a `pulumi up` typed through Neo's shell tool.** The
    docs say read-only "removes the ability to trigger writes in Pulumi Cloud"
    and that it is scoped to Pulumi Cloud, not the cloud account. Whether a
    `pulumi up` that Neo runs through `sh -c` (not through its Pulumi tool) is
    also refused is not documented. DEMO.md step 4 asks Neo to "deploy", which
    normally goes through its Pulumi tool; if Neo shells out instead and the
    update goes through, say so honestly and move on. Verify on the host.
12. **Kit `agentInstructions` and Neo.** sbx writes the sandbox kit's profile
    file (`AGENTS.md`) next to the workspace, outside it; Neo's tools cannot
    read outside the workspace and `/tmp`. So the kit's `agentInstructions`
    are probably invisible to Neo; the project's own `AGENTS.md` carries the
    instructions instead. Confirm where sbx writes the file for a direct-mount
    workspace.

## Deck and repo housekeeping

13. **Theme version.** `@pulumi/slidev-theme` now comes from the public npm
    registry (0.4.0). The GKE reference deck pins 0.1.0 through an `.npmrc`
    for GitHub Packages that needs a `read:packages` token; this deck drops
    the `.npmrc`. The overlay `style.css` was copied from the reference and
    still matches the theme's class names (`.pulumi-slide-body`,
    `.pulumi-accent-bar`, `PulumiFooter`), verified against 0.4.0.
14. **Docker Desktop wording.** The event page and the brief say "Docker
    Desktop with Sandboxes"; the Docker install docs say `sbx` does not need
    Docker Desktop or Docker Engine. The README follows the docs. Align the
    wording with Mike.
15. **The prompt in step 3 names `@pulumi/aws` v7 sub-resources** so Neo does
    not reach for the legacy `bucket.versioning` block. If Neo picks different
    logical names than the runbook's expected output, that is cosmetic.
16. **Speaker avatars.** The Questions slide uses GitHub profile photos for
    `adamgordonbell`, `dirien` and `mikegcoleman`. Confirm the two handles that
    are not yours, or drop local images into `slides/public/avatars/`.
17. **Who speaks which part.** The notes suggest Adam for the intro and the
    wrap-up, Engin for parts 2, 3, 4, 6, 7, Mike for part 5. Adjust the
    "Suggested speaker" notes once the three of you decide.
