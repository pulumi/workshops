"""OpenFGA relationship-based access control, provisioned as Pulumi code.

Brings up an OpenFGA container, then three OpenFGA resources on top of it:
a store, an authorization model (`stack` with `owner`/`viewer`/`deployer`
and the computed `can_view`/`can_deploy` relations) and a set of
relationship tuples. See openfga_dynamic.py for how each one talks to the
OpenFGA HTTP API; see model.json for the model itself.

Demo steps 1-4 and 6 (see the workshop README) live here. Steps 5 and 7
(the `Check` calls) are 02-checks/check.sh, run against the exports below.
Step 8 (teardown) is `pulumi destroy` plus 03-teardown/verify-teardown.sh.
"""

import json

import pulumi
import pulumi_docker as docker

from openfga_dynamic import OpenFgaAuthModel, OpenFgaStore, OpenFgaTuples

config = pulumi.Config()
store_name = config.get("storeName") or "pulumi-workshop"
api_port = config.get_int("apiPort") or 8080
playground_port = config.get_int("playgroundPort") or 3000

# Pinned to the OpenFGA v1.21.0 release (the latest tag on
# github.com/openfga/openfga/releases as of 2026-09-26, matching the
# release the brief's KubeCon EU 2026 evidence referenced).
OPENFGA_IMAGE = "openfga/openfga:v1.21.0"

# Step 1: the OpenFGA container itself, with an in-memory datastore. State
# does not need to survive between demo runs, so there is no volume and no
# Postgres sidecar to keep the 90-minute session simple.
openfga_image = docker.RemoteImage("openfga-image", name=OPENFGA_IMAGE, keep_locally=True)

openfga_container = docker.Container(
    "openfga-server",
    name="pulumi-workshop-openfga",
    image=openfga_image.repo_digest,
    command=["run"],
    envs=[
        "OPENFGA_DATASTORE_ENGINE=memory",
        "OPENFGA_PLAYGROUND_ENABLED=true",
        "OPENFGA_LOG_FORMAT=text",
    ],
    ports=[
        {"internal": 8080, "external": api_port},
        {"internal": 3000, "external": playground_port},
    ],
)

api_url = f"http://localhost:{api_port}"

# Step 2: the store. Depends on the container being up; the dynamic
# provider itself polls /healthz before calling POST /stores (see
# openfga_dynamic._wait_for_healthy).
openfga_store = OpenFgaStore(
    "openfga-store",
    api_url=api_url,
    store_name=store_name,
    opts=pulumi.ResourceOptions(depends_on=[openfga_container]),
)

# Step 3: the authorization model. Loaded from model.json rather than
# inlined here so the presenter's fallback (see the workshop README,
# "Risks and fallbacks") is the exact same file this program already uses,
# not a second copy that can drift.
with open("model.json", encoding="utf-8") as f:
    auth_model = json.load(f)

openfga_auth_model = OpenFgaAuthModel(
    "openfga-auth-model",
    api_url=api_url,
    store_id=openfga_store.store_id,
    model=auth_model,
    opts=pulumi.ResourceOptions(depends_on=[openfga_store]),
)

# Step 4: the tuples. `user:alice` owns the stack outright. `agent:deploy-bot`
# starts as a viewer only, which is deliberate: the Check in step 5 must
# come back `allowed: false` for `can_deploy` before the live edit below is
# made.
tuples = [
    {"user": "user:alice", "relation": "owner", "object": "stack:production"},
    {"user": "agent:deploy-bot", "relation": "viewer", "object": "stack:production"},
    # Step 6 (live, on stage): uncomment the next line and run `pulumi up`
    # again. That one-line diff is what promotes agent:deploy-bot from
    # viewer to deployer, and it is the reason the second Check in
    # 02-checks/check.sh flips to `allowed: true`.
    # {"user": "agent:deploy-bot", "relation": "deployer", "object": "stack:production"},
]

openfga_tuples = OpenFgaTuples(
    "openfga-tuples",
    api_url=api_url,
    store_id=openfga_store.store_id,
    tuples=tuples,
    opts=pulumi.ResourceOptions(depends_on=[openfga_auth_model]),
)

pulumi.export("api_url", api_url)
pulumi.export("playground_url", f"http://localhost:{playground_port}/playground")
pulumi.export("store_id", openfga_store.store_id)
pulumi.export("authorization_model_id", openfga_auth_model.authorization_model_id)
