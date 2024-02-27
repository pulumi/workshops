# Getting Started with Infrastructure as Code on AWS - Lambda edition

## Overview

In this workshop, we will deploy a fully functional AWS Lambda function using Pulumi. We will start by creating a new
Pulumi project and then deploy the Lambda function. We will also create an API Gateway to trigger the Lambda function.

## Instructions

### Step 1 - Configure the AWS CLI

We're going to use the environment variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` to configure the AWS CLI.
Simply run the following commands to set them.

```bash
export AWS_ACCESS_KEY_ID=<your-access-key-id>
export AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
```

To verify that the configuration is correct, run the following command.

```bash
aws sts get-caller-identity
```

### Step 2 - Configure the Pulumi CLI

> If you run Pulumi for the first time, you will be asked to log in. Follow the instructions on the screen to
> login. You may need to create an account first, don't worry it is free.

To initialize a new Pulumi project, run `pulumi new` and select from all the available templates the `aws-typescript`.

```bash
pulumi new aws-typescript
```

> **Note**: If you run this command in an existing directory, you may need to pass the `--force` flag to
> the `pulumi new` command.

You will be guided through a wizard to create a new Pulumi project. You can use the following values:

```shell
This command will walk you through creating a new Pulumi project.

Enter a value or leave blank to accept the (default), and press <ENTER>.
Press ^C at any time to quit.

project name (aws-getting-started-lambda-ts):  
project description (A minimal AWS TypeScript Pulumi program):  
Created project 'aws-getting-started-lambda-ts'

Please enter your desired stack name.
To create a stack in an organization, use the format <org-name>/<stack-name> (e.g. `acmecorp/dev`).
stack name (dev): dev 
Created stack 'dev'

aws:region: The AWS region to deploy into (us-east-1): eu-central-1 
Saved config

Installing dependencies...


added 340 packages, and audited 341 packages in 14s

82 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
Finished installing dependencies

Your new project is ready to go! ✨

To perform an initial deployment, run `pulumi up`
```

