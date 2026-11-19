# AGENTS.md: fine-grained-authorization-openfga

Guidance for coding agents (and humans) working in this workshop folder of
`pulumi/workshops`.

## What this folder is

The demo code for the workshop "Fine-grained authorization as code: OpenFGA
relationship-based access control with Pulumi". See `README.md` for the layout
and how to run the demo.

## Rules

- Every command in the README is one the demo runs, with the same flags. Change the code and the README together.
- Pins live in `01-stack/requirements.txt` and in `OPENFGA_IMAGE` in `01-stack/__main__.py`. Check them against PyPI and the OpenFGA releases page before you change them.
- Working documents (`*.md` other than `README.md`, `AGENTS.md` and `slides/slides.md`) are ignored by `.gitignore` on purpose. Do not force-add one.
- Never commit `venv/`, Pulumi state, passphrases or recordings.
- Run `shellcheck` on every script in `02-checks/` and `03-teardown/`; `.shellcheckrc` sets the options.
- `01-stack/tuples.py` carries a `# GRANT` marker that `02-checks/grant-deployer.sh` and `02-checks/reset-grant.sh` edit with `sed`. Keep the line format `    # GRANT {...},` intact.
- `01-stack/openfga_dynamic.py` imports `requests` inside the methods because Pulumi serializes the provider classes.
