# Lab 2: Productionising our lambda functions

In this lab we're going to take the lambda function from the last lab and improve it so it can be deployed to production.

If you didn't complete the first lab, you can run the following commands to get to the required state:

```bash
mkdir my-serverless-app && cd my-serverless-app
pulumi new serverless-aws-typescript
```

## Writing the Lambda Function code

We're going to move the function code into a separate folder within the root so that we can use things like NPM packages. 

Let's create the folder, change to it and initialise a NodeJS app:

```bash
mkdir app && cd app && npm init && npm i
```

Finally, we'll create an `index.js` file:

```bash
touch index.js
```

and copy the following code in:

```javascript
exports.handler =  async function(event, context) {
    console.log("EVENT: \n" + JSON.stringify(event, null, 2))
    return {
        statusCode: 200,
        body: "Hello, Pulumi!"
    };
  }
```

## Resource defining

Back to the `index.ts` file in the root.

Currently we have two resources defined:

- Lambda Callback Function
- API Gateway Rest API

We're going to start by replacing the CallbackFunction resource with a Function resource. As well as this we'll create an IAM role to assign to the function.

Let's start with the IAM role. We're going to use some built in functions and enums here to make our lives easier:

```typescript
const lambdaRole = new aws.iam.Role("lambdaRole", {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal(aws.iam.Principals.LambdaPrincipal),
    managedPolicyArns: [aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole]
});
```

Then instead of the CallbackFunction we're going to use the base Function resource:

```typescript
const fn = new aws.lambda.Function("fn", {
    role: lambdaRole.arn,
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("./app")
    }),
    runtime: aws.lambda.Runtime.NodeJS16dX,
    handler: "index.handler",
});
```

We could leave the API Gateway resource as it is, but I think it's useful to show what you need to deploy to have more control. If you've created an API Gateway in the console you'll recognise some of these terms.

There are five resources you'll need to create:

* The API Gateway itself
* A Method (matches up with the HTTP method and is used to define the parameters and body that clients must send over)
* An Integration (what we're connecting the API Gateway to - in this case our Lambda Function)
* A deployment (deploys the resource to a stage so that we can call it over the internet)
* A stage (like an environment. This also provides the URL we can call later)

```typescript
const api = new aws.apigateway.RestApi("api");

const method = new aws.apigateway.Method("method", {
    httpMethod: "GET",
    resourceId: api.rootResourceId,
    restApi: api.id,
    authorization: "none"
})

const integration = new aws.apigateway.Integration("integration", {
    httpMethod: method.httpMethod,
    resourceId: api.rootResourceId,
    restApi: api.id,
    type: "AWS_PROXY",
    integrationHttpMethod: "POST",
    uri: fn.invokeArn
});

const deployment = new aws.apigateway.Deployment("deployment", {
    restApi: api.id
});

const stage = new aws.apigateway.Stage("stage", {
    deployment: deployment.id,
    restApi: api.id,
    stageName: "dev"
});
```

If you're using the API Gateway resource I showed you earlier, you're still deploying all these, they're just hidden away.

We'll also need to give the API Gateway permission to invoke the lambda:

```typescript
const permission = new aws.lambda.Permission("permission", {
    action: "lambda:InvokeFunction",
    function: fn.name,
    principal: "apigateway.amazonaws.com",
    sourceArn: pulumi.interpolate`arn:aws:execute-api:${aws.getRegionOutput().name}:${aws.getCallerIdentity().then(x => x.accountId)}:${api.id}/*/${method.httpMethod}/`
});
```

Finally we're going to export the URL from the stage resource so we can call it using the CLI:

```typescript
export const url = pulumi.interpolate`${stage.invokeUrl}`;
```

## Destroy

Once again we're going to destroy everything

```typescript
pulumi destroy
```

## Moving on

Let's continue to [lab 3](https://github.com/pulumi/workshops/tree/main/serverless-architecture-on-aws/lab-3)