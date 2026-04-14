set shell := ["zsh", "-cu"]

default:
  @just --list

build:
  npm run build

test-local:
  npm run test:local

start-local:
  -lsof -ti:7001,7070 | xargs kill 2>/dev/null || true
  [ -d node_modules ] || npm install
  npm run build
  npm run start:local

preview stage="infra-events":
  cd {{stage}} && pulumi preview

up stage="infra-events":
  cd {{stage}} && pulumi up --yes

destroy stage="infra-events":
  cd {{stage}} && pulumi destroy --yes

stack-outputs stage="infra-events":
  cd {{stage}} && pulumi stack output

board stage="infra-events":
  curl -s "$(cd {{stage}} && pulumi stack output publicApiUrl)"/api/board | jq

webhook stage="infra-events" title="Justfile demo event" source_type="github" external_id="demo#1":
  curl -s -X POST "$(cd {{stage}} && pulumi stack output publicApiUrl)"/webhooks/external \
    -H 'content-type: application/json' \
    -d '{"title":"{{title}}","sourceType":"{{source_type}}","externalId":"{{external_id}}"}' | jq

frontend stage="infra-events":
  open "$(cd {{stage}} && pulumi stack output frontendUrl)"

api stage="infra-events":
  open "$(cd {{stage}} && pulumi stack output publicApiUrl)"/api/board
