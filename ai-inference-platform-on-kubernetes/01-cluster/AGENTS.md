# ai-inference-platform-cluster

This project covers workshop steps 1 and 2 (brief section 4) in one Pulumi
program: the managed cluster and the GPU node pool. They are merged here
because `eks.ManagedNodeGroup` takes a live `eks.Cluster` (or `CoreDataArgs`)
object as its `cluster` argument, never a name or ARN string, so the GPU node
group cannot live in a separate Pulumi project fed by a `StackReference`.
See https://www.pulumi.com/registry/packages/eks/api-docs/managednodegroup/
(read 2026-09-24).

The step boundary attendees care about is preserved as a config flag instead
of a project boundary:

- `pulumi config set ai-inference-platform-cluster:gpuNodeGroupEnabled false`
  (the default) stands up the cluster and the system node group only — this
  is step 1's end state.
- `pulumi config set ai-inference-platform-cluster:gpuNodeGroupEnabled true`
  followed by `pulumi up` adds the GPU node group — this is step 2's end
  state. Re-run `pulumi up` a second time during the live demo to make that
  transition visible.

## Design notes

- The VPC is hand-rolled with `pulumi_aws` (two public subnets across two
  availability zones, one route table, no NAT gateway). This keeps the demo
  cheap and simple; it is a workshop simplification, not production
  practice — call this out on the corresponding slide. `awsx` was not used
  because the brief does not pin it.
- The public subnets and the cluster security group are tagged
  `karpenter.sh/discovery: <cluster-name>` so the `04-autoscaling` project
  can discover them for its `EC2NodeClass`.
- The system node group runs `t3.large` (min 2, desired 2, max 3) so
  cluster-critical pods never compete with GPU capacity.
- The GPU node group uses `ami_type="AL2023_x86_64_NVIDIA"` (the EKS-managed
  AMI type that ships the NVIDIA driver) on `g5.xlarge`, with a
  `nvidia.com/gpu=true:NoSchedule` taint so only workloads that tolerate it
  land there.
- EKS version is pinned to `1.34`: it clears the brief's 1.31+ floor for the
  device-plugin path and its 1.34+ note for Dynamic Resource Allocation, and
  is in AWS's standard support window as of 2026-09-24.
- Node IAM roles are created explicitly in this program (not left to the
  cluster's defaults) so the workshop shows attendees the actual policies a
  GPU-capable node needs.

## Verification

No AWS credentials exist on the machine this was built on. `pulumi preview`
was run and reached the provider credential check after building the full
resource graph; it did not fail on program logic. Live verification (nodes
Ready, no `nvidia.com/gpu` before the plugin is installed) needs a real AWS
account and is called out as unverified in the workshop README and the pull
request.
