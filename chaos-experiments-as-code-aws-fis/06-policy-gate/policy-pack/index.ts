import { PolicyPack, ReportViolation, ResourceValidationArgs } from "@pulumi/policy";

const experimentTemplateType = "aws:fis/experimentTemplate:ExperimentTemplate";

// Every FIS experiment template needs at least one CloudWatch alarm stop condition.
// The check reads only the "source" field. The alarm ARN is unknown at preview time and is never read.
new PolicyPack("chaos-guardrails", {
    policies: [{
        name: "fis-requires-alarm-stop-condition",
        description: "AWS FIS experiment templates must have at least one aws:cloudwatch:alarm stop condition.",
        enforcementLevel: "mandatory",
        validateResource: (args: ResourceValidationArgs, reportViolation: ReportViolation) => {
            if (args.type !== experimentTemplateType) {
                return;
            }
            const stopConditions: Array<{ source?: string }> = args.props.stopConditions ?? [];
            const hasAlarm = stopConditions.some(sc => sc.source === "aws:cloudwatch:alarm");
            if (!hasAlarm) {
                reportViolation("This experiment template has no aws:cloudwatch:alarm stop condition. Add one so the experiment stops when the steady state is lost.");
            }
        },
    }],
});
