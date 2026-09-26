# AGENTS.md — 01-stack

The Pulumi Python program: an OpenFGA container, a store, an authorization
model and a set of relationship tuples. Demo steps 1-4 and 6.

## Rules

- `model.json` is the single source of truth for the authorization model.
  `__main__.py` loads it; do not inline a second copy of the model in
  Python. If the model changes, edit `model.json` only.
- The three OpenFGA resources (`OpenFgaStore`, `OpenFgaAuthModel`,
  `OpenFgaTuples` in `openfga_dynamic.py`) are Pulumi dynamic resource
  providers, not `command.local.Command` shell-outs, because the brief
  names them as distinct resources with their own lifecycle. Keep that
  distinction: a provider that shells out to `curl` instead of calling
  `requests` directly would lose the typed diff logic these three now have.
- `pulumi_docker.Container`'s `image` argument must be the `RemoteImage`'s
  `repo_digest`, not `image_id`; using `image_id` causes a spurious replace
  on every `pulumi up` because the container's reported image field never
  matches the tag-based `image_id` Pulumi computed for the diff.

## Verification

- `python3 -m py_compile __main__.py openfga_dynamic.py` — syntax check.
- `./venv/bin/python -c "import __main__"` will fail outside a `pulumi up`
  context (it calls `pulumi.Config()` before a stack is selected); use
  `pulumi preview` instead, which sets that context up.
- `pulumi preview --cwd .` — expected to run through the container and stop
  at the first real Docker daemon call if no Docker is available in the
  environment running this check; that is a real stopping point, not a
  code defect, and must be reported as such rather than as a pass.
- `pulumi up --yes` (needs Docker running locally) brings up the full
  stack; `pulumi stack output` should show `api_url`, `store_id` and
  `authorization_model_id` once it succeeds.
