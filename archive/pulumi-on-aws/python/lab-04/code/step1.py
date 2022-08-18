from pulumi import export
import pulumi_aws as aws

cluster = aws.ecs.Cluster("cluster")
