using Pulumi;

using K8s = Pulumi.Kubernetes;

class MyStack : Stack
{
    public MyStack()
    {
        var ns = new K8s.Core.V1.Namespace("app-ns", new K8s.Types.Inputs.Core.V1.NamespaceArgs
        {
            Metadata = new K8s.Types.Inputs.Meta.V1.ObjectMetaArgs { Name = "my-name" }
        });

        var appLabels = new InputMap<string> { { "app", "iac-workshop" } };
        var deployment = new K8s.Apps.V1.Deployment("app-dep", new K8s.Types.Inputs.Apps.V1.DeploymentArgs
        {
            Metadata = new K8s.Types.Inputs.Meta.V1.ObjectMetaArgs { Namespace = ns.Metadata.Apply(m => m.Name) },
            Spec = new K8s.Types.Inputs.Apps.V1.DeploymentSpecArgs
            {
                Selector = new K8s.Types.Inputs.Meta.V1.LabelSelectorArgs { MatchLabels = appLabels },
                Replicas = 1,
                Template = new K8s.Types.Inputs.Core.V1.PodTemplateSpecArgs
                {
                    Metadata = new K8s.Types.Inputs.Meta.V1.ObjectMetaArgs { Labels = appLabels },
                    Spec = new K8s.Types.Inputs.Core.V1.PodSpecArgs
                    {
                        Containers =
                        {
                            new K8s.Types.Inputs.Core.V1.ContainerArgs
                            {
                                Name = "iac-workshop",
                                Image = "gcr.io/google-samples/kubernetes-bootcamp:v1"
                            }
                        }
                    }
                }
            }
        });
    }
}
