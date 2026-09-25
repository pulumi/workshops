# AGENTS.md — 04-admission-denied

Step 5's manifest and script: a plain `kubectl apply` of a Pod with no
resource limits, kept outside any Pulumi program on purpose, to demonstrate
the admission-control path independent of the pipeline.

## Rules

- `unsafe-pod.yaml` must stay a plain Kubernetes manifest, never a Pulumi
  resource. The point of this step is that admission control catches the
  request regardless of what produced it (a human, a script, an agent).
- `try-apply.sh` always exits 0: a Kyverno rejection is the expected,
  successful outcome of this step, not a script failure. Read the printed
  kubectl/API-server error, do not just check the exit code.
- Run `01-cluster/reset.sh` after this step if you want to retry it; it
  deletes any `unsafe-pod` that unexpectedly made it through.
