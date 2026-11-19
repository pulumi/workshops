# gcp-monitoring-service (02-service)

Pulumi TypeScript project, step 2: one Cloud Run v2 service (`hello-api`) on the public echo image `docker.io/mendhak/http-https-echo:42`. The `x-set-response-status-code` query parameter makes it answer with that status, which the break step uses.

## How to work here

- Stack: `dev` (config in `Pulumi.dev.yaml`). It imports the Pulumi ESC environment that mints short-lived Google Cloud credentials. Do not add keys or `gcp:credentials`.
- Region `europe-west3`; set `gcp:project` with `pulumi config set gcp:project <id>`.
- Run `pulumi preview` before `pulumi up`.
- Never run `pulumi destroy` here for the demo teardown; use `07-teardown/teardown.sh`.
- Keep the service public and the image tag pinned. Pulling the image on Cloud Run is not verified yet.
