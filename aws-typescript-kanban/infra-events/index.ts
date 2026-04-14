import fs from "node:fs";
import path from "node:path";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

// ─── Helpers ──────────────────────────────────────────────────────
// Tiny utilities used further down. They are only here because
// Pulumi programs are just TypeScript — you can reach for normal
// fs/path code instead of a DSL.

const projectRoot = path.resolve(process.cwd(), "..");

function requireFile(relativePath: string): string {
  const fullPath = path.join(projectRoot, relativePath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing required file: ${fullPath}. Run npm run build before pulumi preview/up.`);
  }

  return fullPath;
}

function contentTypeFor(fileName: string): string {
  if (fileName.endsWith(".html")) {
    return "text/html; charset=utf-8";
  }

  if (fileName.endsWith(".css")) {
    return "text/css; charset=utf-8";
  }

  if (fileName.endsWith(".js")) {
    return "application/javascript; charset=utf-8";
  }

  if (fileName.endsWith(".json")) {
    return "application/json; charset=utf-8";
  }

  return "application/octet-stream";
}

// ─── Config ───────────────────────────────────────────────────────
// Pulumi config lets us parameterize per-stack (dev, staging, etc.)
// without touching code.

const config = new pulumi.Config();
const appName = config.get("appName") ?? "TypeScript AWS Kanban";
const lambdaConfig = new pulumi.Config("lambda");
const lambdaMemory = lambdaConfig.getNumber("memory") ?? 512;
const lambdaTimeout = lambdaConfig.getNumber("timeout") ?? 30;
const backendConfig = new pulumi.Config("backend");
const backendProvisionedConcurrency = backendConfig.getNumber("provisionedConcurrency");
const stage = pulumi.getStack();
const awsRegion = aws.getRegionOutput().name;
const availabilityZones = aws.getAvailabilityZones({ state: "available" });

// ─── 1. Data store (DynamoDB) ─────────────────────────────────────
// The app's only persistent store. Single-table, pay-per-request,
// hash key on "pk" so we can key the whole board under a constant.

const boardTable = new aws.dynamodb.Table("board-table", {
  billingMode: "PAY_PER_REQUEST",
  hashKey: "pk",
  attributes: [{ name: "pk", type: "S" }],
});

// ─── 1a. Event queue (SQS + DLQ) (new in Stage 3) ─────────────────
// Webhook events land here. The DLQ catches messages the worker
// can't process after 3 attempts. Visibility timeout is ≥ 6× the
// worker Lambda timeout — anything shorter risks a second delivery
// while the first invocation is still running.

const deadLetterQueue = new aws.sqs.Queue("event-dlq", {
  messageRetentionSeconds: 1209600,
});

const eventQueue = new aws.sqs.Queue("event-queue", {
  visibilityTimeoutSeconds: lambdaTimeout * 6,
  redrivePolicy: deadLetterQueue.arn.apply((arn) => JSON.stringify({
    deadLetterTargetArn: arn,
    maxReceiveCount: 3,
  })),
});

// ─── 2. Lambda runtime (IAM role + code bundle + factory) ─────────
// Both Lambdas share the same code bundle, the same IAM role, and
// the same "how to build a Lambda" recipe.

const lambdaRole = new aws.iam.Role("lambda-role", {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: "lambda.amazonaws.com",
  }),
});

new aws.iam.RolePolicyAttachment("lambda-basic-execution", {
  role: lambdaRole.name,
  policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
});

new aws.iam.RolePolicyAttachment("lambda-vpc-execution", {
  role: lambdaRole.name,
  policyArn: aws.iam.ManagedPolicy.AWSLambdaVPCAccessExecutionRole,
});

new aws.iam.RolePolicy("app-policy", {
  role: lambdaRole.id,
  policy: boardTable.arn.apply((tableArn) => JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
        ],
        Resource: tableArn,
      },
    ],
  })),
});

// New in Stage 3: grant the shared Lambda role access to the SQS
// queue and DLQ. Kept as a separate RolePolicy so it's visible as
// a pure addition to the Stage 2 IAM setup.
new aws.iam.RolePolicy("sqs-policy", {
  role: lambdaRole.id,
  policy: pulumi.all([eventQueue.arn, deadLetterQueue.arn]).apply(([queueArn, dlqArn]) => JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: [
          "sqs:GetQueueAttributes",
          "sqs:PurgeQueue",
          "sqs:SendMessage",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:ChangeMessageVisibility",
        ],
        Resource: [queueArn, dlqArn],
      },
    ],
  })),
});

// One asset archive, shared by both Lambdas. The archive has the
// compiled `dist/`, the seed `data/`, and `node_modules/` so the
// handlers run without any additional deploy step.
const lambdaCode = new pulumi.asset.AssetArchive({
  dist: new pulumi.asset.FileArchive(requireFile("dist")),
  data: new pulumi.asset.FileArchive(requireFile("data")),
  node_modules: new pulumi.asset.FileArchive(requireFile("node_modules")),
  "package.json": new pulumi.asset.FileAsset(requireFile("package.json")),
});

// `createLambda` is just a TypeScript function that returns a resource.
function createLambda(
  name: string,
  handler: string,
  environment: Record<string, pulumi.Input<string>>,
  overrides: {
    publish?: boolean;
    vpcConfig?: pulumi.Input<aws.types.input.lambda.FunctionVpcConfig>;
  } = {},
): aws.lambda.Function {
  return new aws.lambda.Function(name, {
    role: lambdaRole.arn,
    runtime: "nodejs20.x",
    code: lambdaCode,
    handler,
    timeout: lambdaTimeout,
    memorySize: lambdaMemory,
    publish: overrides.publish,
    vpcConfig: overrides.vpcConfig,
    environment: {
      variables: {
        APP_NAME: appName,
        APP_STAGE: `${stage}-events`,
        WORKSHOP_ROOT: "/var/task",
        BOARD_TABLE_NAME: boardTable.name,
        BOARD_STATE_PK: "BOARD_STATE",
        EVENT_QUEUE_URL: eventQueue.id,
        DEAD_LETTER_QUEUE_URL: deadLetterQueue.id,
        ...environment,
      },
    },
  });
}

// ─── 3. Backend Lambda ────────────────────────────────────────────
// Reads and writes the DynamoDB table.

const backendFunction = createLambda(
  "backend-http",
  "dist/services/backend/src/lambda-http.handler",
  {},
  { publish: backendProvisionedConcurrency !== undefined && backendProvisionedConcurrency > 0 },
);

const backendAlias = new aws.lambda.Alias("backend-http-live", {
  name: "live",
  functionName: backendFunction.name,
  functionVersion: backendFunction.version,
});

if (backendProvisionedConcurrency !== undefined && backendProvisionedConcurrency > 0) {
  new aws.lambda.ProvisionedConcurrencyConfig("backend-http-provisioned", {
    functionName: backendFunction.name,
    qualifier: backendAlias.name,
    provisionedConcurrentExecutions: backendProvisionedConcurrency,
  });
}

// ─── 3a. Worker Lambda + SQS event source (new in Stage 3) ───────
// Consumes messages from the event queue and writes to DynamoDB.
// EventSourceMapping tells Lambda to poll SQS for this function.

const workerFunction = createLambda("backend-worker", "dist/services/backend/src/lambda-worker.handler", {});

new aws.lambda.EventSourceMapping("worker-event-source", {
  eventSourceArn: eventQueue.arn,
  functionName: workerFunction.arn,
  batchSize: 10,
  functionResponseTypes: ["ReportBatchItemFailures"],
});

// ─── 3b. Webhook ingress Lambda (new in Stage 3) ──────────────────
// Public HTTP entrypoint for external webhook posts. Writes the
// payload to the SQS queue and returns 202 immediately.

const webhookFunction = createLambda("webhook", "dist/services/webhook/src/lambda.handler", {});

// ─── 4. VPC (new in Stage 2) ──────────────────────────────────────
// A small VPC with two private subnets across two AZs. No IGW, no
// NAT — nothing in here can reach the public internet. That's the
// point: the backend and its ALB sit here.

const workshopVpc = new aws.ec2.Vpc("workshop-vpc", {
  cidrBlock: "10.42.0.0/16",
  enableDnsSupport: true,
  enableDnsHostnames: true,
});

const privateSubnets = [0, 1].map((index) => new aws.ec2.Subnet(`private-subnet-${index + 1}`, {
  vpcId: workshopVpc.id,
  cidrBlock: `10.42.${index + 1}.0/24`,
  availabilityZone: availabilityZones.then((zones) => zones.names[index]),
  mapPublicIpOnLaunch: false,
}));

const privateRouteTable = new aws.ec2.RouteTable("private-route-table", {
  vpcId: workshopVpc.id,
});

privateSubnets.forEach((subnet, index) => {
  new aws.ec2.RouteTableAssociation(`private-route-table-association-${index + 1}`, {
    routeTableId: privateRouteTable.id,
    subnetId: subnet.id,
  });
});

// ─── 5. Security groups (new in Stage 2) ──────────────────────────
// Two SGs wire the only path into the backend: BFF → ALB → backend.
// The ALB SG only accepts traffic from the BFF SG — nothing else.

const bffSecurityGroup = new aws.ec2.SecurityGroup("bff-sg", {
  vpcId: workshopVpc.id,
  description: "Security group for the BFF Lambda.",
  egress: [{
    protocol: "-1",
    fromPort: 0,
    toPort: 0,
    cidrBlocks: ["0.0.0.0/0"],
  }],
});

const backendAlbSecurityGroup = new aws.ec2.SecurityGroup("backend-alb-sg", {
  vpcId: workshopVpc.id,
  description: "Security group for the internal backend ALB.",
  ingress: [{
    protocol: "tcp",
    fromPort: 80,
    toPort: 80,
    securityGroups: [bffSecurityGroup.id],
  }],
  egress: [{
    protocol: "-1",
    fromPort: 0,
    toPort: 0,
    cidrBlocks: ["0.0.0.0/0"],
  }],
});

// ─── 6. Internal ALB → Backend Lambda (new in Stage 2) ────────────
// Replaces the public backend API Gateway from Stage 1. The ALB is
// marked `internal`, so AWS won't assign a public DNS name.

const backendLoadBalancer = new aws.lb.LoadBalancer("backend-alb", {
  internal: true,
  loadBalancerType: "application",
  securityGroups: [backendAlbSecurityGroup.id],
  subnets: privateSubnets.map((subnet) => subnet.id),
});

const backendTargetGroup = new aws.lb.TargetGroup("backend-target-group", {
  targetType: "lambda",
});

const backendAlbPermission = new aws.lambda.Permission("backend-alb-permission", {
  action: "lambda:InvokeFunction",
  function: backendFunction.name,
  qualifier: backendAlias.name,
  principal: "elasticloadbalancing.amazonaws.com",
  sourceArn: backendTargetGroup.arn,
});

new aws.lb.TargetGroupAttachment("backend-target-group-attachment", {
  targetGroupArn: backendTargetGroup.arn,
  targetId: backendAlias.arn,
}, {
  dependsOn: [backendAlbPermission],
});

new aws.lb.Listener("backend-listener", {
  loadBalancerArn: backendLoadBalancer.arn,
  port: 80,
  protocol: "HTTP",
  defaultActions: [{
    type: "forward",
    targetGroupArn: backendTargetGroup.arn,
  }],
});

const backendBaseUrl = pulumi.interpolate`http://${backendLoadBalancer.dnsName}`;

// ─── 7. BFF Lambda ────────────────────────────────────────────────
// Same BFF as Stage 1, but now it runs inside the VPC so it can
// reach the internal ALB over private DNS.

const bffFunction = createLambda("bff", "dist/services/bff/src/lambda.handler", {
  BACKEND_BASE_URL: backendBaseUrl,
  BFF_RETRY_COUNT: "1",
}, {
  vpcConfig: {
    subnetIds: privateSubnets.map((subnet) => subnet.id),
    securityGroupIds: [bffSecurityGroup.id],
  },
});

// ─── 8. Public API (API Gateway → BFF Lambda) ─────────────────────
// Public entrypoint for the browser. Routes `/api/*` to the BFF.
// New in Stage 3: also routes `POST /webhooks/external` to the
// webhook ingress Lambda (added further down).

const publicApi = new aws.apigatewayv2.Api("public-api", {
  protocolType: "HTTP",
  description: `${appName} public API`,
  corsConfiguration: {
    allowHeaders: ["content-type"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowOrigins: ["*"],
  },
});

const bffIntegration = new aws.apigatewayv2.Integration("bff-integration", {
  apiId: publicApi.id,
  integrationType: "AWS_PROXY",
  integrationUri: bffFunction.arn,
  integrationMethod: "POST",
  payloadFormatVersion: "2.0",
});

// Split by method so OPTIONS falls through to API Gateway's
// built-in CORS handling (via `corsConfiguration`). An `ANY`
// route would otherwise catch OPTIONS preflights and forward
// them to the Lambda, which would 404.
for (const method of ["GET", "POST"]) {
  new aws.apigatewayv2.Route(`bff-route-${method.toLowerCase()}`, {
    apiId: publicApi.id,
    routeKey: `${method} /api/{proxy+}`,
    target: pulumi.interpolate`integrations/${bffIntegration.id}`,
  });
}

// Webhook route (new in Stage 3) — separate integration for the
// webhook Lambda so external services can post to /webhooks/external.
const webhookIntegration = new aws.apigatewayv2.Integration("webhook-integration", {
  apiId: publicApi.id,
  integrationType: "AWS_PROXY",
  integrationUri: webhookFunction.arn,
  integrationMethod: "POST",
  payloadFormatVersion: "2.0",
});

new aws.apigatewayv2.Route("webhook-route", {
  apiId: publicApi.id,
  routeKey: "POST /webhooks/external",
  target: pulumi.interpolate`integrations/${webhookIntegration.id}`,
});

new aws.apigatewayv2.Stage("public-stage", {
  apiId: publicApi.id,
  name: "$default",
  autoDeploy: true,
});

new aws.lambda.Permission("bff-api-permission", {
  action: "lambda:InvokeFunction",
  function: bffFunction.name,
  principal: "apigateway.amazonaws.com",
  sourceArn: pulumi.interpolate`${publicApi.executionArn}/*/*`,
});

new aws.lambda.Permission("webhook-api-permission", {
  action: "lambda:InvokeFunction",
  function: webhookFunction.name,
  principal: "apigateway.amazonaws.com",
  sourceArn: pulumi.interpolate`${publicApi.executionArn}/*/*`,
});

// ─── 9. Static site (S3 bucket + website + uploaded frontend) ────

const frontendBucket = new aws.s3.Bucket("frontend-bucket", {
  forceDestroy: true,
});

const frontendWebsite = new aws.s3.BucketWebsiteConfiguration("frontend-website", {
  bucket: frontendBucket.id,
  indexDocument: {
    suffix: "index.html",
  },
});

const frontendPublicAccess = new aws.s3.BucketPublicAccessBlock("frontend-public-access", {
  bucket: frontendBucket.id,
  blockPublicAcls: false,
  blockPublicPolicy: false,
  ignorePublicAcls: false,
  restrictPublicBuckets: false,
});

new aws.s3.BucketPolicy("frontend-policy", {
  bucket: frontendBucket.id,
  policy: frontendBucket.arn.apply((arn) => JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: "*",
        Action: ["s3:GetObject"],
        Resource: [`${arn}/*`],
      },
    ],
  })),
}, { dependsOn: [frontendPublicAccess] });

