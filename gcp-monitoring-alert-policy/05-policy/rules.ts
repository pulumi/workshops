// Pure rule logic, kept apart from the PolicyPack so a plain unit test can
// call it without the Pulumi engine.

export const CUSTOM_SERVICE_TYPE = "gcp:monitoring/customService:CustomService";
export const ALERT_POLICY_TYPE = "gcp:monitoring/alertPolicy:AlertPolicy";

// Returns the violation message, or undefined when the stack is fine.
export function missingAlertPolicyViolation(resourceTypes: string[]): string | undefined {
    const services = resourceTypes.filter(t => t === CUSTOM_SERVICE_TYPE).length;
    const policies = resourceTypes.filter(t => t === ALERT_POLICY_TYPE).length;
    if (services > 0 && policies === 0) {
        return `The stack has ${services} Cloud Monitoring custom service(s) and no alert policy. ` +
            "Add a gcp.monitoring.AlertPolicy, or use the ServiceMonitoring component.";
    }
    return undefined;
}
