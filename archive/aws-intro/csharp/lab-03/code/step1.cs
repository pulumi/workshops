using Pulumi;

class MyStack : Stack
{
    public MyStack()
    {
        var cluster = new Pulumi.Aws.Ecs.Cluster("app-cluster");
    }
}
