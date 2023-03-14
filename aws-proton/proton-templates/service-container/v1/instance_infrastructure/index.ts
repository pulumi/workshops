import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();

// TODO: Allow the service to run on any port.
// const port = config.requireNumber("port");

// In a standard Pulumi program, these would come via stack references. However,
// since we are in the context of AWS Proton, we get any outputs in the
// environment given to us automatically via proton-inputs.json and will thus
// skip using a stack reference here. For more details on what exactly gets
// handed off to CodeBuild for a Proton service template, see
// doc/sample-svc-proton-inputs.json in this repo.
const vpcId = config.require("vpcId");
const albArn = config.require("albArn");
const albDnsName = config.require("albDnsName");
const clusterArn = config.require("clusterArn");
const privateSubnetIdsStr = config.require("privateSubnetIds");
const privateSubnetIds = JSON.parse(privateSubnetIdsStr);

// Again, this is not how we'd do things in a more prod-like scenario. Instead
// of a listener and target group being on the same port, we'd have a shared
// listener e.g. on port 443 which would terminate TLS, then forward on to the
// service's listener group on the service port unencrypted.
const targetGroup = new aws.lb.TargetGroup("service-target-group", {
  port: 80,
  protocol: "HTTP",
  targetType: "ip",
  vpcId: vpcId,
});

const listener = new aws.lb.Listener("http-listener", {
  loadBalancerArn: albArn,
  port: 80,
  defaultActions: [{
    type: "forward",
    targetGroupArn: targetGroup.arn,
  }]
});

const taskExecutionRole = new aws.iam.Role("task-execution", {
  assumeRolePolicy: {
    Version: "2008-10-17",
    Statement: [{
      Effect: "Allow",
      Principal: {
        Service: "ecs-tasks.amazonaws.com"
      },
      Action: "sts:AssumeRole"
    }]
  }
});

const taskDefinition = new aws.ecs.TaskDefinition("task-definition", {
  family: "fargate-task-definition",
  cpu: "256",
  memory: "512",
  networkMode: "awsvpc",
  requiresCompatibilities: ["FARGATE"],
  executionRoleArn: taskExecutionRole.arn,
  containerDefinitions: JSON.stringify([{
    name: "my-app",
    image: "nginx",
    portMappings: [{
      containerPort: 80,
      hostPort: 80,
      protocol: "tcp",
    }]
  }])
});

// TODO: Tighten up the CIDR blocks.
// TODO: Fix the ports to match the passed in parameter.
const serviceSecurityGroup = new aws.ec2.SecurityGroup("service-security-group", {
  vpcId: vpcId,
  ingress: [{
    fromPort: 80,
    toPort: 80,
    protocol: "tcp",
    cidrBlocks: ["0.0.0.0/0"]
  }],
  egress: [
    {
      description: "Allow HTTP traffic to/from the service.",
      fromPort: 80,
      toPort: 80,
      protocol: "tcp",
      cidrBlocks: ["0.0.0.0/0"]
    },
    {
      description: "Allow outbound HTTPS so the task can pull the container image from Docker Hub.",
      fromPort: 443,
      toPort: 443,
      protocol: "tcp",
      cidrBlocks: ["0.0.0.0/0"]
    }]
});


new aws.ecs.Service("service", {
  cluster: clusterArn,
  desiredCount: 1,
  launchType: "FARGATE",
  taskDefinition: taskDefinition.arn,
  networkConfiguration: {
    assignPublicIp: false,
    subnets: privateSubnetIds,
    securityGroups: [serviceSecurityGroup.id]
  },
  loadBalancers: [{
    targetGroupArn: targetGroup.arn,
    containerName: "my-app",
    containerPort: 80,
  }]
}, {
  dependsOn: listener,
});

export const serviceUrl = `http://${albDnsName}`;