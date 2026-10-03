# Slides: ai-inference-platform-on-kubernetes

Deck for the 90-minute intermediate workshop "Provisioning the AI Inference Platform on Kubernetes". Built with `deck_frame.py init` (frame, `style.css`, `components/QRCode.vue` are generated and checked; never hand-edit them). Theme mechanics read from `pulumi/marketing-web` `.agents/skills/slidev-deck` at commit `9b37f9afe8c7b0d406f19bc9116b16d5689389ce`.

## Story

1. **The moment.** Cast AI's 2026 State of Kubernetes Optimization Report, announced 2026-04-21: "GPU utilization averaged just 5% across the clusters analyzed." Laurent Gil, co-founder and president of Cast AI: "A GPU sitting idle costs dollars per hour. A CPU sitting idle costs cents. And 95% of GPU capacity is doing nothing." Source: https://cast.ai/press-release/2026-state-of-kubernetes-optimization-report/ (read 2026-10-03). Caveats to say out loud: it is a vendor report, and it analyses non-optimized clusters ("tens of thousands" per the press release; the Cast AI blog https://cast.ai/blog/kubernetes-cost-drivers/ gives "23,000+", read 2026-10-03). Brief section 2 holds no incident or quote, so this moment was found this run.
2. **The tension.** "A GPU bills for every hour you hold it." / "Your inference traffic uses it for a fraction of that."
3. **Why it is hard.** Compare: an idle CPU costs cents, an idle GPU costs dollars per hour (Cast AI quote). A GPU node also needs more than a bigger instance: a GPU-capable node group, a device plugin before Kubernetes reports `nvidia.com/gpu` (NVIDIA k8s-device-plugin README), GPU limits that must be whole units (Kubernetes docs), and nothing in the cluster limits who takes them.
4. **The questions.** (1) Where does the GPU capacity come from? (2) How does Kubernetes see the GPU? (3) Who may take how much? (4) When does capacity appear and go away? (5) Is anything left billing when we are done?
5. **The answers.** Q1: Pulumi IaC with the `pulumi-eks` component: `eks.Cluster` and `eks.ManagedNodeGroup` (Pulumi EKS guide). Q2: the NVIDIA device plugin, installed as a Helm chart through the Pulumi Kubernetes provider's Helm v4 `Chart` resource. Q3: a Kubernetes `ResourceQuota` per namespace, declared as a Pulumi Kubernetes resource. Q4: Karpenter (NodePool with limits and consolidation) installed by Pulumi, with its AWS prerequisites declared in the same project; projects connect through `StackReference` (Pulumi stacks docs). Q5: reverse-order teardown plus an orphan check, answered in the demo.
6. **The proof.** The demo builds the cluster, adds the GPU node, shows `nvidia.com/gpu` allocatable, rejects an oversized GPU request, scales a GPU node up and back to zero, and ends with `06-teardown`, which answers question 5 last.

## Headlines

Frame (generated, 6 slides with one speaker placeholder): title, speaker, "Housekeeping and Agenda", Housekeeping, Today's Agenda.

Act 1, the pain (5):
1. 95% of GPU capacity is doing nothing — pattern: quote-card
2. A GPU bills for every hour you hold it. — pattern: big-statement
3. Your inference traffic uses it for a fraction of that. — pattern: big-statement
4. An idle GPU costs dollars, an idle CPU costs cents — pattern: compare
5. Five questions stand between a ticket and a platform — pattern: card-grid

Act 2, the tech (14):
6. Where does the GPU capacity come from? — pattern: section-opener
7. The GPU node group is one resource in the cluster program — pattern: flow
8. Components hide the wiring, not the choices — pattern: stack
9. How does Kubernetes see the GPU? — pattern: section-opener
10. The device plugin turns a GPU into a schedulable resource — pattern: flow
11. GPU requests are whole units in limits — pattern: compare
12. Two questions covered, three to go — pattern: recap-grid
13. Who may take how much? — pattern: section-opener
14. A quota makes the namespace the unit of sharing — pattern: zones
15. When does capacity appear and go away? — pattern: section-opener
16. Karpenter adds nodes for pending pods and removes idle ones — pattern: flow
17. Autoscaling needs AWS permissions before it needs a chart — pattern: chain
18. Where this breaks today: serving, sharing and spot — pattern: boundaries
19. Four questions covered, one to go — pattern: recap-grid

The solution we will build (2):
20. One cluster, one GPU pool, four Pulumi projects — pattern: zones (architecture: VPC and EKS, GPU node group, device plugin, quota, Karpenter)
21. The GPU node group is a handful of declarations — pattern: big-code (ten lines at most, copied from `01-cluster/__main__.py`; the only program code in the deck)

Demo divider (generated): "Demo: AI inference platform."

Act 3, the demo (8, a quarter of the deck at most):
22. What we are going to do — pattern: demo-overview
23. The cluster comes up with no GPU nodes (`01-cluster`) — pattern: demo-step
24. One config value adds the GPU node (`01-cluster`) — pattern: demo-step
25. The node reports a GPU the scheduler can use (`02-device-plugin`) — pattern: demo-checks
26. An oversized GPU request is rejected (`03-quotas`) — pattern: demo-outcome
27. Pending pods create a GPU node and no pods remove it (`04-autoscaling`) — pattern: demo-checks
28. The serving layer plugs in here and we only read it (`05-serving-layer`) — pattern: demo-step
29. Teardown leaves nothing billing (`06-teardown`) — pattern: demo-outcome

