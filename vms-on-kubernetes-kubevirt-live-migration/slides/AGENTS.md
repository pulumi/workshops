# AGENTS.md: slides for vms-on-kubernetes-kubevirt-live-migration

## Story

1. **The moment.** A question from a sponsored The New Stack article: "How do you standardize on cloud native infrastructure while maintaining the virtual machines that your business depends on?" Janakiram MSV, The New Stack, 2025-11-03 (sponsored by Spectro Cloud, excerpt of the TNS eBook "Running Virtual Machines on Kubernetes"). https://thenewstack.io/migrating-vms-to-kubernetes-a-roadmap-for-cloud-native-enterprises/ (read 2026-10-01). Say on the slide that the post is sponsored. The quote is a question, not an incident: brief §2 holds no incident either, only trend signals.
2. **The tension.** "Your platform runs containers." / "Your business still runs VMs."
3. **Why it is hard.** Today a VM runs on a hypervisor platform and a container runs on Kubernetes. Each stack needs its own skill set, so different teams run them (TNS, read 2026-10-01). The alternative: VMs as objects in the Kubernetes API (KubeVirt user guide, architecture page, read 2026-10-01).
4. **The questions.** (Q1) What is a VM to Kubernetes? (Q2) What runs it? (Q3) Who declares it? (Q4) What does live migration need? (Q5) Does a connection survive the move?
5. **The answers.** Q1: KubeVirt adds CRDs, controllers and node daemons; VirtualMachine, VirtualMachineInstance, virt-launcher pod. Q2: virt-controller and virt-handler run as pods on the cluster; KVM or `useEmulation`. Q3: Pulumi IaC with `@pulumi/kubernetes` (`k8s.yaml.v2.ConfigFile` for the operator, `k8s.apiextensions.CustomResource` for the KubeVirt resource and the VM), `dependsOn` ordering, stack references between the three projects. Q4: a `VirtualMachineInstanceMigration` object (`virtctl migrate`), RWX for PVC volumes, ports 49152 and 49153, same primary interface name on both pods; the demo uses a `containerDisk` because kind's `local-path` class is ReadWriteOnce.
6. **The proof.** The demo moves `demo-vm` between nodes while a probe against its NodePort Service keeps running, and answers Q5. It ends with `pulumi destroy` and a check that no kind cluster is left.

## Original request, in order of authority

1. The workshop brief (workspace document "Workshop brief: VMs on Kubernetes as code", handoff dated 2026-09-26): 90 minutes, intermediate, platform and infrastructure engineers, local kind cluster, KubeVirt v1.9.0.
2. The demo folder as built (`../README.md`, `../0*/`): commands and flags on slides are copied from it.
3. The workshop-deck skill and `deck_frame.py` (frame and check), then the slidev-deck notes.
4. The assignment run: story first, frame generated, no hand-written frame slides.

## Structure and time budget (90 minutes)

| Section | Slides | Minutes |
| --- | --- | --- |
| Opening frame | 1-5 | 5.5 |
| Act 1: the pain | 6-11 | 8.5 |
| Act 2: the tech (Q1 to Q4, limits, recap) | 12-27 | 22.5 |
| The solution we will build | 28-29 | 4 |
| Demo divider | 30 | 0.5 |
| Act 3: the demo | 31-38 | 42.5 |
| Closing frame | 39-41 | 6.5 |

Total: 41 slides, 90.0 minutes. Act 3 is 8 of 41 slides (19.5%).

Demo steps and exact commands (from the folder README):
- 01-preflight: `01-preflight/preflight.sh`, then `01-preflight/prepull-images.sh`
- 02-cluster: `pulumi up --stack dev` in `02-cluster/`
- 03-kubevirt: `pulumi up --stack dev` in `03-kubevirt/`; check `kubectl -n kubevirt get kubevirt kubevirt -o jsonpath='{.status.phase}'`
- 04-vm: `pulumi up --stack dev` in `04-vm/`; check `kubectl get vmi`
- 05-console: `05-console/console.sh` (runs `virtctl console demo-vm`)
- 06-live-migration: `06-live-migration/hold-connection.sh` (second terminal), `06-live-migration/migrate.sh` (runs `virtctl migrate demo-vm`), `06-live-migration/watch-migration.sh`
- 07-teardown: `07-teardown/teardown.sh`, then `07-teardown/verify-clean.sh`

