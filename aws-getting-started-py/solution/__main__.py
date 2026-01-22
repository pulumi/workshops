"""Pulumi infrastructure for Language Tutor Agent on AWS Lambda."""
import json
import os
import pulumi
import pulumi_aws as aws
import pulumi_awsx as awsx

# Configuration
config = pulumi.Config()
aws_config = pulumi.Config("aws")
aws_region = aws_config.require("region")

lambda_memory = config.get_int("lambdaMemory") or 1024
lambda_timeout = config.get_int("lambdaTimeout") or 300
log_retention = config.get_int("logRetentionDays") or 14

# =============================================================================
# S3 Bucket for Story Output
# Registry: https://www.pulumi.com/registry/packages/aws/api-docs/s3/bucket/
# =============================================================================
story_bucket = aws.s3.Bucket("story-output-bucket",
    bucket="language-tutor-stories",
    force_destroy=True,  # Allow deletion even with objects (for dev)
)

# =============================================================================
# SNS Topic for Results Fan-out
# Registry: https://www.pulumi.com/registry/packages/aws/api-docs/sns/topic/
# =============================================================================
results_topic = aws.sns.Topic("results-topic",
    name="language-tutor-results",
)

# =============================================================================
# ECR Repository and Image (using AWSX for simplified management)
# Registry: https://www.pulumi.com/registry/packages/awsx/api-docs/ecr/
# =============================================================================
repository = awsx.ecr.Repository("language-tutor-repo",
    force_delete=True,
)

# Get absolute path to parent directory (aws-getting-started-py)
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

image = awsx.ecr.Image("language-tutor-image",
    repository_url=repository.url,
    context=parent_dir,  # Parent directory containing both language-tutor-agent and solution
    dockerfile=os.path.join(parent_dir, "solution/app/Dockerfile"),
    platform="linux/arm64",
)

# =============================================================================
# IAM Role for Main Lambda (Story Generator)
# Registry: https://www.pulumi.com/registry/packages/aws/api-docs/iam/role/
# =============================================================================
lambda_role = aws.iam.Role("lambda-role",
    name="language-tutor-lambda-role",
    assume_role_policy=json.dumps({
        "Version": "2012-10-17",
        "Statement": [{
            "Action": "sts:AssumeRole",
            "Effect": "Allow",
            "Principal": {
                "Service": "lambda.amazonaws.com"
            }
        }]
    }),
)

# Attach AWSLambdaBasicExecutionRole for CloudWatch Logs
lambda_basic_execution = aws.iam.RolePolicyAttachment("lambda-basic-execution",
    role=lambda_role.name,
    policy_arn="arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
)

# Attach AWSLambdaSQSQueueExecutionRole for SQS access
lambda_sqs_execution = aws.iam.RolePolicyAttachment("lambda-sqs-execution",
    role=lambda_role.name,
    policy_arn="arn:aws:iam::aws:policy/service-role/AWSLambdaSQSQueueExecutionRole",
)

# Inline policy for Bedrock access
bedrock_policy = aws.iam.RolePolicy("bedrock-policy",
    role=lambda_role.name,
    policy=json.dumps({
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel",
                "bedrock:InvokeModelWithResponseStream"
            ],
            "Resource": "*"
        }]
    }),
)

# Inline policy for SNS publish
sns_publish_policy = aws.iam.RolePolicy("sns-publish-policy",
    role=lambda_role.name,
    policy=results_topic.arn.apply(lambda arn: json.dumps({
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Action": "sns:Publish",
            "Resource": arn
        }]
    })),
)

# =============================================================================
# IAM Role for S3 Writer Lambda
# =============================================================================
s3_writer_role = aws.iam.Role("s3-writer-role",
    name="language-tutor-s3-writer-role",
    assume_role_policy=json.dumps({
        "Version": "2012-10-17",
        "Statement": [{
            "Action": "sts:AssumeRole",
            "Effect": "Allow",
            "Principal": {
                "Service": "lambda.amazonaws.com"
            }
        }]
    }),
)

# Attach basic execution role
s3_writer_basic_execution = aws.iam.RolePolicyAttachment("s3-writer-basic-execution",
    role=s3_writer_role.name,
    policy_arn="arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
)

# Inline policy for S3 write access
s3_write_policy = aws.iam.RolePolicy("s3-write-policy",
    role=s3_writer_role.name,
    policy=story_bucket.arn.apply(lambda arn: json.dumps({
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl"
            ],
            "Resource": f"{arn}/*"
        }]
    })),
)

# =============================================================================
# CloudWatch Log Groups
# =============================================================================
log_group = aws.cloudwatch.LogGroup("lambda-logs",
    name="/aws/lambda/language-tutor-agent",
    retention_in_days=log_retention,
)

s3_writer_log_group = aws.cloudwatch.LogGroup("s3-writer-logs",
    name="/aws/lambda/language-tutor-s3-writer",
    retention_in_days=log_retention,
)

# =============================================================================
# SQS Queues (Main + DLQ)
# =============================================================================
dlq = aws.sqs.Queue("language-tutor-dlq",
    name="language-tutor-dlq",
    message_retention_seconds=1209600,  # 14 days
)

