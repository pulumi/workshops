# AGENTS.md: azure-policy-as-code-pulumi-policies

Guidance for coding agents (and humans) working in this workshop folder of `pulumi/workshops`.

## What this folder is

The material for the workshop "Azure Policy as code with Pulumi: management groups, initiatives, assignments and preventive Pulumi Policies". Demo code in eight cumulative Pulumi projects, plus (later) slides. See `README.md` for the layout and how to run it.

The repo carries the demo code, the deck and these notes. The presenter's working documents stay on the presenter's machine; `.gitignore` keeps every `*.md` out except `README.md`, the `AGENTS.md` files and `slides/slides.md`. A new working document is ignored by default; do not force-add it.

## Rules

- Stay inside this folder. Never modify other workshop folders in this repo.
- Facts about Pulumi and Azure products come from the docs listed under "Sources" in `README.md`. If a doc is unclear, write down the question instead of guessing.
- Canonical names: Pulumi Neo, Pulumi ESC, Pulumi Cloud, Pulumi IaC, Pulumi Policies, Pulumi console (lowercase console). Never "Copilot", "Pulumi Service", "Insights", "CrossGuard".
- Conventional Commits scoped to this folder, for example `feat(azure-policy-as-code-pulumi-policies): ...`.
- Do not commit credentials, `node_modules/`, `dist/`, `Pulumi.dev.yaml`, state or recordings.

## Code conventions

- One npm workspace at the folder root. Versions are pinned exactly in each `package.json`; do not float them. TypeScript stays on 6.0.3.
- Steps 2 to 8 repeat the earlier program on purpose: each folder runs on its own. When you change a step, carry the change forward through every later step.
- `azure-storage-baseline.ts` is the same file in steps 6, 7 and 8. Keep the three copies identical.
- Step 6 moves resources into the component with `aliases`; the old logical names are the ones from step 5. Check `pulumi preview` shows no replace.
- Keep `effect` at `Audit` by default. Deny belongs to step 7 only.
- Every command on a slide must be one the demo runs, with the same flags.

## Checks before you push

```bash
npm install
for d in 0*/; do (cd "$d" && npx tsc --noEmit -p .); done
(cd 08-policy-pack/policy-pack && npm test)
shellcheck scripts/*.sh
```
