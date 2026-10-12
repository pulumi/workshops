#!/usr/bin/env bash
# Shared settings for the step scripts. Source it, do not run it.
# shellcheck disable=SC2034
set -euo pipefail

: "${ORG:?Set ORG to your Pulumi Cloud organization, for example: export ORG=acme}"
ESC_PROJECT="${ESC_PROJECT:-s3-baseline}"
ESC_ENV="${ESC_ENV:-aws}"
ESC_REF="${ORG}/${ESC_PROJECT}/${ESC_ENV}"
POLICY_GROUP="${POLICY_GROUP:-s3-baseline-workshop}"
REGION="eu-central-1"