Closing frame (generated): Resources, Continue your Pulumi journey!, Thank you / Questions?

Total: 6 + 5 + 14 + 2 + 1 + 8 + 3 = 39 slides.

Demo-slide commands come from the folder README: `pulumi up` in each folder, `pulumi config set gpuNodeGroupEnabled true`, `kubectl apply -f manifests/oversized-gpu-pod.yaml -n gpu-workloads`, `kubectl scale deployment/gpu-echo -n gpu-workloads --replicas=2`, and the teardown scripts. Copy flags from the demo, never from memory.

## Speakers

Speakers are unknown, so `frame.json` carries one `{"placeholder": true}` speaker. Replace it when the speakers are named.

## Sources

All read 2026-10-03 unless noted.

- Cast AI press release, 2026-04-21: https://cast.ai/press-release/2026-state-of-kubernetes-optimization-report/
- Cast AI blog, "The 7 Kubernetes Cost Drivers Most Teams Miss": https://cast.ai/blog/kubernetes-cost-drivers/
- DigitalToday summary (secondary, only to find the original): https://www.digitaltoday.co.kr/en/view/49810/kubernetes-gpu-average-utilization-stays-at-about-5-percent-cpu-at-8-percent
- Pulumi EKS registry page: https://www.pulumi.com/registry/packages/eks/ and EKS guide: https://www.pulumi.com/docs/clouds/aws/guides/eks/
- Pulumi Kubernetes Helm v4 Chart: https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v4/chart/
- Pulumi Kubernetes ResourceQuota: https://www.pulumi.com/registry/packages/kubernetes/api-docs/core/v1/resourcequota/
- Pulumi stacks (StackReference): https://www.pulumi.com/docs/iac/concepts/stacks/
- Pulumi components: https://www.pulumi.com/docs/iac/concepts/resources/components/
- NVIDIA k8s-device-plugin: https://github.com/NVIDIA/k8s-device-plugin
- Kubernetes, schedule GPUs: https://kubernetes.io/docs/tasks/manage-gpus/scheduling-gpus/
- Karpenter NodePools: https://karpenter.sh/docs/concepts/nodepools/
- marketing-web `slidev-deck` skill at commit 9b37f9afe8c7b0d406f19bc9116b16d5689389ce

Open questions for the deck pass: (a) slide 18's "no first-party KServe or Ray Serve package" comes from the brief, not from a doc read this run; verify in the Pulumi registry or soften. (b) The 5% figure is a vendor measurement of non-optimized clusters; say so on slide 1.

## Fact-check

Separate adversarial pass, 2026-10-03. Claims checked: 24. Confirmed: 21. Corrected: 3. Removed: 0.

Corrected:
- "The GPU group cannot sit in a separate project that reads the cluster through a stack reference" was too strong. `eks.ManagedNodeGroup` accepts `Cluster | CoreData`. Notes now say the demo passes the cluster object and a split is possible.
- "GPUs not overcommitted by default" became "integers only, cannot be overcommitted, cannot be shared between containers" (Kubernetes device plugin docs).
- "live cluster" wording on slide and notes changed to "cluster object".

Confirmed: Cast AI 5% average GPU utilization, Laurent Gil quote and title, 2026-04-21 date, "tens of thousands" of non-optimized clusters; GPU limits rules (limits only, request equals limit, no request without limit); `requests.nvidia.com/gpu` quota; NVIDIA plugin is a DaemonSet exposing GPU counts and `nvidia.com/gpu`; Karpenter watches unschedulable pods, NodePool limits, default `WhenEmptyOrUnderutilized`, node role, instance profile and interruption queue are set up outside the chart; stack references expose outputs of another stack; Helm v4 `Chart` in the Pulumi Kubernetes provider; `ManagedNodeGroup` takes a cluster; no Pulumi registry package page for KServe or Ray (404), slides say "none that we found". Demo commands match README and scripts; `kubectl describe node <gpu-node>` now matches the README.

Sources read 2026-10-03:
- https://cast.ai/press-release/2026-state-of-kubernetes-optimization-report/
- https://kubernetes.io/docs/tasks/manage-gpus/scheduling-gpus/
- https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/device-plugins/
- https://kubernetes.io/docs/concepts/policy/resource-quotas/
- https://kubernetes.io/docs/tasks/administer-cluster/extended-resource-node/
- https://github.com/NVIDIA/k8s-device-plugin
- https://karpenter.sh/docs/ , /docs/concepts/nodepools/ , /docs/concepts/disruption/ , /docs/getting-started/getting-started-with-karpenter/
- https://www.pulumi.com/docs/iac/concepts/stacks/#stackreferences
- https://www.pulumi.com/registry/packages/eks/api-docs/managednodegroup/
- https://www.pulumi.com/registry/packages/kubernetes/api-docs/helm/v4/chart/
- https://www.pulumi.com/docs/clouds/aws/guides/eks/
