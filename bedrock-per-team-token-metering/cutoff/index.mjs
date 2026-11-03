// Runs when a team's output-token alarm changes state. On ALARM it puts a Deny on
// Bedrock invocation on the team's role; the team's next call fails with AccessDenied.
// The alarm names its role in a CutoffRole tag. Nothing here lifts a cutoff; a human
// does that (scripts/restore.sh), so a stop stays a stop until someone decides otherwise.
import { IAMClient, PutRolePolicyCommand } from "@aws-sdk/client-iam";
import { CloudWatchClient, ListTagsForResourceCommand } from "@aws-sdk/client-cloudwatch";

const iam = new IAMClient({});
const cloudwatch = new CloudWatchClient({});
const policyName = process.env.POLICY_NAME ?? "token-cutoff";

const denyInvoke = JSON.stringify({
    Version: "2012-10-17",
    Statement: [{
        Sid: "TokenCutoff",
        Effect: "Deny",
        Action: ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"],
        Resource: "*",
    }],
});

export const handler = async (event) => {
    const alarmName = event.alarmData?.alarmName ?? event.alarmArn;
    const state = event.alarmData?.state?.value;

    const { Tags = [] } = await cloudwatch.send(new ListTagsForResourceCommand({ ResourceARN: event.alarmArn }));
    const roleName = Tags.find(tag => tag.Key === "CutoffRole")?.Value;
    if (!roleName) {
        throw new Error(`alarm ${alarmName} carries no CutoffRole tag; nothing to cut off`);
    }

    if (state !== "ALARM") {
        console.log(`${alarmName} is ${state}; leaving ${roleName} as it is`);
        return { alarm: alarmName, role: roleName, action: "none" };
    }

    await iam.send(new PutRolePolicyCommand({ RoleName: roleName, PolicyName: policyName, PolicyDocument: denyInvoke }));
    console.log(`${alarmName} is in ALARM; ${roleName} can no longer invoke Bedrock (inline policy ${policyName})`);
    return { alarm: alarmName, role: roleName, action: "cutoff" };
};
