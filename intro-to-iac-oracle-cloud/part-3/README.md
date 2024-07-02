# Part 3 - Adding some Kubernetes

So, what if we want to stand up a Kubernetes cluster? Use the `__main__.py` file to copy over the code.

The deployment on this one takes some time as provisioning a Kubernetes cluster takes some time.

**Q:** Explore a bit about how we can use programming language syntax to get and use the kubeconfig. Where do you find that?

**Q:** What about those exports?

Let's try getting into the box!

```bash
$ KUBECONFIG=generated/kubeconfig kubectl get nodes
NAME          STATUS   ROLES   AGE    VERSION
10.0.10.115   Ready    node    4m4s   v1.23.4
10.0.10.121   Ready    node    4m6s   v1.23.4
10.0.10.248   Ready    node    4m8s   v1.23.4
```

As always, don't forget to tear down your sandbox!

```
$ pulumi destroy
```
