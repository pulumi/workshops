import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { ChaosExperiment } from "./chaos-experiment";

const config = new pulumi.Config();
const prefix = "chaos-fis";
const targetTag = { key: "chaos-target", value: "workshop" };

// Step 2: the target service. Two nginx tasks on ECS Fargate behind an ALB.
// vpcId and subnetIds are optional overrides. By default the default VPC is used.
const vpcId = config.get("vpcId");
const vpc = { id: vpcId ?? aws.ec2.getVpcOutput({ default: true }).id };
const configuredSubnets = config.getObject<string[]>("subnetIds");
const subnetIds: pulumi.Input<string[]> = configuredSubnets
    ? configuredSubnets
    : aws.ec2.getSubnetsOutput({ filters: [{ name: "vpc-id", values: [vpc.id] }] }).ids;

const cluster = new aws.ecs.Cluster("cluster", { name: `${prefix}-cluster` });

const logGroup = new aws.cloudwatch.LogGroup("logs", {
    name: `/${prefix}/web`,
    retentionInDays: 1,
});

const executionRole = new aws.iam.Role("task-execution-role", {
    assumeRolePolicy: aws.iam.getPolicyDocumentOutput({
        statements: [{
            actions: ["sts:AssumeRole"],
            principals: [{ type: "Service", identifiers: ["ecs-tasks.amazonaws.com"] }],
        }],
    }).json,
});
new aws.iam.RolePolicyAttachment("task-execution-policy", {
    role: executionRole.name,
    policyArn: "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
});

const taskDefinition = new aws.ecs.TaskDefinition("web", {
    family: `${prefix}-web`,
    cpu: "256",
    memory: "512",
    networkMode: "awsvpc",
    requiresCompatibilities: ["FARGATE"],
    executionRoleArn: executionRole.arn,
    containerDefinitions: pulumi.jsonStringify([{
        name: "web",
        image: "nginx:1.31.2-alpine",
        essential: true,
        portMappings: [{ containerPort: 80, protocol: "tcp" }],
        logConfiguration: {
            logDriver: "awslogs",
            options: {
                "awslogs-group": logGroup.name,
                "awslogs-region": aws.getRegionOutput().name,
                "awslogs-stream-prefix": "web",
            },
        },
    }]),
});

const albSecurityGroup = new aws.ec2.SecurityGroup("alb-sg", {
    vpcId: vpc.id,
    description: "Public HTTP into the load balancer",
    ingress: [{ protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] }],
    egress: [{ protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }],
});
const taskSecurityGroup = new aws.ec2.SecurityGroup("task-sg", {
    vpcId: vpc.id,
    description: "HTTP from the load balancer only",
    ingress: [{ protocol: "tcp", fromPort: 80, toPort: 80, securityGroups: [albSecurityGroup.id] }],
    egress: [{ protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }],
});

const loadBalancer = new aws.lb.LoadBalancer("alb", {
    name: `${prefix}-alb`,
    loadBalancerType: "application",
    securityGroups: [albSecurityGroup.id],
    subnets: subnetIds,
});
const targetGroup = new aws.lb.TargetGroup("tg", {
    name: `${prefix}-tg`,
    port: 80,
    protocol: "HTTP",
    targetType: "ip",
    vpcId: vpc.id,
    deregistrationDelay: 5,
    healthCheck: { path: "/", interval: 10, timeout: 5, healthyThreshold: 2, unhealthyThreshold: 2 },
});
const listener = new aws.lb.Listener("http", {
    loadBalancerArn: loadBalancer.arn,
    port: 80,
    protocol: "HTTP",
    defaultActions: [{ type: "forward", targetGroupArn: targetGroup.arn }],
});

// The chaos-target tag is what the FIS experiment template selects on.
// propagateTags copies it from the service to every task it starts, including replacements.
const service = new aws.ecs.Service("web", {
    name: `${prefix}-web`,
    cluster: cluster.arn,
    taskDefinition: taskDefinition.arn,
    desiredCount: 2,
    launchType: "FARGATE",
    enableEcsManagedTags: true,
    propagateTags: "SERVICE",
    tags: { [targetTag.key]: targetTag.value },
    networkConfiguration: {
        assignPublicIp: true,
        subnets: subnetIds,
        securityGroups: [taskSecurityGroup.id],
    },
    loadBalancers: [{ targetGroupArn: targetGroup.arn, containerName: "web", containerPort: 80 }],
}, { dependsOn: [listener] });

export const albUrl = pulumi.interpolate`http://${loadBalancer.dnsName}`;
export const clusterName = cluster.name;
export const serviceName = service.name;

// Step 3: the steady-state check. At least one healthy target must stay in the target group.
const steadyStateAlarm = new aws.cloudwatch.MetricAlarm("healthy-hosts", {
    name: `${prefix}-healthy-hosts`,
    alarmDescription: "Fewer than one healthy target behind the load balancer",
    namespace: "AWS/ApplicationELB",
    metricName: "HealthyHostCount",
    dimensions: {
        TargetGroup: targetGroup.arnSuffix,
        LoadBalancer: loadBalancer.arnSuffix,
    },
    statistic: "Minimum",
    period: 60,
    evaluationPeriods: 1,
    threshold: 1,
    comparisonOperator: "LessThanThreshold",
    treatMissingData: "breaching",
});
export const alarmName = steadyStateAlarm.name;

// Step 5: the same experiment, now a reusable component. The aliases keep the step-4
// resources in place, so preview shows no replace.
const stopOne = new ChaosExperiment("stop-one-task", {
    targetTag,
    selectionMode: "COUNT(1)",
    alarmArn: steadyStateAlarm.arn,
    legacyNames: { role: "fis-role", attachment: "fis-ecs-access", template: "stop-one-task" },
});
const stopAll = new ChaosExperiment("stop-all-tasks", {
    targetTag,
    selectionMode: "ALL",
    alarmArn: steadyStateAlarm.arn,
    duration: "PT5M",
});
export const stopOneTaskTemplateId = stopOne.templateId;
export const stopAllTasksTemplateId = stopAll.templateId;
