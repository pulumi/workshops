import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Step 1: prove that Pulumi IaC authenticates through the Pulumi ESC environment.
// No access keys are stored anywhere: the credentials come from OIDC.
const caller = aws.getCallerIdentityOutput({});
export const accountId = caller.accountId;
export const callerArn = caller.arn;