Show `pulumi up --stack dev` once on the demo overview; steps 02-04 carry folder and expected result only. One command per demo slide. Slide 29 is the only program code (8 lines at most, read from `04-vm/index.ts` when writing). Whole-deck code budget: 20 lines; planned 15.

## Sources (§8 and this run)

Brief §8, all read 2026-09-26 by the brief author; not re-read for claims on slides except where listed below:
- KubeVirt v1.9.0 release notes (2026-07-30), https://github.com/kubevirt/kubevirt/releases/tag/v1.9.0 (re-opened 2026-10-01)
- KubeCon + CloudNativeCon Europe 2026 schedule pages, Kubermatic Weekly 2026-05-22, NETWAYS recap 2026-04-01, CNCF blog 2026-09-01: trend signals only, not used on slides unless re-read.

Read for this deck on 2026-10-01:
- https://thenewstack.io/migrating-vms-to-kubernetes-a-roadmap-for-cloud-native-enterprises/ (the moment; two stacks, two skill sets)
- https://kubevirt.io/user-guide/compute/live_migration/ (VMIM, `virtctl migrate`, limitations list: RWX for PVC, bridge binding, ports 49152 and 49153, primary interface name)
- https://kubevirt.io/user-guide/architecture/ (CRDs, controllers, daemons; virt-handler beside kubelet; components run as pods on top of the cluster; VM -> VMI)
- https://kubevirt.io/user-guide/ (welcome page)
- https://kubevirt.io/user-guide/cluster_admin/installation/ (operator manifest and KubeVirt CR)
- https://www.pulumi.com/registry/packages/kubernetes/ (Pulumi Kubernetes provider)
- Demo folder README design notes (containerDisk vs RWX, `useEmulation`, kind on Linux only, KubeVirt 1.9 supports Kubernetes 1.34 to 1.36).

## Rules that bind

- Frame slides come from `frame.json` through `deck_frame.py`; never edit them by hand. `frame.json` has one placeholder speaker because the speakers are unknown; the pull request must say so.
- Every slide is a reference pattern; no theme layouts except `image`; no Mermaid; no hard-coded colours; icon-list text sits in one `<span>`.
- Headlines are claims. Code only on slide 29 and as one command per demo slide.
- Product names: Pulumi IaC, Pulumi ESC, Pulumi Cloud, Pulumi Neo. Never Copilot, Pulumi Service, Insights.
- State only what a doc read this run supports; mechanism details of the migration beyond the VMIM object stay out unless read from the docs first.
- `deck_frame.py check` must pass and its output goes in the pull request. Run the humanizer pass over slides and notes; each slide carries a time budget in its notes.
- slidev-deck skill source: pulumi/marketing-web `.agents/skills/slidev-deck`, commit 9b37f9afe8c7b0d406f19bc9116b16d5689389ce (read via gh api 2026-10-01; the SKILL.md body was not re-read in this scaffolding step, theme facts come from the pointer skill).

## Headlines

