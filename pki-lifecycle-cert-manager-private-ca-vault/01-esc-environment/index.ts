import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Proves the ESC environment works: the aws-login credentials resolve to a real account.
// No secret is exported.
const identity = aws.getCallerIdentityOutput();

export const accountId = identity.accountId;
export const region = new pulumi.Config("aws").require("region");
