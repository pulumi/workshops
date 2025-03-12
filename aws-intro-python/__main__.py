"""AWS Lambda with API Gateway using Pulumi - Structured for clarity"""
import pulumi
import pulumi_aws as aws
import pulumi_awsx as awsx
import json
import os

# ====== STORAGE RESOURCES (separate concern) ======
# Create an S3 Bucket
bucket = aws.s3.BucketV2('my-bucket')
with open("text.txt", "r") as f:
    content = f.read()
obj = aws.s3.BucketObject("my-text-file",
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
    platform="linux/amd64"
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
    payload_format_version="1.0"
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

# ====== OUTPUTS (Information displayed after deployment) ======
pulumi.export('bucket_name', bucket.id)
pulumi.export("ecr", repository.repository_url)
pulumi.export("api_url", api_gateway.api_endpoint)