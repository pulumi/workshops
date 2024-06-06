# Build a Platform using Pulumi Automation API

## Prerequisites

This workshop assumes you have a basic understanding of TypeScript as Backstage is written in TypeScript. If you are new
to TypeScript, you can learn more about it [here](https://www.typescriptlang.org/).

Additionally, you will need to have the following tools installed:

- [Node.js](https://nodejs.org/en/download/)
- [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/)
- [Docker](https://docs.docker.com/get-docker/)
- [Pulumi Account](https://app.pulumi.com/signup)

Additionally, you will need to have an AWS account and have your AWS credentials configured.

## Getting Started

To get started, clone the repository and navigate to the `build-a-platform-using-pulumi-automation-api` directory:

```bash
git clone https://github.com/pulumi/workshops
cd workshops/build-a-platform-using-pulumi-automation-api
```

Next, install the dependencies:

```bash
npm install
```

## Running the code

To run the code, you will need to run `npm run start`.

This will start the Express server and wait for you input.

## Testing the code

You can either test the code by navigating to `http://localhost:8080/api-docs` in your browser and run the endpoints
with following request body:

```json
{
  "name": "my-test",
  "org": "your-org",
  "project": "aws-ts-s3-folder",
  "stack": "dev",
  "region": "eu-central-1"
}
```

Or you can run the following command:

```bash
curl -X 'POST' \
  'http://localhost:8080/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{"name": "my-test","org": "your-org","project": "aws-ts-s3-folder","stack": "dev", "region": "eu-central-1" }'
```

This will create a new Pulumi stack and deploy the resources to AWS.

To clean up the resources, you can run the following command:

```bash
curl -X 'DELETE' \                                                           
  'http://localhost:8080/?name=my-test&org=your-org&project=aws-ts-s3-folder&stack=dev&region=eu-central-1' \
  -H 'accept: application/json'                                                                                                                                                                                                  
```

Congratulations! You have successfully made your first APIs using Pulumi Automation API and started your journey to
build a platform using Pulumi Automation API.
