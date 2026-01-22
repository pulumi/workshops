"""Lambda handler for Language Tutor Agent."""
import json
import logging
import os
from datetime import datetime, timezone
from typing import Any

import boto3

from agent import create_agent, format_story_output
from models import StoryOutput
from strands.types.exceptions import StructuredOutputException

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# SNS client for publishing results
sns = boto3.client("sns")
SNS_TOPIC_ARN = os.environ.get("SNS_TOPIC_ARN")


def publish_to_sns(message_id: str, prompt: str, story_output: StoryOutput) -> None:
    """Publish story result to SNS topic.

    Args:
        message_id: Original SQS message ID
        prompt: Original prompt
        story_output: Structured story output
    """
    if not SNS_TOPIC_ARN:
        logger.warning("SNS_TOPIC_ARN not configured, skipping publish")
        return

    # Convert Pydantic model to dict for JSON serialization
    story_data = story_output.model_dump()

    message = {
        "messageId": message_id,
        "prompt": prompt,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "storyData": story_data,
    }

    response = sns.publish(
        TopicArn=SNS_TOPIC_ARN,
        Message=json.dumps(message, ensure_ascii=False),
        Subject=f"Language Tutor Story: {story_output.title[:50]}",
    )

    logger.info("Published to SNS: %s", response["MessageId"])


def lambda_handler(event: dict[str, Any], context: Any) -> dict[str, Any]:
    """Handle SQS events for language tutoring requests.

    Args:
        event: SQS event containing message(s)
        context: Lambda context object

    Returns:
        Response dict with processing results
    """
    logger.info("Received event: %s", json.dumps(event))

    results = []
    agent = create_agent()

    for record in event.get("Records", []):
        message_id = record["messageId"]
        try:
            body = json.loads(record["body"])
            prompt = body.get("prompt", "")

            if not prompt:
                logger.warning("Empty prompt received")
                continue

            logger.info("Processing prompt: %s", prompt[:100])

            # Use structured output
            result = agent(prompt, structured_output_model=StoryOutput)

            if result.structured_output:
                formatted = format_story_output(result.structured_output)
                response_text = formatted

                # Publish to SNS for downstream processing (S3 storage)
                publish_to_sns(message_id, prompt, result.structured_output)
            else:
                response_text = str(result.message)

            logger.info("Generated response successfully")
            results.append({
                "messageId": message_id,
                "status": "success",
                "response": response_text
            })

        except StructuredOutputException as e:
            logger.warning("Structured output failed: %s", e)
            results.append({
                "messageId": message_id,
                "status": "partial",
                "response": str(e)
            })

        except Exception as e:
            logger.exception("Error processing message: %s", message_id)
            results.append({
                "messageId": message_id,
                "status": "error",
                "error": str(e)
            })

    return {
        "statusCode": 200,
        "body": json.dumps({"results": results})
    }
