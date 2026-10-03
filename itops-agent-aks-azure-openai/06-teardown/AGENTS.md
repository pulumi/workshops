`teardown.sh` destroys all five stacks in reverse dependency order, then
verifies the resource group is empty and purges any soft-deleted Cognitive
Services account. It is idempotent and safe to re-run.

Check with: `shellcheck --rcfile ../.shellcheckrc teardown.sh`