const frontendDir = requireFile("dist/frontend");
for (const fileName of fs.readdirSync(frontendDir)) {
  if (fileName === "config.js") {
    continue;
  }

  const sourcePath = path.join(frontendDir, fileName);
  if (!fs.statSync(sourcePath).isFile()) {
    continue;
  }

  new aws.s3.BucketObject(fileName.replace(/[^a-zA-Z0-9-]/g, "-"), {
    bucket: frontendBucket.id,
    key: fileName,
    source: new pulumi.asset.FileAsset(sourcePath),
    contentType: contentTypeFor(fileName),
  });
}

new aws.s3.BucketObject("frontend-config", {
  bucket: frontendBucket.id,
  key: "config.js",
  contentType: "application/javascript; charset=utf-8",
  content: publicApi.apiEndpoint.apply((apiBaseUrl) =>
    `window.__WORKSHOP_CONFIG__ = ${JSON.stringify({ apiBaseUrl })};`,
  ),
});

// ─── 10. Outputs ──────────────────────────────────────────────────

export const stackName = stage;
export const projectName = pulumi.getProject();
export const region = awsRegion;
export const tableName = boardTable.name;
export const queueUrl = eventQueue.id;
export const deadLetterQueueUrl = deadLetterQueue.id;
export const publicApiUrl = publicApi.apiEndpoint;
export const frontendUrl = pulumi.interpolate`http://${frontendWebsite.websiteEndpoint}`;
