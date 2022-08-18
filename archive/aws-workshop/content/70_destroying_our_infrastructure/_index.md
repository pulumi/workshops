+++
title = "Destroying our Infrastructure"
chapter = true
weight = 70
+++

# Destroying our Infrastructure

Please remember to destroy all of the infrastructure you have created in each of the projects. Starting with `sock-shop`, then `argocd` and lastly `eks-infrastructure` run the following
commands:

```bash
pulumi destroy
pulumi stack rm
```

{{% children showhidden="false" %}}
