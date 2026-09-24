# 06-over-broad-binding

This folder has no Pulumi project of its own. It holds one patch,
applied to `03-service-account/__main__.py` during the demo to show the
policy pack in `05-policy-pack/` catching a real violation.

## What the patch does

`widen-service-account-to-project-owner.patch` adds a second binding to
`03-service-account/__main__.py`: a `gcp.projects.IAMMember` granting the
step-3 service account `roles/owner` at the **project** scope, instead of a
role scoped to the service account itself. That is exactly the shape
`rules.py`'s `gcp_binding_violation` rejects (project-level `IAMMember`/
`IAMBinding`, plus `Owner`/`Editor`/wildcard roles on any binding).

## Demo sequence (brief step 6)

```sh
cd 03-service-account
git apply ../06-over-broad-binding/widen-service-account-to-project-owner.patch
pulumi preview --policy-pack ../05-policy-pack
```

`pulumi preview` must stop with the policy pack's violation message before
anything reaches GCP. That is the moment to narrate: the broad binding never
got the chance to apply.

## Reverting after the demo

```sh
git apply -R ../06-over-broad-binding/widen-service-account-to-project-owner.patch
```

Verified this run: `git apply --check` passes, the patched file parses
(`ast.parse`), and `git apply -R` reverts to the original file with no
residual diff. `pulumi preview`/`pulumi up` against real GCP credentials were
not run — no GCP project was available in this environment; see the root
README's verification section.
