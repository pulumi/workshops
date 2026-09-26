"""Pulumi dynamic resource providers for OpenFGA.

Pulumi has no dedicated OpenFGA provider (verified against the Pulumi
Registry on 2026-09-26). These three dynamic resources orchestrate the
OpenFGA HTTP API directly so a store, an authorization model and a set of
relationship tuples are each a real Pulumi resource with its own diff and
lifecycle, instead of one opaque shell-out.

Each provider talks only to the OpenFGA container's HTTP API
(https://openfga.dev/api/service) on localhost; nothing here reaches the
network beyond that container.
"""

import time
from typing import Any, Optional

import requests
from pulumi.dynamic import (
    CheckResult,
    CreateResult,
    DiffResult,
    Resource,
    ResourceProvider,
    UpdateResult,
)
import pulumi


def _wait_for_healthy(api_url: str, timeout_seconds: int = 30) -> None:
    """Poll the OpenFGA container's health endpoint until it answers.

    The Pulumi program starts the container and the store in the same
    `pulumi up`; nothing guarantees the HTTP API is already accepting
    connections the instant the container resource reports created. Fail
    loudly if it never comes up rather than letting the first API call
    raise a bare connection error.
    """
    deadline = time.monotonic() + timeout_seconds
    last_error: Optional[Exception] = None
    while time.monotonic() < deadline:
        try:
            resp = requests.get(f"{api_url}/healthz", timeout=2)
            if resp.status_code == 200:
                return
        except requests.RequestException as exc:
            last_error = exc
        time.sleep(1)
    raise RuntimeError(
        f"OpenFGA at {api_url} did not become healthy within "
        f"{timeout_seconds}s: {last_error}"
    )