queue = aws.sqs.Queue("language-tutor-queue",
    name="language-tutor-queue",
    visibility_timeout_seconds=lambda_timeout + 60,  # Lambda timeout + buffer
    message_retention_seconds=86400,  # 1 day
    redrive_policy=dlq.arn.apply(lambda arn: json.dumps({
        "deadLetterTargetArn": arn,
        "maxReceiveCount": 3
    })),
)

# =============================================================================
# Main Lambda Function (Story Generator - Container-based)
# =============================================================================
lambda_fn = aws.lambda_.Function("language-tutor-lambda",
    name="language-tutor-agent",
    package_type="Image",
    image_uri=image.image_uri,
    role=lambda_role.arn,
    memory_size=lambda_memory,
    timeout=lambda_timeout,
    architectures=["arm64"],
    environment=aws.lambda_.FunctionEnvironmentArgs(
        variables={
            "BEDROCK_MODEL_ID": "us.anthropic.claude-opus-4-5-20251101-v1:0",
            "SNS_TOPIC_ARN": results_topic.arn,
        }
    ),
    opts=pulumi.ResourceOptions(
        depends_on=[
            lambda_basic_execution,
            lambda_sqs_execution,
            bedrock_policy,
            sns_publish_policy,
            log_group,
        ]
    ),
)

# =============================================================================
# S3 Writer Lambda Function (Python runtime)
# =============================================================================
s3_writer_code = """
import json
import logging
import os
import boto3
from datetime import datetime

logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3 = boto3.client('s3')
BUCKET_NAME = os.environ['BUCKET_NAME']

def lambda_handler(event, context):
    logger.info("Received SNS event: %s", json.dumps(event))

    for record in event.get('Records', []):
        try:
            # Parse SNS message
            sns_message = json.loads(record['Sns']['Message'])

            message_id = sns_message.get('messageId', 'unknown')
            story_data = sns_message.get('storyData', {})
            prompt = sns_message.get('prompt', '')
            timestamp = sns_message.get('timestamp', datetime.utcnow().isoformat())

            # Create S3 key with date partitioning
            date_prefix = datetime.fromisoformat(timestamp.replace('Z', '+00:00')).strftime('%Y/%m/%d')
            s3_key = f"stories/{date_prefix}/{message_id}.json"

            # Prepare output document
            output = {
                'messageId': message_id,
                'prompt': prompt,
                'timestamp': timestamp,
                'story': story_data,
            }

            # Write to S3
            s3.put_object(
                Bucket=BUCKET_NAME,
                Key=s3_key,
                Body=json.dumps(output, indent=2, ensure_ascii=False),
                ContentType='application/json',
            )

            logger.info("Saved story to s3://%s/%s", BUCKET_NAME, s3_key)

        except Exception as e:
            logger.exception("Error processing SNS message")
            raise

    return {'statusCode': 200, 'body': 'OK'}
"""

# Create a zip archive for the Lambda
import hashlib
code_hash = hashlib.md5(s3_writer_code.encode()).hexdigest()

s3_writer_lambda = aws.lambda_.Function("s3-writer-lambda",
    name="language-tutor-s3-writer",
    runtime="python3.12",
    handler="index.lambda_handler",
    role=s3_writer_role.arn,
    timeout=30,
    memory_size=256,
    architectures=["arm64"],
    code=pulumi.AssetArchive({
        "index.py": pulumi.StringAsset(s3_writer_code),
    }),
    environment=aws.lambda_.FunctionEnvironmentArgs(
        variables={
            "BUCKET_NAME": story_bucket.bucket,
        }
    ),
    opts=pulumi.ResourceOptions(
        depends_on=[
            s3_writer_basic_execution,
            s3_write_policy,
            s3_writer_log_group,
        ]
    ),
)

# =============================================================================
# SNS Subscription (SNS -> S3 Writer Lambda)
# =============================================================================
sns_lambda_permission = aws.lambda_.Permission("sns-lambda-permission",
    action="lambda:InvokeFunction",
    function=s3_writer_lambda.name,
    principal="sns.amazonaws.com",
    source_arn=results_topic.arn,
)

sns_subscription = aws.sns.TopicSubscription("s3-writer-subscription",
    topic=results_topic.arn,
    protocol="lambda",
    endpoint=s3_writer_lambda.arn,
    opts=pulumi.ResourceOptions(
        depends_on=[sns_lambda_permission]
    ),
)

# =============================================================================
# SQS Event Source Mapping
# =============================================================================
event_source = aws.lambda_.EventSourceMapping("sqs-trigger",
    event_source_arn=queue.arn,
    function_name=lambda_fn.name,
    batch_size=1,
    enabled=True,
)

# =============================================================================
# Exports
# =============================================================================
pulumi.export("repository_url", repository.url)
pulumi.export("image_uri", image.image_uri)
pulumi.export("queue_url", queue.url)
pulumi.export("dlq_url", dlq.url)
pulumi.export("lambda_name", lambda_fn.name)
pulumi.export("lambda_arn", lambda_fn.arn)
pulumi.export("log_group_name", log_group.name)
pulumi.export("sns_topic_arn", results_topic.arn)
pulumi.export("story_bucket_name", story_bucket.bucket)
pulumi.export("s3_writer_lambda_name", s3_writer_lambda.name)
