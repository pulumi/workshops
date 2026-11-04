import * as fs from "fs";
import * as path from "path";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as pulumiservice from "@pulumi/pulumiservice";

const config = new pulumi.Config();
const runId = config.get("runId") ?? "deployment-timings-20261104";
const ttlHours = config.getNumber("ttlHours") ?? 8;
const kubernetesHost = config.getBoolean("kubernetesHost") ?? false;
const buildHost = config.getBoolean("buildHost") ?? false;
const instanceType = config.get("instanceType") ?? "m7i.xlarge";
const sourceBranch = config.get("sourceBranch") ?? "workshop/faster-pulumi-deployments";

const organization = pulumi.getOrganization();
const project = pulumi.getProject();
const stack = pulumi.getStack();
const accountId = aws.getCallerIdentityOutput().accountId;
const tags = { Owner: organization, Purpose: runId };

const bucket = new aws.s3.Bucket("releases", {
    bucket: pulumi.interpolate`${runId}-${accountId}`,
    forceDestroy: true,
    tags,
});

new aws.s3.BucketPublicAccessBlock("releases", {
    bucket: bucket.id,
    blockPublicAcls: true,
    ignorePublicAcls: true,
    blockPublicPolicy: true,
    restrictPublicBuckets: true,
});

const imageRepository = new aws.ecr.Repository("images", {
    name: runId,
    forceDelete: true,
    tags,
});

const usEast1 = new aws.Provider("us-east-1", { region: "us-east-1" });

const toolsRepository = new aws.ecrpublic.Repository("tools", {
    repositoryName: `${runId}-tools`,
    catalogData: { description: "Temporary benchmark tools image" },
    forceDestroy: true,
    tags,
}, {
    provider: usEast1,
});

const pool = new pulumiservice.AgentPool("runners", {
    organizationName: organization,
    name: `${runId}-k8s`,
    description: "Temporary kind runner pool for deployment timing measurements",
    forceDestroy: true,
});

const agentToken = new aws.ssm.Parameter("agent-token", {
    name: `/${runId}/agent-token`,
    type: aws.ssm.ParameterType.SecureString,
    value: pool.tokenValue,
    tags,
});

const role = new aws.iam.Role("hosts", {
    name: `${runId}-ec2`,
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({ Service: "ec2.amazonaws.com" }),
    tags,
});

new aws.iam.RolePolicy("hosts", {
    name: "build-release",
    role: role.id,
    policy: {
        Version: "2012-10-17",
        Statement: [
            {
                Effect: "Allow",
                Action: ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
                Resource: pulumi.interpolate`${bucket.arn}/*`,
            },
            { Effect: "Allow", Action: "ecr:GetAuthorizationToken", Resource: "*" },
            {
                Effect: "Allow",
                Action: [
                    "ecr:BatchCheckLayerAvailability",
                    "ecr:BatchGetImage",
                    "ecr:GetDownloadUrlForLayer",
                    "ecr:InitiateLayerUpload",
                    "ecr:UploadLayerPart",
                    "ecr:CompleteLayerUpload",
                    "ecr:PutImage",
                ],
                Resource: imageRepository.arn,
            },
            { Effect: "Allow", Action: "ssm:GetParameter", Resource: agentToken.arn },
        ],
    },
});

new aws.iam.RolePolicyAttachment("hosts-ssm", {
    role: role.name,
    policyArn: aws.iam.ManagedPolicy.AmazonSSMManagedInstanceCore,
});

const profile = new aws.iam.InstanceProfile("hosts", {
    name: `${runId}-ec2`,
    role: role.name,
});

const ami = aws.ec2.getAmiOutput({
    owners: ["amazon"],
    mostRecent: true,
    filters: [
        { name: "name", values: ["al2023-ami-2023.*-x86_64"] },
        { name: "architecture", values: ["x86_64"] },
    ],
});

function host(name: string, script: string, volumeSize: number, extra: Partial<aws.ec2.InstanceArgs> = {}) {
    return new aws.ec2.Instance(name, {
        ami: ami.id,
        instanceType,
        iamInstanceProfile: profile.name,
        userData: fs.readFileSync(path.join(__dirname, "..", script), "utf8"),
        rootBlockDevice: { volumeSize, volumeType: "gp3", deleteOnTermination: true },
        metadataOptions: { httpTokens: "required" },
        tags: { ...tags, Name: `${runId}-${name}` },
        ...extra,
    });
}

const kubernetes = kubernetesHost ? host("kubernetes-host", "kubernetes-runner/host-setup.sh", 80) : undefined;
const build = buildHost
    ? host("build-host", "release/ec2-user-data.sh", 30, { instanceInitiatedShutdownBehavior: "terminate" })
    : undefined;

new pulumiservice.DeploymentSettings("self", {
    organization,
    project,
    stack,
    sourceContext: {
        git: {
            repoUrl: "https://github.com/pulumi/workshops.git",
            branch: sourceBranch,
            repoDir: "faster-pulumi-deployments/benchmarks/infra",
        },
    },
});

new pulumiservice.TtlSchedule("ttl", {
    organization,
    project,
    stack,
    timestamp: new Date(Date.now() + ttlHours * 3600 * 1000).toISOString().replace(/\.\d+Z$/, "Z"),
    deleteAfterDestroy: true,
});

export const bucketName = bucket.bucket;
export const imageRepositoryUrl = imageRepository.repositoryUrl;
export const toolsRepositoryUri = toolsRepository.repositoryUri;
export const agentPoolId = pool.agentPoolId;
export const agentTokenParameter = agentToken.name;
export const kubernetesHostId = kubernetes ? kubernetes.id : "not created";
export const buildHostId = build ? build.id : "not created";
