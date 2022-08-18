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
    }
}
