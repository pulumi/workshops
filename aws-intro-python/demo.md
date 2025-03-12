## Demo

Here you will find all the steps to build the demo.

Pre-reqs:
```
logged into AWS (,aws-login)

```

## s3 Stuff

First let's start with a template:

```
> pulumi new --force
aws-python
( all defaults)
ca-central-1
```

Then look at files and update:

```
pulumi up
```

Add file to S3:
```
echo 'textfile!' > text.txt
```

Update code:

``` diff
# Create an AWS resource (S3 Bucket)
bucket = s3.BucketV2('my-bucket')

+with open("text.txt","r") as f:
+    content = f.read()

+obj = s3.BucketObject("my-text-file",
+    bucket=bucket.id,
+    content=content
+   )

# Export the name of the bucket
pulumi.export('bucket_name', bucket.id)

```

Run it and see the file:
```
pulumi up
echo "$(pulumi stack output bucket_name)"
aws s3 cp s3://$(pulumi stack output bucket_name)/my-text-file -
```

aws s3 gets the bucket name, gets the file and `-` prints to standard out.


## Lambda

### Add Flask

enter the venv:

```
source ./venv/bin/activate
```

Add `flask` to requirements file, then install:

```
pip install -r requirements.txt
```

Create some files:

``` app.py
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

Dockerfile:

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

## Lambda Infra

Add things:

```requirements.txt
+pulumi_awsx
```

```
>pip install -r requirements.txt
```

Add lambda code:

```

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


pulumi.export("ecr", repository.repository_url)

```

Should be able to see image build and pull it from repo if you want.

```
pulumi up
```


Then Add API Gateway:

```

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

pulumi.export("api_url", api_gateway.api_endpoint)
```

Should be good.

## Other / Extra

Build image and push yourself:
```
aws ecr get-login-password | docker login --username AWS --password-stdin $(pulumi stack output ecr)
docker build --platform=linux/amd64 -t flask-textfile-app -t $(pulumi stack output ecr):latest .
docker push $(pulumi stack output ecr):latest
```


Lambda Logs:
```
aws logs filter-log-events --log-group-name /aws/lambda/custom-lambda --limit 20
```

Demo Stack Setup:

```
pulumi stack output api_url --stack demo
```