1. Title: VMs on Kubernetes as code — pattern: frame — 0.5 min
2. Speaker (placeholder, speakers unknown) — pattern: frame — 1.5 min
3. Housekeeping and Agenda — pattern: frame — 0.5 min
4. Housekeeping — pattern: frame — 2 min
5. Today's Agenda — pattern: frame — 1 min
6. How do you keep the VMs your business depends on and still standardize on Kubernetes? — pattern: big-quote — 1.5 min
7. Your platform runs containers. — pattern: big-statement — 0.5 min
8. Your business still runs VMs. — pattern: big-statement — 0.5 min
9. Two stacks mean two teams, two toolchains and two skill sets — pattern: zones — 2 min
10. The usual answer keeps two control planes; the goal is one API — pattern: compare — 2 min
11. Five questions decide whether you can trust VMs on Kubernetes — pattern: card-grid — 2 min
12. Q1. What is a VM to Kubernetes? — pattern: section-opener — 0.5 min
13. KubeVirt adds VM types to the Kubernetes API instead of a second API — pattern: stack — 2 min
14. A VirtualMachine becomes a VirtualMachineInstance, then a pod — pattern: chain — 2 min
15. Q2. What runs it? — pattern: section-opener — 0.5 min
16. KubeVirt's controllers and daemons run as pods on your cluster — pattern: zones — 2 min
17. Hardware virtualization is optional: KVM if you have it, emulation if you do not — pattern: options — 1.5 min
18. Two questions answered, three to go — pattern: recap-grid — 1 min
19. Q3. Who declares it? — pattern: section-opener — 0.5 min
20. A Pulumi program applies KubeVirt resources like any other Kubernetes object — pattern: compare — 2 min
21. The order is the program: cluster, operator, KubeVirt resource, VM — pattern: flow — 2 min
22. The KubeVirt resource cannot exist before the operator's CRD does — pattern: big-statement — 1 min
23. Q4. What does live migration need? — pattern: section-opener — 0.5 min
24. A migration is one object you post to the cluster — pattern: flow — 2 min
25. Live migration has rules about storage, ports and interfaces — pattern: boundaries — 2 min
26. Where this breaks today: hosts, storage, versions and bridge networking — pattern: card-grid — 2 min
27. Four questions answered, one to go — pattern: recap-grid — 1 min
28. The solution we will build: three Pulumi stacks, one kind cluster, one VM — pattern: zones — 2 min
29. The VM is a few lines of Pulumi (program shape, 8 lines max) — pattern: demo-step (big-code block) — 2 min
30. Demo: KubeVirt live migration — pattern: frame (divider) — 0.5 min
31. What we are going to do: seven steps from a bare host to a moved VM — pattern: demo-overview — 1.5 min
32. 01-preflight: the host passes before anything is created — pattern: demo-checks — 3 min
33. 02-cluster: a three-node kind cluster comes from pulumi up — pattern: demo-outcome — 6 min
34. 03-kubevirt: the operator reaches Deployed — pattern: demo-checks — 8 min
35. 04-vm: the VM reaches Running behind a NodePort Service — pattern: demo-step — 7 min
36. 05-console: you are inside the guest — pattern: demo-step — 4 min
37. 06-live-migration: the VM changes node and the probe keeps answering — pattern: demo-outcome — 10 min
38. 07-teardown: nothing is left behind — pattern: demo-checks — 3 min
39. Resources (QR codes) — pattern: frame — 1 min
40. Continue your Pulumi journey! — pattern: frame — 0.5 min
41. Thank you / Questions? — pattern: frame — 5 min

Budget total: 90 minutes.

## Fact-check

Separate pass after the humanizer pass, 2026-10-01. Sources opened this run.

