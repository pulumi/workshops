+++
title = "Deploying our Application Stack"
chapter = false
weight = 40
+++

First, add the `StackReferences` to the cluster and argoCD stacks, which will be used to get the kubeconfig and 
argocd namespace from their stack outputs.

```bash
pulumi config set clusterStackRef workshops/eks-infrastructure/dev
pulumi config set argoCDStackRef workshops/argocd/dev
```

Now we can deploy Everything:

```bash
pulumi up
```

This will show you a preview and, after selecting `yes`, the application will be deployed:

```
Updating (dev):
     Type                                      Name            Status
 +   pulumi:pulumi:Stack                       socks-shop-dev  created
 +   ├─ pulumi:providers:kubernetes            k8sProvider     created
 +   └─ kubernetes:core:Namespace              sock-shop-ns    created
 +      └─ kubernetes:argoproj.io:Application  sock-shop       created

Resources:
    + 4 created

Duration: 25s

Permalink: https://app.pulumi.com/workshops/sock-shop/dev/updates/1
```

In order to check that everything has been deployed as expected, list the pods in your namespace:

```bash
kubectl get svc -n sock-shop
```

And you should see a number of pods:

```
NAME           TYPE           CLUSTER-IP       EXTERNAL-IP                                                               PORT(S)             AGE
carts-db       ClusterIP      172.20.185.23    <none>                                                                    27017/TCP           46s
catalogue      ClusterIP      172.20.219.245   <none>                                                                    80/TCP              45s
catalogue-db   ClusterIP      172.20.242.113   <none>                                                                    3306/TCP            45s
front-end      LoadBalancer   172.20.224.217   a001d1dfbb58d44bf9c990602afcca1f-1776126796.us-west-2.elb.amazonaws.com   80:30001/TCP        46s
orders         ClusterIP      172.20.130.169   <none>                                                                    80/TCP              46s
orders-db      ClusterIP      172.20.118.187   <none>                                                                    27017/TCP           45s
payment        ClusterIP      172.20.113.41    <none>                                                                    80/TCP              46s
queue-master   ClusterIP      172.20.247.113   <none>                                                                    80/TCP              45s
rabbitmq       ClusterIP      172.20.62.136    <none>                                                                    5672/TCP,9090/TCP   45s
session-db     ClusterIP      172.20.58.212    <none>                                                                    6379/TCP            45s
shipping       ClusterIP      172.20.122.90    <none>                                                                    80/TCP              46s
user           ClusterIP      172.20.178.186   <none>                                                                    80/TCP              45s
user-db        ClusterIP      172.20.109.34    <none>                                                                    27017/TCP           45s
```

We can use the url attached to the `front-end` LoadBalancer to view the application via our browser. Please note the url is http NOT https.

We can also see how the deployment looks in our ArgoCD instance `https://<ARGOURL>/applications/sock-shop`.


