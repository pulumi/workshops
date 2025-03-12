# AWS Python Workshop with Pulumi

This workshop guides you through deploying a serverless Flask application on AWS using Pulumi.
You'll learn how to:
- Create and manage S3 buckets
- Deploy a Flask application as an AWS Lambda function
- Configure API Gateway to expose your Lambda

**Estimated time**: 60 minutes

## Prerequisites

Before starting this workshop, ensure you have:

```
- Pulumi CLI installed
- AWS CLI installed and configured
- Docker installed (for Lambda container)
- Python 3.10+ installed
- AWS account with appropriate permissions
- Logged into AWS 
```

## S S3 Bucket Creation

### Create a New Pulumi Project

First, let's create a new Pulumi project using the AWS Python template:

```bash
pulumi new --force aws-python
# Enter project details when prompted
# Name: aws-intro-python
# Description: AWS Intro Workshop with Python
# Stack: dev
# AWS region: ca-central-1 (or your preferred region)
```

This creates a basic Pulumi project with the necessary files to deploy AWS resources.

### Examine the Project Structure

Take a moment to look at the files created:
- `__main__.py`: The main Pulumi program
- `Pulumi.yaml`: Project configuration
- `requirements.txt`: Python dependencies

### Create a Simple Text File

Let's create a text file that we'll upload to our S3 bucket:

```bash
echo 'textfile!' > text.txt
```

### Update the Pulumi Program to Create an S3 Bucket

Now, let's modify the `__main__.py` file to create an S3 bucket and upload our text file:

```python
import pulumi
from pulumi_aws import s3

# Create an AWS resource (S3 Bucket)
bucket = s3.BucketV2('my-bucket')

# Read the content of our text file
with open("text.txt", "r") as f:
    content = f.read()

# Upload the file to our S3 bucket
obj = s3.BucketObject("my-text-file",
    bucket=bucket.id,
    content=content
)

# Export the name of the bucket
pulumi.export('bucket_name', bucket.id)
```

This is just a fun way to show we can using standard python stuff with Pulumi.

Let's deploy our S3 bucket and file:

```bash
pulumi up
```

Review the changes and confirm the deployment.

And verify that our file was uploaded to S3:

```bash
# Print the bucket name
echo "$(pulumi stack output bucket_name)"

# Download and display the file content
aws s3 cp s3://$(pulumi stack output bucket_name)/my-text-file -
```

The `-` at the end of the `aws s3 cp` command prints the file content to standard output.

## Flask Application Setup

Now that we have our S3 bucket, let's create a simple Flask application that will serve our text file.

First, let's activate our Python virtual environment:

```bash
source ./venv/bin/activate
```

### Update Dependencies

Add Flask and AWS WSGI adapter to our requirements:

```bash
# Add to requirements.txt
echo "flask" >> requirements.txt
echo "aws-wsgi" >> requirements.txt

# Install dependencies
pip install -r requirements.txt
```

### 2.3 Create Flask Application

Create a new file named `app.py` with the following content:

```python
from flask import Flask, send_file
import json
import awsgi

app = Flask(__name__)

@app.route("/")
def serve_file():
    return send_file("text.txt", mimetype="text/plain")

# Lambda handler function
def lambda_handler(event, context):
    return awsgi.response(app, event, context)

# For local testing
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005, debug=True)
```

This Flask application:
- Defines a route for the root path (`/`)
- Serves our text file when the route is accessed
- Includes a Lambda handler that uses AWSGI to adapt Flask to Lambda

## Section 3: Lambda Deployment

AWS Lambda lets us run code without provisioning servers. We'll package our Flask application in a Docker container and deploy it as a Lambda function.

Create a `Dockerfile` with the following content:

```Dockerfile
FROM --platform=linux/amd64 public.ecr.aws/lambda/python:3.10

# Copy function code
COPY app.py ${LAMBDA_TASK_ROOT}
COPY text.txt ${LAMBDA_TASK_ROOT}
COPY requirements.txt ${LAMBDA_TASK_ROOT}

# Install the function's dependencies
RUN pip install -r ${LAMBDA_TASK_ROOT}/requirements.txt

# Set the CMD to your handler
CMD ["app.lambda_handler"]
```

### Update Dependencies for Lambda Deployment

Add AWS Extended (AWSX) to our requirements for container image handling:

```bash
# Add to requirements.txt
echo "pulumi_awsx" >> requirements.txt

# Install dependencies
pip install -r requirements.txt
```

### Update the Pulumi Program for Lambda

Now, let's update our `__main__.py` to include Lambda deployment:

