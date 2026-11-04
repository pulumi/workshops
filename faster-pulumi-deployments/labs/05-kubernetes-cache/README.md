# Lab 5: Persist Kubernetes runner caches

Use a dedicated test cluster and an existing customer-managed runner installation. The template interface below was tested with agent `v2.3.2`: it reads `/mnt/worker-pod.json` and merges configuration into the `pulumi-workflow` execution container. The file accepts YAML despite its extension.

The files are in [kubernetes](../../kubernetes): a PVC, a worker template, and an agent Deployment mount patch. Apply the PVC in the namespace where jobs run:

```bash
kubectl --context <test-context> -n <runner-namespace> apply -f kubernetes/cache-pvc.yaml
kubectl --context <test-context> -n <runner-namespace> create configmap workflow-cache-template \
    --from-file=worker-pod.json=kubernetes/worker-pod.yaml \
    --dry-run=client -o yaml | \
    kubectl --context <test-context> -n <runner-namespace> apply -f -
```

If your agent already has a template mounted at that path, extend it instead of creating a second mount. Otherwise, adjust the agent container name in the mount patch and apply it:

```bash
kubectl --context <test-context> -n <runner-namespace> patch deployment <agent-deployment> \
    --type=strategic --patch-file kubernetes/agent-template-mount.yaml
```

The [provided agent component](https://github.com/pulumi/customer-managed-workflow-agent/tree/main/kubernetes#loading-pod-specification-into-the-agent) also accepts a `podTemplate` argument and manages this mount. Preserve the generated container command and required mounts. Restart the agent after changing a ConfigMap mounted with `subPath`.

For the TypeScript project, skip automatic dependency installation and use `npm ci` in a pre-run command. Confirm that `npm config get cache` returns `/cache/npm` inside the job Pod. Run once to populate it, then run `npm ci --offline` in a replacement Pod as a diagnostic. `npm cache verify` reports the retained contents. Restore ordinary installation for normal operations so new dependencies can be downloaded.

For private npm packages, use the [npm configuration example](../../config/npmrc.example), expose `NPM_TOKEN` from an ESC environment, and run `pulumi env run <org>/build/artifactory -- npm ci`. Test your actual Artifactory configuration separately. Stack-imported ESC values are not automatically available to pre-run commands.

Repeat the test with two agents and two different stacks. `ReadWriteOnce` permits multiple Pods on one node, but does not provide cross-node mounting. Check volume scheduling and cache contention before increasing concurrency.

Go can persist both its module and build caches; Python can persist its package-manager cache. Avoid sharing concurrently modified installed dependency trees. Mount only the Pulumi plugin directory if you add plugin persistence, not a credential-containing home directory.

## Reuse executor image layers on the nodes

Kubernetes image caching is separate from the PVC above. Each node's container runtime stores downloaded image layers. Replacement job Pods can reuse those layers on the same node. Pods scheduled onto another node need that node's own copy.

Pin the executor image by digest in deployment settings. To use an existing local image, merge this field into the worker template:

```yaml
spec:
  containers:
    - name: pulumi-workflow
      imagePullPolicy: IfNotPresent
```

Keep the existing environment variables and mounts when you merge this example. Configure the execution container, not only the long-running agent. The agent component's `agentImagePullPolicy` also controls its helper image; that setting alone does not set the executor container's policy.

`Always` still reuses local layers when the resolved image digest is present. It checks the registry before launch. `IfNotPresent` uses the existing local image, which is predictable when you select an immutable digest. See the [Kubernetes image-pull rules](https://kubernetes.io/docs/concepts/containers/images/#image-pull-policy).

A stable runner node pool can retain common base layers across releases. Put stable tools and provider installation before frequently changed program files in the image recipe. A new program then needs only changed layers where their content differs. Node replacement and image garbage collection can make the next job cold again.

For predictable startup, pre-pull a release onto the eligible nodes before its rollout. A DaemonSet can arrange a pull on each matching node. Record that preparation time separately. A nearby registry or pull-through cache reduces remote transfer costs but does not replace the node-local cache.

Measure three cases separately: a fresh node, the same image on a retained node, and a new release sharing existing layers. Record the node name and Pod events, including image pulls. A fresh Pod alone does not establish a cold-image test.

With Docker-in-Docker runners, executor images live in the inner Docker daemon's store. Node-level caching of the outer Pod image does not preserve that inner store when the daemon is replaced.

Continue to [lab 6](../06-rollout/README.md).
