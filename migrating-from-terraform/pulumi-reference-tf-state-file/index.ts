import * as pulumi from "@pulumi/pulumi";
import * as terraform from "@pulumi/terraform";
import * as aws from "@pulumi/aws";

const remoteState = new terraform.state.RemoteStateReference("tf-local-state", {
  backendType: "local",
  path: "../terraform-vpc/terraform.tfstate",
});

const vpcId = remoteState.getOutput("vpc_id") as pulumi.Output<string>;

const publicSubnetIds = remoteState.getOutput("public_subnet_ids") as pulumi.Output<string[]>;
const privateSubnetIds = remoteState.getOutput("private_subnet_ids") as pulumi.Output<string[]>;

const cluster = new aws.ecs.Cluster("cluster");

const vpc = aws.ec2.Vpc.get("tf-vpc", vpcId);

const albSecGroup = new aws.ec2.SecurityGroup("alb-sec-grp", {
  vpcId: vpcId,
  description: "Enable HTTP access",
  ingress: [{
    protocol: "tcp",
    fromPort: 80,
    toPort: 80,
    cidrBlocks: ["0.0.0.0/0"],
  }],
  egress: [{
    protocol: "-1",
    fromPort: 0,
    toPort: 0,
    cidrBlocks: [vpc.cidrBlock],
  }],
});

const alb = new aws.lb.LoadBalancer("app-lb", {
  securityGroups: [albSecGroup.id],
  subnets: publicSubnetIds,
});

const targetGroup = new aws.lb.TargetGroup("app-tg", {
  port: 80,
  protocol: "HTTP",
  targetType: "ip",
  vpcId: vpcId,
});

const listener = new aws.lb.Listener("web", {
  loadBalancerArn: alb.arn,
  port: 80,
  defaultActions: [{
    type: "forward",
    targetGroupArn: targetGroup.arn,
  }],
});

const role = new aws.iam.Role("task-exec-role", {
  assumeRolePolicy: JSON.stringify({
    Version: "2008-10-17",
    Statement: [{
      Action: "sts:AssumeRole",
      Principal: {
        Service: "ecs-tasks.amazonaws.com",
      },
      Effect: "Allow",
      Sid: "",
    }],
  }),
});

new aws.iam.RolePolicyAttachment("task-exec-policy", {
  role: role.name,
  policyArn: aws.iam.ManagedPolicy.AmazonECSTaskExecutionRolePolicy,
});

const taskDefinition = new aws.ecs.TaskDefinition("app-task", {
  family: "fargate-task-definition",
  cpu: "256",
  memory: "512",
  networkMode: "awsvpc",
  requiresCompatibilities: ["FARGATE"],
  executionRoleArn: role.arn,
  containerDefinitions: JSON.stringify([{
    name: "my-app",
    image: "nginx:latest",
    portMappings: [{
      containerPort: 80,
      hostPort: 80,
      protocol: "tcp",
    }],
  }]),
});

const serviceSecGroup = new aws.ec2.SecurityGroup("service-sec-grp", {
  vpcId: vpcId,
  description: "NGINX service",
  ingress: [{
    description: "Allow HTTP from within the VPC",
    protocol: "tcp",
    fromPort: 80,
    toPort: 80,
    cidrBlocks: [vpc.cidrBlock],
  }],
  egress: [{
    description: "Allow HTTPS to anywhere (to pull container images)",
    protocol: "tcp",
    fromPort: 443,
    toPort: 443,
    cidrBlocks: ["0.0.0.0/0"],
  }],
});

const service = new aws.ecs.Service("app-svc", {
  cluster: cluster.arn,
  desiredCount: 1,
  launchType: "FARGATE",
  taskDefinition: taskDefinition.arn,
  networkConfiguration: {
    assignPublicIp: true,
    subnets: privateSubnetIds,
    securityGroups: [serviceSecGroup.id],
  },
  loadBalancers: [{
    targetGroupArn: targetGroup.arn,
    containerName: "my-app",
    containerPort: 80,
  }],
});

export const url = pulumi.interpolate`http://${alb.dnsName}`;