The template `aws-typescript` will create a new Pulumi project with
the [Pulumi AWS provider](https://www.pulumi.com/registry/packages/aws/) already installed. For detailed instructions,
refer to the Pulumi AWS Provider documentation.

We can delete the contents of the `index.ts` file.

### Step 3 - Create a Lambda Function

Create a new folder called `app` and navigate into it.

```bash
mkdir app
cd app
npm init -y
npm install -D @types/aws-lambda esbuild
npm install node-fetch --save
```

Now add a `build script` to the `package.json` file.

```json
{
  // ...
  "scripts": {
    "build": "esbuild index.ts --bundle --minify --sourcemap --platform=node --target=es2020 --outfile=dist/index.js"
  }
  // ...
}
```

Create a new file called index.ts. Add the following sample code to the new file. This is the code for the Lambda
function. The function returns a random dad joke from the icanhazdadjoke API.

```typescript
import {APIGatewayEvent, APIGatewayProxyResult, Context} from 'aws-lambda';
import fetch from 'node-fetch';

interface DadJokeResponse {
    id: string;
    joke: string;
    status: number;
}

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);

    try {
        // Call the icanhazdadjoke API
        const response = await fetch('https://icanhazdadjoke.com/', {
            headers: {'Accept': 'application/json'}
        });

        // Wait for the JSON response
        const data: DadJokeResponse = <DadJokeResponse>await response.json();

        // Return the joke in the response body
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: data.joke,
            }),
        };
    } catch (error) {
        console.error('Error fetching dad joke:', error);

        // Return an error message
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to fetch dad joke',
            }),
        };
    }
};
```

Finally, we create a `Dockerfile` to build the Lambda function.

```Dockerfile
FROM public.ecr.aws/lambda/nodejs:18-arm64 as builder
WORKDIR /usr/app
COPY package.json index.ts  ./
RUN npm install
RUN npm run build

FROM public.ecr.aws/lambda/nodejs:18-arm64
WORKDIR ${LAMBDA_TASK_ROOT}
COPY --from=builder /usr/app/dist/* ./
CMD ["index.handler"]
```

> **Note**: Noticed that we use the `public.ecr.aws/lambda/nodejs:18-arm64` image. This is the image for the ARM64
> platform. We will use this image to build the Lambda function for the ARM64 platform (Graviton2).

We can build the Docker image with the following command.

```bash
docker build --platform linux/arm64 -t my-lambda:test .
```

And to test the image, we can run it locally.

```bash
docker run -p 9000:8080 my-lambda:test
```

Open a new terminal and run the following command to invoke the Lambda function.

```bash
curl -s "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{}' | jq
```

You should see the following output.

```json
{
  "statusCode": 200,
  "body": "{\"message\":\"How did Darth Vader know what Luke was getting for Christmas? He felt his presents.\"}"
}
```

You can stop the container by pressing `Ctrl+C`.

### Step 4 - Create an ECR Repository and Push the Image

As we want to deploy the Lambda function to AWS, we need to push the Docker image to the Elastic Container Registry (
ECR). First, let's add the `pulumi-docker` package to our project.

> **Note**: Don't forget to navigate back to the root of the project.

```bash
cd ..
npm install @pulumi/docker --save
```

Now open the `index.ts` file and add the following code to create an ECR repository and build and push the Docker image.

```typescript
const repository = new aws.ecr.Repository("myrepository", {
    name: "my-first-pulumi-lambda",
    forceDelete: true,
});

const registryInfo = repository.registryId.apply(async id => {
    const credentials = await aws.ecr.getCredentials({registryId: id});
    const decodedCredentials = Buffer.from(credentials.authorizationToken, "base64").toString();
    const [username, password] = decodedCredentials.split(":");
    if (!password || !username) {
        throw new Error("Invalid credentials");
    }
    return {
        server: credentials.proxyEndpoint,
        username: username,
        password: password,
    };
});

const image = new docker.Image("my-image", {
    build: {
        context: "app",
        platform: "linux/arm64",
    },
    imageName: repository.repositoryUrl,
    registry: registryInfo,
});

export const repoDigest = image.repoDigest;
```

Go ahead and run `pulumi up` to create the ECR repository and push the Docker image.

```bash
pulumi up
```

You will be prompted to confirm the changes. Type `yes` and press `Enter`.

Depending on your internet connection, the process may take a few minutes. Once the process is complete, you should see
a message similar to the following.

```shell
➜ pulumi up -y -f      
Updating (dev)

View in Browser (Ctrl+O): https://app.pulumi.com/dirien/aws-getting-started-lambda-ts/dev/updates/12

     Type                   Name                               Status              
 +   pulumi:pulumi:Stack    aws-getting-started-lambda-ts-dev  created (84s)       
 +   ├─ aws:ecr:Repository  myrepository                       created (0.83s)     
 +   └─ docker:index:Image  my-image                           created (77s)       

Outputs:
    repoDigest: "052848974346.dkr.ecr.eu-central-1.amazonaws.com/my-first-pulumi-lambda@sha256:1751581ac5857418ae69222269957e305e228888726c24d672afd0aef7ea406f"

Resources:
    + 3 created

Duration: 1m25s
```

This is great! We have created an ECR repository and pushed the Docker image to it. Let's move on to the next step.

### Step 5 - Create the Lambda Function and API Gateway

Check this [link](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html) why we use REST
API and not HTTP API.

Open the `index.ts` file and add the following code to create the Lambda function and the API Gateway.

```typescript

// omitted for brevity

const lambda = new aws.lambda.Function("mylambda", {
    name: "my-first-pulumi-lambda",
    imageUri: image.repoDigest,
    packageType: "Image",
    role: new aws.iam.Role("mylambda-role", {
        assumeRolePolicy: JSON.stringify({
            Version: "2012-10-17",
            Statement: [{
                Action: "sts:AssumeRole",
                Effect: "Allow",
                Principal: {
                    Service: "lambda.amazonaws.com",
                },
            }],
        }),
    }).arn,
    timeout: 300,
    memorySize: 128,
    architectures: ["arm64"],
});

const lambdaPermission = new aws.lambda.Permission("mylambda-permission", {
    action: "lambda:InvokeFunction",
    statementId: "AllowAPIGatewayInvoke",
    function: lambda,
    principal: "apigateway.amazonaws.com",
});

const apiGatewayRestApi = new aws.apigateway.RestApi("myapi", {
    name: "my-first-pulumi-api",
})

const apiGatewayResource = new aws.apigateway.Resource("myapiresource", {
    parentId: apiGatewayRestApi.rootResourceId,
    pathPart: "mylambda",
    restApi: apiGatewayRestApi.id,
});

const apiGatewayMethod = new aws.apigateway.Method("myapimethod", {
    restApi: apiGatewayRestApi.id,
    resourceId: apiGatewayResource.id,
    httpMethod: "GET",
    authorization: "NONE",
});

const apiGatewayIntegration = new aws.apigateway.Integration("myapiintegration", {
    restApi: apiGatewayRestApi.id,
    resourceId: apiGatewayResource.id,
    httpMethod: apiGatewayMethod.httpMethod,
    integrationHttpMethod: "POST",
    type: "AWS_PROXY",
    uri: lambda.invokeArn,
});

const apiGatewayDeployment = new aws.apigateway.Deployment("myapideployment", {
    restApi: apiGatewayRestApi.id,
    stageName: "v1",
}, {
    dependsOn: [
        apiGatewayIntegration
    ]
});

export const url = apiGatewayDeployment.invokeUrl;
```

Run `pulumi up` to create the Lambda function and the API Gateway.

```bash
pulumi up
```

You will be prompted to confirm the changes. Type `yes` and press `Enter`.

Once the process is complete, you should see a message similar to the following.

```shell
Updating (dev)

View in Browser (Ctrl+O): https://app.pulumi.com/dirien/aws-getting-started-lambda-ts/dev/updates/13

     Type                           Name                               Status              
     pulumi:pulumi:Stack            aws-getting-started-lambda-ts-dev                      
 +   ├─ aws:iam:Role                mylambda-role                      created (2s)        
 +   ├─ aws:apigateway:RestApi      myapi                              created (2s)        
 +   ├─ aws:lambda:Function         mylambda                           created (27s)       
 +   ├─ aws:apigateway:Resource     myapiresource                      created (0.68s)     
 +   ├─ aws:apigateway:Method       myapimethod                        created (0.32s)     
 +   ├─ aws:lambda:Permission       mylambda-permission                created (0.72s)     
 +   ├─ aws:apigateway:Integration  myapiintegration                   created (0.95s)     
 +   └─ aws:apigateway:Deployment   myapideployment                    created (0.67s)     

Outputs:
    repoDigest: "052848974346.dkr.ecr.eu-central-1.amazonaws.com/my-first-pulumi-lambda@sha256:1751581ac5857418ae69222269957e305e228888726c24d672afd0aef7ea406f"
  + url       : "https://ws0jsc45vg.execute-api.eu-central-1.amazonaws.com/v1"

Resources:
    + 8 created
    3 unchanged

Duration: 42s
```

This is great! We have created the Lambda function and the API Gateway. You can now test the API Gateway by running the
following command.

```bash
curl -s $(pulumi stack output url) | jq .
```

You should see the following output.

```json
{
  "message": "What animal is always at a game of cricket? A bat."
}
```

### Step 6 - Clean Up

To clean up the resources created in this workshop, run the following command.

```bash
pulumi destroy
```