| Claim | Source | Date | Outcome |
| --- | --- | --- | --- |
| Quote: 'How do you standardize on cloud native infrastructure while maintaining the virtual machines that your business depends on?' | https://thenewstack.io/migrating-vms-to-kubernetes-a-roadmap-for-cloud-native-enterprises/ | 2026-10-01 | Confirmed, verbatim |
| Author Janakiram MSV, dated 2025-11-03 | https://thenewstack.io/migrating-vms-to-kubernetes-a-roadmap-for-cloud-native-enterprises/ | 2026-10-01 | Confirmed (byline and date on page) |
| Post is sponsored by Spectro Cloud; excerpt of the TNS eBook 'Running Virtual Machines on Kubernetes' | https://thenewstack.io/migrating-vms-to-kubernetes-a-roadmap-for-cloud-native-enterprises/ | 2026-10-01 | Confirmed ('Spectro Cloud sponsored this post') |
| Each stack needs its own skill set, so different teams run them | https://thenewstack.io/migrating-vms-to-kubernetes-a-roadmap-for-cloud-native-enterprises/ | 2026-10-01 | Confirmed |
| KubeVirt adds CRDs, controllers and a node daemon; VMs become objects in the Kubernetes API | https://kubevirt.io/user-guide/architecture/ | 2026-10-01 | Confirmed |
| virt-handler runs on each host alongside kubelet | https://kubevirt.io/user-guide/architecture/ | 2026-10-01 | Confirmed |
| virt-controller is a KubeVirt component that runs as a pod; operator installs KubeVirt | https://kubevirt.io/user-guide/cluster_admin/installation/ | 2026-10-01 | Confirmed (virt-controller, virt-operator pods in kubevirt namespace) |
| VirtualMachine, VirtualMachineInstance and virt-launcher pod relationship | https://kubevirt.io/user-guide/architecture/ ; https://kubevirt.io/user-guide/compute/live_migration/ | 2026-10-01 | Confirmed (VMI runs in a virt-launcher pod) |
| useEmulation is the software-emulation fallback without hardware virtualization | https://kubevirt.io/user-guide/cluster_admin/installation/ | 2026-10-01 | Confirmed (spec.configuration.developerConfiguration.useEmulation) |
| KVM needs /dev/kvm | https://kubevirt.io/user-guide/cluster_admin/installation/ | 2026-10-01 | Confirmed (virt-host-validate checks /dev/kvm) |
| Migration is initiated by posting a VirtualMachineInstanceMigration; virtctl migrate does it | https://kubevirt.io/user-guide/compute/live_migration/ | 2026-10-01 | Confirmed |
| PVC-backed volumes need ReadWriteMany for live migration | https://kubevirt.io/user-guide/compute/live_migration/ | 2026-10-01 | Confirmed |
| Ports 49152 and 49153 must be available in the virt-launcher pod | https://kubevirt.io/user-guide/compute/live_migration/ | 2026-10-01 | Confirmed |
| Primary interface must have the same name on source and target pods | https://kubevirt.io/user-guide/compute/live_migration/ | 2026-10-01 | Confirmed |
| Bridge pod network binding is not allowed for live migration | https://kubevirt.io/user-guide/compute/live_migration/ | 2026-10-01 | Confirmed |
| evictionStrategy: LiveMigrate migrates the VMI on node eviction | https://kubevirt.io/user-guide/cluster_admin/node_maintenance/ | 2026-10-01 | Confirmed |
| KubeVirt 1.9 supports Kubernetes 1.34 to 1.36 | https://github.com/kubevirt/sig-release/blob/main/releases/k8s-support-matrix.md | 2026-10-01 | Confirmed (matrix row 1.9) |
| KubeVirt version v1.9.0 exists | https://github.com/kubevirt/kubevirt/releases/tag/v1.9.0 | 2026-10-01 | Confirmed |
| virtctl provides serial console access and live migration commands | https://kubevirt.io/user-guide/user_workloads/virtctl_client_tool/ | 2026-10-01 | Confirmed |
| k8s.yaml.v2.ConfigFile and k8s.apiextensions.CustomResource exist in the Pulumi Kubernetes provider | https://www.pulumi.com/registry/packages/kubernetes/api-docs/yaml/v2/configfile/ ; https://www.pulumi.com/registry/packages/kubernetes/api-docs/apiextensions/customresource/ | 2026-10-01 | Confirmed (pages open and document both) |
| Demo: kind local-path is ReadWriteOnce, so the VM uses a containerDisk | demo 04-vm/index.ts, README.md | 2026-10-01 | Confirmed in demo files |
| Demo: useEmulation defaults to true; Linux only, not macOS or Windows | demo 03-kubevirt/index.ts, README.md | 2026-10-01 | Confirmed in demo files |
| Demo: runStrategy Always, evictionStrategy LiveMigrate, masquerade interface, NodePort Service | demo 04-vm/index.ts | 2026-10-01 | Confirmed in demo files |
| Demo: KubeVirt resource phase reads Deployed; Ctrl+] exits console; migrate.sh runs virtctl migrate; probe opens a new connection each time | demo 03-kubevirt/AGENTS.md, 05-console/console.sh, 06-live-migration/*.sh | 2026-10-01 | Confirmed in demo files |
| Demo: three stacks 02-cluster, 03-kubevirt, 04-vm; teardown.sh and verify-clean.sh | demo folder listing | 2026-10-01 | Confirmed in demo files |

Claims checked: 25. Unsupported or contradicted: 0.

Corrections: none to facts. The humanizer pass (run first) reworded four speaker-note sentences (contrast constructions, one filler line); no em dashes remain. `deck_frame.py check` passes 24/24 afterwards.

Open: the 06 slide says the probe shows reachability, not session continuity; that wording matches hold-connection.sh.
