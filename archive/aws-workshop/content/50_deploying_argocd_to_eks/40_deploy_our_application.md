+++
title = "Deploying our Application Stack"
chapter = false
weight = 40
+++

First, add the `StackReference` to the cluster stack, which is used to get the kubeconfig
from its stack output. This is a reference to the project created in the [previous lab]().

```bash
pulumi config set clusterStackRef workshops/eks-infrastructure/dev
```

Now we can deploy Everything:

```bash
pulumi up
```

This will show you a preview and, after selecting `yes`, the application will be deployed:

```
Updating (dev):
     Type                                                            Name                                  Status      Info
 +   pulumi:pulumi:Stack                                             argocd-dev                            created
 +   ├─ kubernetes:helm.sh:Chart                                     argocd                                created
 +   │  ├─ kubernetes:core:ServiceAccount                            argocd/argocd-server                  created
 +   │  ├─ kubernetes:core:ConfigMap                                 argocd/argocd-rbac-cm                 created
 +   │  ├─ kubernetes:core:ServiceAccount                            argocd/argocd-dex-server              created
 +   │  ├─ kubernetes:core:Service                                   argocd/argocd-redis                   created
 +   │  ├─ kubernetes:core:ConfigMap                                 argocd/argocd-tls-certs-cm            created
 +   │  ├─ kubernetes:core:ConfigMap                                 argocd/argocd-ssh-known-hosts-cm      created
 +   │  ├─ kubernetes:core:ConfigMap                                 argocd/argocd-cm                      created
 +   │  ├─ kubernetes:core:Service                                   argocd/argocd-repo-server             created
 +   │  ├─ kubernetes:core:Service                                   argocd/argocd-application-controller  created
 +   │  ├─ kubernetes:rbac.authorization.k8s.io:ClusterRole          argocd-application-controller         created
 +   │  ├─ kubernetes:core:Service                                   argocd/argocd-dex-server              created
 +   │  ├─ kubernetes:core:ServiceAccount                            argocd/argocd-application-controller  created
 +   │  ├─ kubernetes:core:Secret                                    argocd/argocd-secret                  created
 +   │  ├─ kubernetes:rbac.authorization.k8s.io:Role                 argocd/argocd-server                  created
 +   │  ├─ kubernetes:rbac.authorization.k8s.io:ClusterRoleBinding   argocd-server                         created
 +   │  ├─ kubernetes:core:Service                                   argocd/argocd-server                  created
 +   │  ├─ kubernetes:rbac.authorization.k8s.io:ClusterRole          argocd-server                         created
 +   │  ├─ kubernetes:rbac.authorization.k8s.io:RoleBinding          argocd/argocd-application-controller  created
 +   │  ├─ kubernetes:rbac.authorization.k8s.io:Role                 argocd/argocd-dex-server              created
 +   │  ├─ kubernetes:rbac.authorization.k8s.io:RoleBinding          argocd/argocd-dex-server              created
 +   │  ├─ kubernetes:rbac.authorization.k8s.io:Role                 argocd/argocd-application-controller  created
 +   │  ├─ kubernetes:rbac.authorization.k8s.io:RoleBinding          argocd/argocd-server                  created
 +   │  ├─ kubernetes:rbac.authorization.k8s.io:ClusterRoleBinding   argocd-application-controller         created
 +   │  ├─ kubernetes:apps:Deployment                                argocd/argocd-server                  created
 +   │  ├─ kubernetes:apps:Deployment                                argocd/argocd-application-controller  created
 +   │  ├─ kubernetes:apps:Deployment                                argocd/argocd-dex-server              created
 +   │  ├─ kubernetes:apps:Deployment                                argocd/argocd-repo-server             created
 +   │  ├─ kubernetes:apps:Deployment                                argocd/argocd-redis                   created
 +   │  ├─ kubernetes:apiextensions.k8s.io:CustomResourceDefinition  appprojects.argoproj.io               created     1 warning
 +   │  └─ kubernetes:apiextensions.k8s.io:CustomResourceDefinition  applications.argoproj.io              created     1 warning
 +   ├─ pulumi:providers:kubernetes                                  k8s                                   created
 +   └─ kubernetes:core:Namespace                                    argocd-ns                             created

Outputs:
    url: "http://ae7c37b7c510511eab4540a6f2211784-521581596.us-west-2.elb.amazonaws.com:80"

Resources:
    + 34 created

Duration: 1m3s

Permalink: https://app.pulumi.com/workshops/argocd/dev/updates/1
```

In order to check that everything has been deployed as expected, list the pods in your namespace:

```bash
kubectl get pods --namespace argocd
```

And you should see a number of pods:

```
NAME                                             READY   STATUS    RESTARTS   AGE
argocd-application-controller-64db95fccd-jkstk   1/1     Running   0          108s
argocd-dex-server-6b9cbf5598-znfpk               1/1     Running   0          108s
argocd-redis-6b7b6b766b-dkphm                    1/1     Running   0          107s
argocd-repo-server-7c9d75b48-tg5r8               1/1     Running   0          107s
argocd-server-7778cdd5-5f5vd                     1/1     Running   1          109s
```

The initial password for the ArgoCD server UI is the name of the pod that is running the application. Grab the name from the
post list e.g. `argocd-server-7778cdd5-5f5vd`. We can use the username `admin` to go with this.

Open the URL from the pulumi output in a browser and you can log in with this username and password combination
