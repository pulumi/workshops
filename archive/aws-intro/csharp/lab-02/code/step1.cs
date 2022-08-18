using Pulumi;

class MyStack : Stack
{
    public MyStack()
    {
        var ami = Output.Create(Pulumi.Aws.Invokes.GetAmi(new Pulumi.Aws.GetAmiArgs
        {
            MostRecent = true,
            Owners = {"137112412989"},
            Filters = {new Pulumi.Aws.Inputs.GetAmiFiltersArgs
            {
                Name = "name", Values = {"amzn-ami-hvm-*"}
            }}
        }));
        
        var group = new Pulumi.Aws.Ec2.SecurityGroup("web-secgrp", new Pulumi.Aws.Ec2.SecurityGroupArgs
        {
            Description = "Enable HTTP access",
            Ingress =
            {
                new Pulumi.Aws.Ec2.Inputs.SecurityGroupIngressArgs
                {
                    Protocol = "tcp",
                    FromPort = 80,
                    ToPort = 80,
                    CidrBlocks = {"0.0.0.0/0"}
                },
                new Pulumi.Aws.Ec2.Inputs.SecurityGroupIngressArgs
                {
                    Protocol = "icmp",
                    FromPort = 8,
                    ToPort = 80,
                    CidrBlocks = {"0.0.0.0/0"}
                }
            }
        });
        
        var userData = @"
#!/bin/bash
echo ""Hello, World!"" > index.html
nohup python -m SimpleHTTPServer 80 &
";

        var server = new Pulumi.Aws.Ec2.Instance("web-server-www", new Pulumi.Aws.Ec2.InstanceArgs
        {
            InstanceType = "t2.micro",
            VpcSecurityGroupIds = {group.Id},
            UserData = userData,
            Ami = ami.Apply(a => a.Id)
        });
        
        this.PublicIp = server.PublicIp;
        this.PublicDns = server.PublicDns;
    }
    
    [Output] public Output<string> PublicIp { get; set; }
    [Output] public Output<string> PublicDns { get; set; }
}
