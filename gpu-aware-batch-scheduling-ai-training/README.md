# GPU-aware batch scheduling for AI training on Kubernetes with Pulumi

Provision a gang scheduler, [Volcano](https://volcano.sh), with Pulumi, run a multi-pod training job that starts all-or-nothing, and enforce fair share between two teams. The GPU sharing part (Dynamic Resource Allocation) is a recorded segment, see [GPU decision](#gpu-decision).

Length: 90 minutes. Level: intermediate to advanced. Language: TypeScript.

## What you build

| Step | Folder | Result |
| --- | --- | --- |
| 1 | `01-cluster` | kind cluster (1 control plane, 2 workers), 4 fake GPUs per worker, Volcano 1.15.3 from its Helm chart |
| 2 | `02-queues` | two Volcano `Queue`s, `team-a` and `team-b`, each capped at 4 GPUs |
| 3 | `03-jobs` | ten one-GPU pods: default scheduler vs. gang scheduling |
| 4 | `03-jobs` | one job per team: `team-b` asks for 6 GPUs, over its cap of 4, and waits |
| 5 | `04-dra` | what DRA looks like on this cluster; the fractional-sharing demo is recorded |
| 6 | `05-teardown` | destroy everything and prove it |

## Layout

```
gpu-aware-batch-scheduling-ai-training/
├── README.md            this file
├── AGENTS.md            conventions for agents (and humans) editing this folder
├── lib.sh               shared helpers for the scripts
├── 01-cluster/          Pulumi project: kind cluster, fake GPUs, Volcano chart; init-stacks.sh
├── 02-queues/           Pulumi project: the two team queues
├── 03-jobs/             Pulumi project: the training scenarios; scenario.sh, show.sh, grow-gpus.sh, reset.sh
├── 04-dra/              check-dra.sh: the resource.k8s.io API and published devices
└── 05-teardown/         teardown.sh: destroy in reverse order and verify
```

## Prerequisites

Docker (or another container runtime kind supports), `kind`, `kubectl`, `helm`, the Pulumi CLI and Node.js 20 or newer. No cloud account and no GPU are needed. Verified tool versions on the build machine: kind v0.33.0, Pulumi 3.267.0, Node.js 22.

## Run it

```bash
01-cluster/init-stacks.sh            # once: npm install and `dev` stack in each project
cd 01-cluster && pulumi up           # step 1
kubectl get pods -n volcano-system   # scheduler, controllers, admission: Running
cd ../02-queues && pulumi up         # step 2
kubectl get queue                    # team-a, team-b: Open
03-jobs/scenario.sh default-scheduler   # step 3a: 8 pods Running, 2 Pending
03-jobs/scenario.sh gang                # step 3b: all 10 pods Pending together
03-jobs/show.sh
03-jobs/grow-gpus.sh 5               # 10 GPUs: the gang starts
03-jobs/reset.sh
03-jobs/scenario.sh fair-share       # step 4: team-a Running, team-b waits
03-jobs/show.sh
04-dra/check-dra.sh                  # step 5
05-teardown/teardown.sh              # step 6
```

Eight fake GPUs and ten requested pods is what makes the contrast visible. Rehearse the numbers before delivery.

## GPU decision

kind has no GPU, so outcome 5 (two jobs sharing one GPU through DRA) is a recorded segment. No live GPU node is provisioned and no cloud cost is incurred. The decision is explicit; the outcome is not dropped. `04-dra/check-dra.sh` shows the DRA API on the kind cluster and the empty device list, which is what the recording contrasts with.

To run it live you need a node with a real GPU, a DRA driver such as the [NVIDIA DRA driver](https://github.com/kubernetes-sigs/dra-driver-nvidia-gpu), and the sharing feature gates the driver documents. That path is not built here and is untested.

## Why Volcano

Volcano is a CNCF incubating project with gang scheduling and queues built in, and a KubeCon NA 2026 session. Armada (CNCF sandbox) and Kueue solve the same problem and were not compared hands on. This is a judgment call, not a community consensus.

## Pinned versions

- Volcano Helm chart and app 1.15.3 (released 2026-09-30). Versions 1.15.0 and 1.15.1 have a flaw in DRA capacity accounting that can stall scheduling (fixed in 1.15.2); 1.15.3 also fixes an int64 overflow that could bypass the capacity plugin quota check.
- kind v0.33.0 default node image.
- `@pulumi/kubernetes` `^4.30.0`, `@pulumi/command` `^1.2.0`, `@pulumi/pulumi` `^3.262.0`.

## Cost

Zero. Everything runs on one laptop.

## Reset and teardown

`03-jobs/reset.sh` returns to the start of step 3. `05-teardown/teardown.sh` destroys the stacks in reverse order, deletes the kind cluster and lists what is left.
