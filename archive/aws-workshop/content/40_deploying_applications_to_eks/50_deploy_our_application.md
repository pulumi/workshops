+++
title = "Deploying our Application Stack"
chapter = false
weight = 50
+++

First, add the `StackReference` to the cluster stack, which is used to get the kubeconfig
from its stack output. This is a reference to the project created in the [previous lab]().

```bash
pulumi config set clusterStackRef workshops/eks-infrastructure/dev
```

Deploy Everything:

```bash
pulumi up
```

This will show you a preview and, after selecting `yes`, the application will be deployed:

```
Updating (dev):
     Type                            Name               Status
 +   pulumi:pulumi:Stack             eks-demo-apps-dev  created
 +   ├─ pulumi:providers:kubernetes  k8sProvider        created
 +   ├─ kubernetes:core:Namespace    eks-demo-apps-ns   created
 +   ├─ kubernetes:apps:Deployment   eks-demo-apps-dep  created
 +   └─ kubernetes:core:Service      eks-demo-apps-svc  created

Outputs:
    url: "http://ae7c37b7c510511eab4540a6f2211784-521581596.us-west-2.elb.amazonaws.com:80"

Resources:
    + 5 created

Duration: 32s

Permalink: https://app.pulumi.com/workshops/eks-demo-apps/dev/updates/1
```

List the pods in your namespace, again replacing `eks-demo-apps` with the namespace you chose earlier:

```bash
kubectl get pods --namespace eks-demo-apps
```

And you should see a single replica:

```
NAME                                READY   STATUS    RESTARTS   AGE
app-dep-9p399mj2-6c7cdd7d79-7w7vj   1/1     Running   0          0m15s
```
