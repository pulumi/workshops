# ai-inference-platform-autoscaling

Step 5: GPU node count tracks pending workload instead of a fixed node group
size. This project shows attendees that a Helm chart alone is not enough for
Karpenter — real IAM and messaging infrastructure sits underneath it, and
that infrastructure is exactly the kind of thing Pulumi is meant to own.

## What the Karpenter Helm chart cannot create for you

Read from https://karpenter.sh/docs/getting-started/getting-started-with-karpenter/
and https://karpenter.sh/docs/concepts/nodepools/ (2026-09-24):

- The controller's IRSA role (federated trust to the cluster's OIDC
  provider) and its permissions policy (EC2 fleet/instance actions, SQS
  receive/delete on the interruption queue, `iam:PassRole` on the node role,
  `eks:DescribeCluster`).
- The node IAM role and instance profile Karpenter hands to every EC2
  instance it launches directly (it does not go through a managed node
  group, so there is no node group to inherit a role from).
- The SQS interruption queue plus EventBridge rules for spot interruption,
  rebalance recommendation, instance state change, and AWS Health scheduled
  change notifications.

All of the above are plain `pulumi_aws` resources in this program. The chart
only takes `settings.clusterName`, `settings.interruptionQueue`, and the
controller role ARN as a service-account annotation
(`eks.amazonaws.com/role-arn`).

## Chart install order

`karpenter-crd` (`oci://public.ecr.aws/karpenter/karpenter-crd`) must exist
before the `karpenter` controller chart, since the controller's `NodePool`
and `EC2NodeClass` custom resources depend on those CRDs. This program
expresses that with `opts.depends_on`, not chart values.

## EC2NodeClass and NodePool

- `EC2NodeClass` (`karpenter.k8s.aws/v1`) discovers subnets and the security
  group tagged `karpenter.sh/discovery: <cluster-name>` in `01-cluster`.
- `NodePool` (`karpenter.sh/v1`) is restricted to `g5.xlarge` on-demand
  instances and carries the same `nvidia.com/gpu=true:NoSchedule` taint as
  `01-cluster`'s static GPU node group, so a pod written for one path
  tolerates the other without changes.
- `manifests/gpu-inference-deployment.yaml` is the workload used to
  demonstrate scale-up (raise replicas, a new node appears) and scale-down
  (drop replicas to 0, Karpenter's consolidation reclaims the node).

## Verification

`python3 -m py_compile __main__.py` passes. `pulumi preview` was run against
an empty (never-deployed) `01-cluster` stack: it built the full resource
graph (SQS queue, EventBridge rules, IAM roles/policies, instance profile,
Helm charts, EC2NodeClass, NodePool) and then failed on the AWS provider's
credential check (`No valid credential sources found`), the same stopping
point as `01-cluster`, before it reached the Kubernetes-specific resources.
No AWS credentials exist on this build machine, so this is the expected and
reportable stopping point. The actual scale-up/scale-down behavior, and the
interruption queue draining a spot node, are unverified without a live
cluster and real AWS credentials.
