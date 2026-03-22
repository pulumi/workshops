<!-- FOR AI AGENTS - Human readability is a side effect, not a goal -->
<!-- Managed by agent: keep sections and order; edit content, not structure -->
<!-- Last updated: 2026-03-22 | Last verified: 2026-03-22 -->

# AGENTS.md

**Precedence:** the **closest `AGENTS.md`** to the files you're changing wins. Root holds global defaults only.

## Overview

Pulumi workshops monorepo — 60+ self-contained workshop directories (TypeScript, Python, Go, C#, Java). Each workshop is independent with its own language, deps, and Pulumi config.

## Commands

| Task | Command | ~Time |
|------|---------|-------|
| Lint (UTM check) | `make lint` | ~5s |

> Checks all markdown links to `pulumi.com` include UTM: `utm_source=GitHub&utm_medium=referral&utm_campaign=workshops`

## Workflow

1. Read the target workshop's `README.md` before editing
2. Run `make lint` after modifying any markdown
3. Show lint output as evidence before claiming done

## Golden Samples

| For | Reference |
|-----|-----------|
| TypeScript | `aws-getting-started-k8s-ts/` |
| Python | `aws-getting-started-py/` |
| C# | `az-csharp-app/` |

## Heuristics

| When | Do |
|------|-----|
| Adding `pulumi.com` URL | Add UTM params (except `app.pulumi.com/new?template=` and `.png` URLs) |
| Editing `archive/` | Don't — frozen |
| New workshop | Follow naming conventions; include README.md + Pulumi.yaml |

## Boundaries

- **Always**: UTM on `pulumi.com` URLs, `make lint` before commit, workshops self-contained
- **Ask first**: New workshops, changes to `packages/` or `scripts/`, moving to/from `archive/`
- **Never**: Modify `archive/`, commit secrets, remove UTM codes, push to main

## Index of scoped AGENTS.md

> No scoped files — each workshop is self-contained. Read the workshop's `README.md` for context.

## When instructions conflict
The nearest `AGENTS.md` wins. Explicit user prompts override files.
