# Slides: notes for the next agent or presenter

Built 2026-09-26. 19 slides, speaker-note time budgets sum to 90 minutes (the
brief's §1 length). Verified with `npm run build` and `npm run export`;
the exported PDF was rendered to page images and every page checked visually.

## Deviations from the brief's §5 outline

The brief's §5 lists slide content in prose form. Where it could not be
followed literally, here is what changed and why:

- **Slide 2 (speaker) is a placeholder.** The backlog card and brief both say
  speakers are unknown. The slide uses `/img/speaker-placeholder.png` (a
  plain generated block) and a `TODO(presenter)` comment. Do not fill this in
  without a real person; ask the workshop owner.
- **Slide 4 (prerequisites) is an addition**, not in §5. The brief's §6 asks
  for a prerequisites slide when participants follow along on their own
  machines, so this workshop needs one and the workshop-deck skill's arc
  agrees.
- **§5's items 9, 10, and 11 (the demo steps) map to three slides, not seven**,
  one per Pulumi program plus the console and migration steps grouped with
  the program that produces them:
  - Slide 11: `02-cluster` + `03-kubevirt` (cluster up, KubeVirt operator up)
  - Slide 12: `04-vm` + `05-console` (VM up, console access)
  - Slide 13: `06-live-migration` (the actual migration and its verification)

  `01-preflight` is covered by slide 4 (prerequisites) and `07-teardown` by
  slide 17 (cleanup). Every numbered demo folder appears on exactly one
  slide.
- **Slide 15 ("Where this breaks today") is an addition**, not in §5. It
  carries the brief's §7 risks (containerDisk has no persistent state and
  kind can't give it RWX storage for a DataVolume; the demo runs under
  emulation without nested virtualization; virtctl/KubeVirt version
  mismatches break migration commands in confusing ways) plus the plain fact
  that this exact demo has never been run against live infrastructure.
- **§5's item 15 asks for a QR code to "the pulumi/workshops contribution
  guide."** The repository has no `CONTRIBUTING.md` (checked 2026-09-26). The
  follow-up slide's QR points at the repository README instead, and the
  workshop's own folder path is given as text since the folder is not on
  `main` yet (it ships on this pull request). The deep link to the folder
  should be added once the branch merges.

## Facts and sources, all read 2026-09-26

- KubeVirt live migration mechanism and `virtctl migrate` / `VirtualMachineInstanceMigration`
  status: https://kubevirt.io/user-guide/compute/live_migration/
- Pulumi Kubernetes provider, `kubernetes:yaml/v2:ConfigFile` and typed
  `CustomResource`: https://www.pulumi.com/registry/packages/kubernetes/api-docs/yaml/v2/configfile/
  (confirms the `@pulumi/kubernetes ^4.34.2` version used in `03-kubevirt` and
  `04-vm` is current)
- Every command shown on a demo slide is copied verbatim, same flags, from
  the top-level `README.md`'s "Run the demo" section and the per-folder
  Pulumi project names (`vms-cluster`, `vms-kubevirt`, `vms-vm`, stack `dev`).
- Naming: Pulumi IaC, Pulumi Cloud, pulumi console (lowercase). No slide uses
  "Pulumi Service", "Copilot", "Insights", or "CrossGuard".

## QR codes

Every URL behind a QR code was opened and confirmed to resolve this run:

- https://slack.pulumi.com (Community Slack)
- https://app.pulumi.com/signup (Pulumi Cloud free tier)
- https://github.com/pulumi/workshops (repository root; the workshop's own
  folder is not on `main` yet)

## Open questions for review

- Confirm the speaker slide gets replaced with a real presenter before this
  workshop is delivered.
- Confirm whether the workshop-repo QR should instead wait until this branch
  merges and then point at the folder path directly.
