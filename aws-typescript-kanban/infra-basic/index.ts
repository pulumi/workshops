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

// ─── 1. Data store (DynamoDB) ─────────────────────────────────────
// The app's only persistent store. Single-table, pay-per-request,
// hash key on "pk" so we can key the whole board under a constant.

const boardTable = new aws.dynamodb.Table("board-table", {
  billingMode: "PAY_PER_REQUEST",
  hashKey: "pk",
  attributes: [{ name: "pk", type: "S" }],
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
  overrides: { publish?: boolean } = {},
): aws.lambda.Function {
  return new aws.lambda.Function(name, {
    role: lambdaRole.arn,
    runtime: "nodejs20.x",
    code: lambdaCode,
    handler,
    timeout: lambdaTimeout,
    memorySize: lambdaMemory,
    publish: overrides.publish,
    environment: {
      variables: {
        APP_NAME: appName,
        APP_STAGE: stage,
        WORKSHOP_ROOT: "/var/task",
        BOARD_TABLE_NAME: boardTable.name,
        BOARD_STATE_PK: "BOARD_STATE",
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

// ─── 4. Backend API (API Gateway → Backend Lambda) ────────────────
// HTTP API in front of the backend Lambda. Routes `/internal/*`.

const backendApi = new aws.apigatewayv2.Api("backend-api", {
  protocolType: "HTTP",
  description: `${appName} public backend API`,
});

const backendIntegration = new aws.apigatewayv2.Integration("backend-integration", {
  apiId: backendApi.id,
  integrationType: "AWS_PROXY",
  integrationUri: backendAlias.invokeArn,
  integrationMethod: "POST",
  payloadFormatVersion: "2.0",
});

new aws.apigatewayv2.Route("backend-board-route", {
  apiId: backendApi.id,
  routeKey: "ANY /internal/{proxy+}",
  target: pulumi.interpolate`integrations/${backendIntegration.id}`,
});

new aws.apigatewayv2.Stage("backend-stage", {
  apiId: backendApi.id,
  name: "$default",
  autoDeploy: true,
});

new aws.lambda.Permission("backend-api-permission", {
  action: "lambda:InvokeFunction",
  function: backendFunction.name,
  qualifier: backendAlias.name,
  principal: "apigateway.amazonaws.com",
  sourceArn: pulumi.interpolate`${backendApi.executionArn}/*/*`,
});

const backendBaseUrl = backendApi.apiEndpoint.apply((apiEndpoint) => `${apiEndpoint}`);

// ─── 5. BFF Lambda ────────────────────────────────────────────────
// The public-facing Lambda the browser talks to. It turns around
// and calls the backend over the backend API.

const bffFunction = createLambda("bff", "dist/services/bff/src/lambda.handler", {
  BACKEND_BASE_URL: backendBaseUrl,
  BFF_RETRY_COUNT: "1",
});

// ─── 6. Public API (API Gateway → BFF Lambda) ─────────────────────
// HTTP API the browser actually talks to. CORS open in this stage
// because the frontend and API live on different hostnames.

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

// ─── 7. Static site (S3 bucket + website + uploaded frontend) ─────
// The HTML/CSS/JS live in S3 as a plain website. `config.js` is
// generated at deploy time with the public API URL baked in.

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
  content: pulumi.all([publicApi.apiEndpoint, backendBaseUrl]).apply(([apiBaseUrl, backendUrl]) =>
    `window.__WORKSHOP_CONFIG__ = ${JSON.stringify({ apiBaseUrl, backendUrl })};`,
  ),
});

// ─── 8. Outputs ───────────────────────────────────────────────────

export const stackName = stage;
export const projectName = pulumi.getProject();
export const region = awsRegion;
export const tableName = boardTable.name;
export const publicApiUrl = publicApi.apiEndpoint;
export const backendPublicUrl = backendBaseUrl;
export const frontendUrl = pulumi.interpolate`http://${frontendWebsite.websiteEndpoint}`;
