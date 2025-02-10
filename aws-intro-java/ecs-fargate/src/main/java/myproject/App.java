package myproject;

import com.pulumi.Pulumi;
import com.pulumi.aws.alb.*;
import com.pulumi.aws.alb.inputs.ListenerDefaultActionArgs;
import com.pulumi.aws.ec2.SecurityGroup;
import com.pulumi.aws.ec2.SecurityGroupArgs;
import com.pulumi.aws.ec2.inputs.SecurityGroupEgressArgs;
import com.pulumi.aws.ec2.inputs.SecurityGroupIngressArgs;
import com.pulumi.aws.ecs.*;
import com.pulumi.aws.ecs.inputs.ServiceLoadBalancerArgs;
import com.pulumi.aws.ecs.inputs.ServiceNetworkConfigurationArgs;
import com.pulumi.aws.iam.Role;
import com.pulumi.aws.iam.RoleArgs;
import com.pulumi.aws.iam.RolePolicyAttachment;
import com.pulumi.aws.iam.RolePolicyAttachmentArgs;
import com.pulumi.awsx.ec2.Vpc;
import com.pulumi.core.Output;
import com.pulumi.resources.CustomResourceOptions;

public class App {

    public static void main(String[] args) {
        Pulumi.run(ctx -> {
            var cluster = new Cluster("cluster");

            var vpc = new Vpc("vpc");

            var lbSecurityGroup = new SecurityGroup("lb-secgrp", SecurityGroupArgs
                    .builder()
                    .description("Enable HTTP ingress from anywhere, enable HTTP egress to the CIDR block.")
                    .vpcId(vpc.vpcId())
                    .ingress(
                            SecurityGroupIngressArgs.builder()
                                    .protocol("tcp")
                                    .fromPort(80)
                                    .toPort(80)
                                    .cidrBlocks("0.0.0.0/0")
                                    .build())
                    .egress(
                            SecurityGroupEgressArgs.builder()
                                    .protocol("tcp")
                                    .fromPort(80)
                                    .toPort(80)
                                    .cidrBlocks(Output.all(vpc.vpc().apply(com.pulumi.aws.ec2.Vpc::cidrBlock)))
                                    .build()
                    )
                    .build());


            var loadBalancer = new LoadBalancer("app-lb",
                    LoadBalancerArgs.builder()
                            .internal(false)
                            .securityGroups(Output.all(lbSecurityGroup.id()))
                            .subnets(vpc.publicSubnetIds())
                            .loadBalancerType("application")
                            .build()
            );

            var targetGroup = new TargetGroup("app-tg",
                    TargetGroupArgs.builder()
                            .port(80)
                            .protocol("HTTP")
                            .targetType("ip")
                            .vpcId(vpc.vpcId())
                            .build()
            );

            var albListener = new Listener("web",
                    ListenerArgs.builder()
                            .loadBalancerArn(loadBalancer.arn())
                            .port(80)
                            .defaultActions(
                                    ListenerDefaultActionArgs.builder()
                                            .type("forward")
                                            .targetGroupArn(targetGroup.arn())
                                            .build())
                            .build()
            );

            var role = new Role("task-exec-role",
                    RoleArgs.builder()
                            .assumeRolePolicy("""
                                    {
                                        "Version": "2008-10-17",
                                        "Statement": [
                                            {
                                                "Sid": "",
                                                "Effect": "Allow",
                                                "Principal": {"Service": "ecs-tasks.amazonaws.com"},
                                                "Action": "sts:AssumeRole"
                                            }
                                        ]
                                    }""")
                            .build()
            );

            new RolePolicyAttachment("task-exec-policy",
                    RolePolicyAttachmentArgs.builder()
                            .role(role.name())
                            .policyArn("arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy")
                            .build()
            );

            var taskDefinition = new TaskDefinition("app-task",
                    TaskDefinitionArgs.builder()
                            .family("fargate-task-definition")
                            .cpu("256")
                            .memory("512")
                            .networkMode("awsvpc")
                            .requiresCompatibilities("FARGATE")
                            .executionRoleArn(role.arn())
                            .containerDefinitions("""
                                    [
                                        {
                                            "name": "my-app",
                                            "image": "nginx",
                                            "portMappings": [{"containerPort": 80, "hostPort": 80, "protocol": "tcp"}]
                                        }
                                    ]""")
                            .build()
            );


            var serviceSecurityGroup = new SecurityGroup("service-secgrp", SecurityGroupArgs
                    .builder()
                    .description("Allow HTTP ingress from the LB, allow HTTPS egress to anywhere to fetch container images.")
                    .vpcId(vpc.vpcId())
                    .ingress(
                            SecurityGroupIngressArgs.builder()
                                    .protocol("tcp")
                                    .fromPort(80)
                                    .toPort(80)
                                    .cidrBlocks(Output.all(vpc.vpc().apply(com.pulumi.aws.ec2.Vpc::cidrBlock)))
                                    .build())
                    .egress(
                            SecurityGroupEgressArgs.builder()
                                    .protocol("tcp")
                                    .fromPort(443)
                                    .toPort(443)
                                    .cidrBlocks("0.0.0.0/0")
                                    .build()
                    )
                    .build());


            new Service("app-svc",
                    ServiceArgs.builder()
                            .cluster(cluster.arn())
                            .desiredCount(1)
                            .launchType("FARGATE")
                            .taskDefinition(taskDefinition.arn())
                            .networkConfiguration(
                                    ServiceNetworkConfigurationArgs.builder()
                                            .assignPublicIp(true)
                                            .subnets(vpc.privateSubnetIds())
                                            .securityGroups(Output.all(serviceSecurityGroup.id()))
                                            .build()
                            )
                            .loadBalancers(
                                    ServiceLoadBalancerArgs.builder()
                                            .targetGroupArn(targetGroup.arn())
                                            .containerName("my-app")
                                            .containerPort(80)
                                            .build()
                            )
                            .build(),

                    CustomResourceOptions.builder()
                            .dependsOn(albListener)
                            .build()
            );

            ctx.export("url", Output.format("http://%s", loadBalancer.dnsName()));
        });
    }
}
