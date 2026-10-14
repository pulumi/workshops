"""Pulumi dynamic resources that call the OpenFGA HTTP API.

There is no native OpenFGA Pulumi provider, so each resource below wraps the
API calls in a pulumi.dynamic.ResourceProvider. `requests` is imported inside
the methods because Pulumi serializes the provider class.
"""
import pulumi
from pulumi.dynamic import CreateResult, DiffResult, Resource, ResourceProvider, UpdateResult


def _wait_until_healthy(api_url, timeout=60):
    import time
    import requests

    deadline = time.time() + timeout
    while True:
        try:
            if requests.get(f"{api_url}/healthz", timeout=2).status_code == 200:
                return
        except requests.RequestException:
            pass
        if time.time() > deadline:
            raise Exception(f"OpenFGA at {api_url} did not become healthy within {timeout}s")
        time.sleep(1)


def _post(url, body):
    import requests

    r = requests.post(url, json=body, timeout=15)
    if r.status_code >= 300:
        raise Exception(f"POST {url} failed: {r.status_code} {r.text}")
    return r.json()


class _StoreProvider(ResourceProvider):
    def create(self, props):
        _wait_until_healthy(props["api_url"])
        store = _post(f"{props['api_url']}/stores", {"name": props["name"]})
        return CreateResult(id_=store["id"], outs={**props, "store_id": store["id"]})

    def diff(self, _id, olds, news):
        # A store name or API URL change means a new store.
        replace = [k for k in ("name", "api_url") if olds.get(k) != news.get(k)]
        return DiffResult(changes=bool(replace), replaces=replace, delete_before_replace=True)

    def delete(self, _id, props):
        import requests

        r = requests.delete(f"{props['api_url']}/stores/{_id}", timeout=15)
        if r.status_code not in (200, 204, 404):
            raise Exception(f"DELETE store {_id} failed: {r.status_code} {r.text}")


class OpenFgaStoreResource(Resource):
    store_id: pulumi.Output[str]

    def __init__(self, name, api_url, store_name, opts=None):
        super().__init__(_StoreProvider(), name,
                         {"api_url": api_url, "name": store_name, "store_id": None}, opts)


class _ModelProvider(ResourceProvider):
    def create(self, props):
        res = _post(f"{props['api_url']}/stores/{props['store_id']}/authorization-models", props["model"])
        return CreateResult(id_=res["authorization_model_id"],
                            outs={**props, "authorization_model_id": res["authorization_model_id"]})

    def diff(self, _id, olds, news):
        # Authorization models are immutable in OpenFGA: a change writes a new version.
        changed = olds.get("model") != news.get("model") or olds.get("store_id") != news.get("store_id")
        return DiffResult(changes=changed, replaces=["model"] if changed else [], delete_before_replace=False)

    def delete(self, _id, props):
        # OpenFGA has no endpoint to delete a model; deleting the store removes it.
        return


class OpenFgaAuthModelResource(Resource):
    authorization_model_id: pulumi.Output[str]

    def __init__(self, name, api_url, store_id, model, opts=None):
        super().__init__(_ModelProvider(), name,
                         {"api_url": api_url, "store_id": store_id, "model": model,
                          "authorization_model_id": None}, opts)


def _keys(tuples):
    return [{"user": t["user"], "relation": t["relation"], "object": t["object"]} for t in tuples]


class _TuplesProvider(ResourceProvider):
    def _write(self, props, writes, deletes):
        body = {"authorization_model_id": props["authorization_model_id"]}
        if writes:
            body["writes"] = {"tuple_keys": _keys(writes)}
        if deletes:
            body["deletes"] = {"tuple_keys": _keys(deletes)}
        if writes or deletes:
            _post(f"{props['api_url']}/stores/{props['store_id']}/write", body)

    def create(self, props):
        self._write(props, props["tuples"], [])
        return CreateResult(id_=f"{props['store_id']}-tuples", outs=props)

    def diff(self, _id, olds, news):
        return DiffResult(changes=olds.get("tuples") != news.get("tuples")
                          or olds.get("authorization_model_id") != news.get("authorization_model_id"))

    def update(self, _id, olds, news):
        old = {(t["user"], t["relation"], t["object"]) for t in olds["tuples"]}
        new = {(t["user"], t["relation"], t["object"]) for t in news["tuples"]}
        writes = [t for t in news["tuples"] if (t["user"], t["relation"], t["object"]) not in old]
        deletes = [t for t in olds["tuples"] if (t["user"], t["relation"], t["object"]) not in new]
        self._write(news, writes, deletes)
        return UpdateResult(outs=news)

    def delete(self, _id, props):
        import requests

        # If the store is already gone there is nothing left to delete.
        if requests.get(f"{props['api_url']}/stores/{props['store_id']}", timeout=15).status_code == 404:
            return
        self._write(props, [], props["tuples"])


class OpenFgaTuplesResource(Resource):
    def __init__(self, name, api_url, store_id, authorization_model_id, tuples, opts=None):
        super().__init__(_TuplesProvider(), name,
                         {"api_url": api_url, "store_id": store_id,
                          "authorization_model_id": authorization_model_id, "tuples": tuples}, opts)
