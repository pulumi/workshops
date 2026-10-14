import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

export interface ComplianceWebServiceArgs {
    /**
     * Name of the service. Used to derive resource names and the mandatory
     * "platform:service" tag.
     *
     * BREAKING CHANGE (v2.0.0): renamed from `serviceName` to `name`. A v1
     * consumer program that still passes `serviceName` fails schema
     * validation against this version instead of silently doing the wrong
     * thing.
     */
    name: pulumi.Input<string>;
    /**
     * Container image to run, e.g. an image URI in ECR or Docker Hub.
     */
    image: pulumi.Input<string>;
    /**
     * Port the container listens on.
     */
    port: pulumi.Input<number>;
}

/**
 * ComplianceWebService is the platform team's golden path for a
 * load-balanced container service on AWS. It wraps an ECS Fargate service
 * behind an Application Load Balancer with the platform's required
 * guardrails already wired in: mandatory tags, a CloudWatch log group, and a
 * task IAM role scoped to only what the container needs to write its own
 * logs. A consuming team gets a running, compliant service without writing
 * any of that itself.
 */
export class ComplianceWebService extends pulumi.ComponentResource {
    /** Public URL of the load-balanced service. */
    public readonly url: pulumi.Output<string>;

    constructor(resourceName: string, args: ComplianceWebServiceArgs, opts?: pulumi.ComponentResourceOptions) {
        super("platform-golden-path:index:ComplianceWebService", resourceName, args, opts);

        const mandatoryTags = {
            "platform:managed-by": "compliance-web-service-component",
            "platform:service": args.name,
        };

        // Every service gets its own log group: logs are isolated per
        // service and retained for a fixed, predictable window rather than
        // left to whatever a consuming team happens to configure.
        const logGroup = new aws.cloudwatch.LogGroup(`${resourceName}-logs`, {
            retentionInDays: 14,
            tags: mandatoryTags,
        }, { parent: this });

        // A task role scoped to exactly what the container needs: writing to
        // its own log group. Consuming teams never see or manage this role.
        const taskRole = new aws.iam.Role(`${resourceName}-task-role`, {
            assumeRolePolicy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [{
                    Action: "sts:AssumeRole",
                    Effect: "Allow",
                    Principal: { Service: "ecs-tasks.amazonaws.com" },
                }],
            }),
            tags: mandatoryTags,
        }, { parent: this });

        new aws.iam.RolePolicy(`${resourceName}-task-role-logs`, {
            role: taskRole.id,
            policy: logGroup.arn.apply(arn => JSON.stringify({
                Version: "2012-10-17",
                Statement: [{
                    Effect: "Allow",
                    Action: ["logs:CreateLogStream", "logs:PutLogEvents"],
                    Resource: `${arn}:*`,
                }],
            })),
        }, { parent: this });

        const cluster = new aws.ecs.Cluster(`${resourceName}-cluster`, {
            tags: mandatoryTags,
        }, { parent: this });

        const lb = new awsx.lb.ApplicationLoadBalancer(`${resourceName}-lb`, {
            defaultTargetGroup: { port: args.port },
        }, { parent: this });

        const region = aws.getRegionOutput({}, { parent: this });

        new awsx.ecs.FargateService(`${resourceName}-service`, {
            cluster: cluster.arn,
            assignPublicIp: true,
            desiredCount: 1,
            taskDefinitionArgs: {
                taskRole: { roleArn: taskRole.arn },
                container: {
                    name: "app",
                    image: args.image,
                    cpu: 256,
                    memory: 512,
                    essential: true,
                    portMappings: [{
                        containerPort: args.port,
                        targetGroup: lb.defaultTargetGroup,
                    }],
                    logConfiguration: {
                        logDriver: "awslogs",
                        options: {
                            "awslogs-group": logGroup.name,
                            "awslogs-region": region.name,
                            "awslogs-stream-prefix": resourceName,
                        },
                    },
                },
                tags: mandatoryTags,
            },
            tags: mandatoryTags,
        }, { parent: this });

        this.url = pulumi.interpolate`http://${lb.loadBalancer.dnsName}`;

        this.registerOutputs({ url: this.url });
    }
}
