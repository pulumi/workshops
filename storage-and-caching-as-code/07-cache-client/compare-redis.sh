#!/usr/bin/env bash
# compare-redis.sh (OPTIONAL): run redis-benchmark against Dragonfly and against a
# throwaway plain Redis pod, one after the other.
#
#   07-cache-client/compare-redis.sh
#
# This is a rough comparison on a laptop with Docker, with both servers capped to
# small resources. It is not a benchmark and its numbers say nothing about
# production. Use it to show that Dragonfly speaks the Redis protocol, not to
# rank the two.
set -euo pipefail

CTX="${CTX:-kind-storage-workshop}"
IMAGE="${REDIS_IMAGE:-redis:8.2.10-alpine}"
k() { kubectl --context "$CTX" -n demo "$@"; }

k run redis-plain --image="$IMAGE" --port=6379 --restart=Never
k expose pod redis-plain --port=6379
trap 'k delete pod/redis-plain svc/redis-plain --ignore-not-found' EXIT
k wait --for=condition=Ready pod/redis-plain --timeout=120s

for target in dragonfly redis-plain; do
  echo "== $target"
  k run "bench-$target" --rm -i --restart=Never --image="$IMAGE" -- \
    redis-benchmark -h "$target" -q -n 20000 -c 20 -t set,get
done
