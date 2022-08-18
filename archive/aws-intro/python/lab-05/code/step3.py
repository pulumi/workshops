from pulumi import export, StackReference, Output, ResourceOptions
from pulumi_kubernetes import Provider
from pulumi_kubernetes.apps.v1 import Deployment
from pulumi_kubernetes.core.v1 import Service, Namespace
import pulumi

# Create StackReference to the Kubernetes cluster stack
config  = pulumi.Config()
stackRef = config.require("clusterStackRef");
infra = StackReference(f"{stackRef}")

# Declare a provider using the KubeConfig we created
# This will be used to interact with the EKS cluster
k8s_provider = Provider("k8s-provider", kubeconfig=infra.get_output("kubeconfig"))

# Create a Namespace object https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/
ns = Namespace("app-ns",
    metadata={
       "name": "joe-duffy",
    },
    opts=ResourceOptions(provider=k8s_provider)
)

app_labels = {
    "app": "iac-workshop"
}
app_deployment = Deployment("app-dep",
    metadata={
        "namespace": ns.metadata["name"]
    },
    spec={
        "selector": {
            "match_labels": app_labels,
        },
        "replicas": 1,
        "template": {
            "metadata": {
                "labels": app_labels,
            },
            "spec": {
                "containers": [{
                    "name": "iac-workshop",
                    "image": "gcr.io/google-samples/kubernetes-bootcamp:v1",
                }],
            },
        },
    },
    opts=ResourceOptions(provider=k8s_provider)
)