class OpenFgaStoreProvider(ResourceProvider):
    """Creates and deletes an OpenFGA store via POST/DELETE /stores."""

    def check(self, _olds: dict, news: dict) -> CheckResult:
        failures = []
        if not news.get("api_url"):
            failures.append(pulumi.dynamic.CheckFailure("api_url", "api_url is required"))
        if not news.get("store_name"):
            failures.append(pulumi.dynamic.CheckFailure("store_name", "store_name is required"))
        return CheckResult(news, failures)

    def create(self, props: dict) -> CreateResult:
        api_url = props["api_url"]
        _wait_for_healthy(api_url)
        resp = requests.post(f"{api_url}/stores", json={"name": props["store_name"]}, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        outs = dict(props)
        outs["store_id"] = data["id"]
        return CreateResult(id_=data["id"], outs=outs)

    def diff(self, _id: str, old_inputs: dict, new_inputs: dict) -> DiffResult:
        # OpenFGA stores are immutable: renaming one means creating a new
        # store and deleting the old one, never an in-place update.
        changed = old_inputs.get("store_name") != new_inputs.get("store_name") or (
            old_inputs.get("api_url") != new_inputs.get("api_url")
        )
        replaces = ["store_name", "api_url"] if changed else []
        return DiffResult(changes=changed, replaces=replaces, delete_before_replace=True)

    def delete(self, id_: str, props: dict) -> None:
        api_url = props["api_url"]
        try:
            requests.delete(f"{api_url}/stores/{id_}", timeout=10)
        except requests.RequestException:
            # Best-effort: the container is usually torn down in the same
            # `pulumi destroy` right after this, so a store that outlives
            # its container for a few seconds is not a leak worth failing
            # the whole destroy over.
            pass


class OpenFgaStore(Resource):
    """A named OpenFGA store, provisioned by the OpenFGA HTTP API."""

    store_id: pulumi.Output[str]

    def __init__(self, name: str, api_url: pulumi.Input[str], store_name: pulumi.Input[str],
                 opts: Optional[pulumi.ResourceOptions] = None):
        super().__init__(
            OpenFgaStoreProvider(),
            name,
            {"api_url": api_url, "store_name": store_name, "store_id": None},
            opts,
        )


class OpenFgaAuthModelProvider(ResourceProvider):
    """Publishes an authorization model via POST /stores/{id}/authorization-models.

    OpenFGA authorization models are append-only: there is no PUT/PATCH and
    no DELETE for a specific model version (see "Immutable Authorization
    Models", https://openfga.dev/docs/getting-started/immutable-models,
    read 2026-09-26). A model change is always a new model version, never
    an in-place update, so diff() always requests a replace and delete() is
    a no-op — the old version simply stops being referenced.
    """

    def create(self, props: dict) -> CreateResult:
        api_url = props["api_url"]
        store_id = props["store_id"]
        resp = requests.post(
            f"{api_url}/stores/{store_id}/authorization-models",
            json=props["model"],
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        outs = dict(props)
        outs["authorization_model_id"] = data["authorization_model_id"]
        return CreateResult(id_=data["authorization_model_id"], outs=outs)

    def diff(self, _id: str, old_inputs: dict, new_inputs: dict) -> DiffResult:
        changed = old_inputs.get("model") != new_inputs.get("model") or (
            old_inputs.get("store_id") != new_inputs.get("store_id")
        )
        return DiffResult(changes=changed, replaces=["model", "store_id"] if changed else [])

    def delete(self, _id: str, _props: dict) -> None:
        # No API to delete a specific authorization model version; the
        # store's deletion (or its in-memory datastore going away) is what
        # actually reclaims it.
        return None


class OpenFgaAuthModel(Resource):
    """An authorization model version published to a store."""

    authorization_model_id: pulumi.Output[str]

    def __init__(self, name: str, api_url: pulumi.Input[str], store_id: pulumi.Input[str],
                 model: dict, opts: Optional[pulumi.ResourceOptions] = None):
        super().__init__(
            OpenFgaAuthModelProvider(),
            name,
            {"api_url": api_url, "store_id": store_id, "model": model, "authorization_model_id": None},
            opts,
        )


def _tuple_key(t: dict) -> tuple:
    return (t["user"], t["relation"], t["object"])


class OpenFgaTuplesProvider(ResourceProvider):
    """Reconciles a desired set of relationship tuples via POST /stores/{id}/write.

    This is the one resource in the stack that supports an honest in-place
    update: adding `agent:deploy-bot` as `deployer` on `stack:production` in
    the Python list below and running `pulumi up` again computes the tuple
    added since the last apply and writes only that one, leaving every
    other tuple (and the deny case fact that produced it) untouched. That
    diff, not a manual API call, is the point of the whole demo.
    """

    def create(self, props: dict) -> CreateResult:
        api_url = props["api_url"]
        store_id = props["store_id"]
        tuples = props["tuples"]
        if tuples:
            resp = requests.post(
                f"{api_url}/stores/{store_id}/write",
                json={"writes": {"tuple_keys": tuples}},
                timeout=10,
            )
            resp.raise_for_status()
        outs = dict(props)
        return CreateResult(id_=f"{store_id}-tuples", outs=outs)

    def diff(self, _id: str, old_inputs: dict, new_inputs: dict) -> DiffResult:
        if old_inputs.get("store_id") != new_inputs.get("store_id"):
            return DiffResult(changes=True, replaces=["store_id"], delete_before_replace=True)
        old_keys = {_tuple_key(t) for t in old_inputs.get("tuples", [])}
        new_keys = {_tuple_key(t) for t in new_inputs.get("tuples", [])}
        return DiffResult(changes=old_keys != new_keys, replaces=[])

    def update(self, _id: str, old_props: dict, new_props: dict) -> UpdateResult:
        api_url = new_props["api_url"]
        store_id = new_props["store_id"]
        old_keys = {_tuple_key(t): t for t in old_props.get("tuples", [])}
        new_keys = {_tuple_key(t): t for t in new_props.get("tuples", [])}
        additions = [t for k, t in new_keys.items() if k not in old_keys]
        removals = [t for k, t in old_keys.items() if k not in new_keys]
        body: dict[str, Any] = {}
        if additions:
            body["writes"] = {"tuple_keys": additions}
        if removals:
            body["deletes"] = {"tuple_keys": removals}
        if body:
            resp = requests.post(f"{api_url}/stores/{store_id}/write", json=body, timeout=10)
            resp.raise_for_status()
        return UpdateResult(outs=dict(new_props))

    def delete(self, _id: str, props: dict) -> None:
        # The store delete that follows removes every tuple with it; no
        # separate cleanup call needed here.
        return None


class OpenFgaTuples(Resource):
    """The full set of relationship tuples written to a store."""

    def __init__(self, name: str, api_url: pulumi.Input[str], store_id: pulumi.Input[str],
                 tuples: list, opts: Optional[pulumi.ResourceOptions] = None):
        super().__init__(
            OpenFgaTuplesProvider(),
            name,
            {"api_url": api_url, "store_id": store_id, "tuples": tuples},
            opts,
        )
