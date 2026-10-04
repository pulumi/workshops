#!/usr/bin/env bash
# show.sh — what the scheduler did: queues, Volcano jobs, pod groups, pods and free GPUs.
#   03-jobs/show.sh
set -uo pipefail
# shellcheck source=../lib.sh
. "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"
need_cluster
say "queues"
kubectl get queues.scheduling.volcano.sh
say "volcano jobs"
kubectl -n "$NS" get jobs.batch.volcano.sh 2>&1
say "pod groups"
kubectl -n "$NS" get podgroups.scheduling.volcano.sh 2>&1
say "pods"
kubectl -n "$NS" get pods -o wide 2>&1
say "fake GPUs per worker (allocatable)"
kubectl get nodes -o custom-columns='NODE:.metadata.name,GPU:.status.allocatable.example\.com/gpu'
