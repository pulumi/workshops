import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

export interface ChaosExperimentArgs {
    /** Tasks carrying this tag are the targets. */
    targetTag: { key: string; value: string };
    /** FIS selection mode, for example "COUNT(1)" or "ALL". */
    selectionMode: pulumi.Input<string>;
    /** CloudWatch alarm that stops the experiment when it fires. */
    alarmArn: pulumi.Input<string>;
    /** Optional ISO 8601 duration, for example "PT5M". Adds a wait action after the stop. */
    duration?: string;
    /** Only used when migrating step-4 resources into the component. */
    legacyNames?: { role: string; attachment: string; template: string };
}

/**
 * One chaos experiment on ECS tasks: the FIS service role, its permissions and the
 * experiment template, with a mandatory stop condition.
 */
export class ChaosExperiment extends pulumi.ComponentResource {
    public readonly templateId: pulumi.Output<string>;
    public readonly roleArn: pulumi.Output<string>;

    constructor(name: string, args: ChaosExperimentArgs, opts?: pulumi.ComponentResourceOptions) {
        super("workshop:chaos:ChaosExperiment", name, {}, opts);

        const legacy = args.legacyNames;
        const alias = (old?: string): pulumi.Alias[] =>
            old ? [{ name: old, parent: pulumi.rootStackResource }] : [];

        const role = new aws.iam.Role(`${name}-role`, {
            assumeRolePolicy: aws.iam.getPolicyDocumentOutput({
                statements: [{
                    actions: ["sts:AssumeRole"],
                    principals: [{ type: "Service", identifiers: ["fis.amazonaws.com"] }],
                }],
            }).json,
        }, { parent: this, aliases: alias(legacy?.role) });

        new aws.iam.RolePolicyAttachment(`${name}-ecs-access`, {
            role: role.name,
            policyArn: "arn:aws:iam::aws:policy/service-role/AWSFaultInjectionSimulatorECSAccess",
        }, { parent: this, aliases: alias(legacy?.attachment) });

        const stopAction = {
            name: "stop-task",
            actionId: "aws:ecs:stop-task",
            target: { key: "Tasks", value: "tasks" },
        };
        const actions = args.duration
            ? [stopAction, {
                name: "wait",
                actionId: "aws:fis:wait",
                parameters: [{ key: "duration", value: args.duration }],
                startAfters: ["stop-task"],
            }]
            : [stopAction];

        const template = new aws.fis.ExperimentTemplate(`${name}-template`, {
            description: pulumi.interpolate`Stop ECS tasks tagged ${args.targetTag.key}=${args.targetTag.value} (${args.selectionMode})`,
            roleArn: role.arn,
            stopConditions: [{ source: "aws:cloudwatch:alarm", value: args.alarmArn }],
            actions,
            targets: [{
                name: "tasks",
                resourceType: "aws:ecs:task",
                selectionMode: args.selectionMode,
                resourceTags: [{ key: args.targetTag.key, value: args.targetTag.value }],
            }],
            tags: { Name: name },
        }, { parent: this, aliases: alias(legacy?.template) });

        this.templateId = template.id;
        this.roleArn = role.arn;
        this.registerOutputs({ templateId: this.templateId, roleArn: this.roleArn });
    }
}