```python
import pulumi
import pulumi_aws as aws
import pulumi_awsx as awsx
import json
import os
from pulumi_aws import s3

# S3 Bucket (from previous section)
bucket = s3.BucketV2('my-bucket')

with open("text.txt", "r") as f:
    content = f.read()

obj = s3.BucketObject("my-text-file",
    bucket=bucket.id,
    content=content
)

# ====== CONTAINER IMAGE (The package containing your application) ======
# Create a repository to store the Docker image
repository = aws.ecr.Repository("app-server-repo",
    force_delete=True,
    image_scanning_configuration=aws.ecr.RepositoryImageScanningConfigurationArgs(
        scan_on_push=True,
    )
)

# Build and push the Docker image to ECR
image = awsx.ecr.Image("app-server-image",
    repository_url=repository.repository_url,
    context=".",  
    dockerfile="Dockerfile",
    platform="linux/amd64"  # Important for Mac M1/M2 users
)

# ====== LAMBDA PERMISSIONS ======
# IAM role - the identity your Lambda function assumes
lambda_role = aws.iam.Role("lambda-role",
    assume_role_policy=json.dumps({
        "Version": "2012-10-17",
        "Statement": [{
            "Action": "sts:AssumeRole",
            "Principal": {
                "Service": "lambda.amazonaws.com"
            },
            "Effect": "Allow",
            "Sid": ""
        }]
    })
)

# Attach basic execution permissions - what your function is allowed to do
lambda_role_policy = aws.iam.RolePolicyAttachment("lambda-role-policy",
    role=lambda_role.name,
    policy_arn="arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
)

# ====== LAMBDA FUNCTION (The worker that does the actual work) ======
# Create the Lambda function using the container and permissions
lambda_function = aws.lambda_.Function("custom-lambda",
    name="custom-lambda",
    package_type="Image",
    image_uri=image.image_uri,
    role=lambda_role.arn,
    timeout=30,         # Maximum execution time in seconds
    memory_size=512,    # Memory allocated to your function
    architectures=["x86_64"],
    environment={
        "variables": {
            "FLASK_ENV": "production"
        }
    }
)

# Export the Lambda ARN and ECR repository URL
pulumi.export('lambda_arn', lambda_function.arn)
pulumi.export("ecr", repository.repository_url)
```

### Deploy the Lambda Function

Let's deploy our Lambda function:

```bash
pulumi up
```

This will build the Docker image, push it to ECR, and create the Lambda function.

## API Gateway Configuration

API Gateway provides an HTTP endpoint for our Lambda function. We'll create an API Gateway that forwards requests to our Lambda.

Add the following code to your `__main__.py` file:

```python
# ====== API GATEWAY (how users trigger your Lambda) ======
# Create an API Gateway to receive HTTP requests
api_gateway = aws.apigatewayv2.Api("custom-api",
    name="CustomAPI",
    protocol_type="HTTP",
    route_selection_expression="$request.method $request.path"
)

# ====== INTEGRATION (The wiring between trigger and worker) ======
# Connect the Lambda function to the API Gateway
api_integration = aws.apigatewayv2.Integration("api-lambda-integration",
    api_id=api_gateway.id,
    integration_type="AWS_PROXY",
    integration_uri=lambda_function.arn,
    integration_method="POST",
    payload_format_version="1.0"  # Important for Flask/awsgi compatibility!
)

# Create a catch-all route that forwards all HTTP requests to your Lambda
catch_all_route = aws.apigatewayv2.Route("catch-all-route",
    api_id=api_gateway.id,
    route_key="ANY /{proxy+}",  # Matches any HTTP method and path
    target=api_integration.id.apply(lambda id: f"integrations/{id}")
)

# Create a stage for the API (required for deployment)
api_stage = aws.apigatewayv2.Stage("api-stage",
    api_id=api_gateway.id,
    name="$default",
    auto_deploy=True
)

# ====== ADDITIONAL PERMISSIONS (Permission for the gateway to call lambda) ======
# Allow API Gateway to invoke your Lambda function
lambda_permission = aws.lambda_.Permission("lambda-permission",
    action="lambda:InvokeFunction",
    function=lambda_function.name,
    principal="apigateway.amazonaws.com",
    source_arn=api_gateway.execution_arn.apply(lambda arn: f"{arn}/*/*")
)

# Export the API endpoint URL
pulumi.export("api_url", api_gateway.api_endpoint)
```

Now let's deploy our complete application stack:

```bash
pulumi up
```

Review the changes and confirm the deployment. This might take a few minutes as it builds and pushes the Docker image.

## Testing and Validation

After deployment, let's test our serverless application.

```bash
# Test the endpoint
curl $(pulumi stack output api_url)
```

You should see the contents of your text.txt file in the response.

### Lambda Logs (Optional)

You can check the Lambda function logs in CloudWatch:

```bash
aws logs filter-log-events --log-group-name /aws/lambda/custom-lambda --limit 20
```

## Advanced Operations (Optional)

### Manual Docker Build and Push

If you want to build and push the Docker image manually:

```bash
# Login to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin $(pulumi stack output ecr)

# Build the image
docker build --platform=linux/amd64 -t flask-textfile-app -t $(pulumi stack output ecr):latest .

# Push the image
docker push $(pulumi stack output ecr):latest
```

### Working with Multiple Stacks

You can create and manage multiple stacks for different environments:

```bash
# Create a new stack
pulumi stack init demo

# Deploy to the demo stack
pulumi up --stack demo

# Get outputs from a specific stack
pulumi stack output api_url --stack demo
```

## Cleanup

When you're done with the workshop, you can clean up all resources to avoid incurring charges:

```bash
pulumi destroy
```

## Troubleshooting

### Common Issues and Solutions

1. **"exec format error" in Lambda**
   - **Cause**: Building Docker image on ARM-based Mac without platform specification
   - **Cause**: Or: aws-wsgi missing from requerments and causing container to fail
   - **Solution**: Ensure both Dockerfile and Pulumi image resource specify `platform="linux/amd64"`

2. **API Gateway returns 500 errors**
   - **Cause**: Incorrect payload format version in API Gateway integration
   - **Solution**: Set `payload_format_version="1.0"` for Flask/awsgi compatibility

3. **Permission denied errors**
   - **Cause**: Missing IAM permissions
   - **Solution**: Check Lambda role permissions and API Gateway permissions

4. **Docker build failures**
   - **Cause**: Docker not running or insufficient permissions
   - **Solution**: Ensure Docker daemon is running and you have sufficient permissions

## Additional Resources

- [Pulumi AWS Documentation](https://www.pulumi.com/docs/clouds/aws/)
