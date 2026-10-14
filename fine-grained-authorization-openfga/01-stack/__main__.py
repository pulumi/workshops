import json
import os

import pulumi
import pulumi_docker as docker

from openfga_dynamic import OpenFgaAuthModelResource, OpenFgaStoreResource, OpenFgaTuplesResource
from tuples import TUPLES

OPENFGA_IMAGE = "openfga/openfga:v1.21.0"
API_URL = "http://localhost:8080"

config = pulumi.Config()
store_name = config.get("storeName") or "pulumi-workshop"

with open(os.path.join(os.path.dirname(__file__), "model.json")) as f:
    model = json.load(f)

# Step 1: the OpenFGA server, in-memory datastore, API on 8080 and playground on 3000.
image = docker.RemoteImage("openfga-image", name=OPENFGA_IMAGE, keep_locally=True)
container = docker.Container(
    "openfga",
    name="openfga-workshop",
    image=image.image_id,
    command=["run"],
    envs=["OPENFGA_DATASTORE_ENGINE=memory", "OPENFGA_PLAYGROUND_ENABLED=true"],
    ports=[
        docker.ContainerPortArgs(internal=8080, external=8080, ip="127.0.0.1"),
        docker.ContainerPortArgs(internal=3000, external=3000, ip="127.0.0.1"),
    ],
    must_run=True,
    restart="no",
)

# Step 2: the store.
store = OpenFgaStoreResource("store", api_url=API_URL, store_name=store_name,
                             opts=pulumi.ResourceOptions(depends_on=[container]))

# Step 3: the authorization model.
auth_model = OpenFgaAuthModelResource("model", api_url=API_URL, store_id=store.store_id, model=model)

# Step 4 and 6: the relationship tuples.
tuples = OpenFgaTuplesResource("tuples", api_url=API_URL, store_id=store.store_id,
                               authorization_model_id=auth_model.authorization_model_id,
                               tuples=TUPLES)

pulumi.export("api_url", API_URL)
pulumi.export("playground_url", "http://localhost:3000/playground")
pulumi.export("store_id", store.store_id)
pulumi.export("authorization_model_id", auth_model.authorization_model_id)
