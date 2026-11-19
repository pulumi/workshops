#!/usr/bin/env bash
# Run one OpenFGA Check call and print the answer.
#   ./check.sh agent:deploy-bot can_deploy stack:production
# Prints the request, then the response, then "allowed: true|false".
set -euo pipefail

if [ "$#" -ne 3 ]; then
  echo "usage: $0 <user> <relation> <object>" >&2
  exit 2
fi
# shellcheck source=lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

user="$1" relation="$2" object="$3"
store_id="$(stack_output store_id)"
model_id="$(stack_output authorization_model_id)"

body="$(printf '{"tuple_key":{"user":"%s","relation":"%s","object":"%s"},"authorization_model_id":"%s"}' \
  "$user" "$relation" "$object" "$model_id")"

echo "POST $API_URL/stores/$store_id/check"
echo "$body"
response="$(curl -sS -X POST "$API_URL/stores/$store_id/check" \
  -H 'content-type: application/json' -d "$body")"
echo "$response"
case "$response" in
  *'"allowed":true'*) echo "allowed: true" ;;
  *'"allowed":false'*) echo "allowed: false" ;;
  *) echo "unexpected response" >&2; exit 1 ;;
esac
