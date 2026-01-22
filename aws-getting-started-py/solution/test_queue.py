#!/usr/bin/env python3
"""Test script to send messages to the Language Tutor SQS queue and check S3 results."""
import argparse
import json
import subprocess
import time

import boto3


def get_stack_output(key: str) -> str:
    """Get a value from Pulumi stack outputs."""
    result = subprocess.run(
        ["pulumi", "stack", "output", key],
        capture_output=True,
        text=True,
        check=True,
    )
    return result.stdout.strip()


def send_message(sqs_client, queue_url: str, prompt: str) -> dict:
    """Send a message to the SQS queue."""
    message_body = json.dumps({"prompt": prompt})
    response = sqs_client.send_message(
        QueueUrl=queue_url,
        MessageBody=message_body,
    )
    return response


def list_s3_stories(s3_client, bucket_name: str, limit: int = 10) -> list:
    """List recent stories in S3 bucket."""
    try:
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix="stories/",
            MaxKeys=limit,
        )
        return response.get("Contents", [])
    except s3_client.exceptions.NoSuchBucket:
        return []


def get_s3_story(s3_client, bucket_name: str, key: str) -> dict:
    """Get a story from S3."""
    response = s3_client.get_object(Bucket=bucket_name, Key=key)
    return json.loads(response["Body"].read().decode("utf-8"))


def main():
    parser = argparse.ArgumentParser(
        description="Send test messages to the Language Tutor SQS queue"
    )
    parser.add_argument(
        "--prompt",
        "-p",
        type=str,
        help="Custom prompt to send (default: sample German story prompt)",
    )
    parser.add_argument(
        "--count",
        "-c",
        type=int,
        default=1,
        help="Number of messages to send (default: 1)",
    )
    parser.add_argument(
        "--queue-url",
        "-q",
        type=str,
        help="SQS queue URL (default: from Pulumi stack output)",
    )
    parser.add_argument(
        "--list-stories",
        "-l",
        action="store_true",
        help="List recent stories from S3 bucket",
    )
    parser.add_argument(
        "--get-story",
        "-g",
        type=str,
        help="Get a specific story from S3 by key",
    )
    parser.add_argument(
        "--wait-for-s3",
        "-w",
        action="store_true",
        help="Wait for story to appear in S3 after sending message",
    )
    args = parser.parse_args()

    # Sample prompts for German language learning at different levels
    sample_prompts = [
        "Erstelle eine A1 Geschichte auf Deutsch mit diesen Vokabeln: Hund, spielen, Park, Freund, laufen",
        "Schreibe eine A2 Geschichte auf Deutsch mit: Schule, lernen, Lehrer, Buch, verstehen",
        "Generiere eine B1 Geschichte auf Deutsch mit: Reise, Flugzeug, Hotel, Abenteuer, entdecken",
        "Erstelle eine A1 Geschichte auf Deutsch mit: Katze, Haus, essen, schlafen, gluecklich",
        "Schreibe eine A2 Geschichte auf Deutsch mit: Familie, Wochenende, kochen, Garten, zusammen",
    ]

    # Get stack outputs
    print("Getting stack outputs from Pulumi...")
    queue_url = args.queue_url or get_stack_output("queue_url")
    bucket_name = get_stack_output("story_bucket_name")

    # Extract region from queue URL
    region = queue_url.split(".")[1]
    print(f"Queue URL: {queue_url}")
    print(f"S3 Bucket: {bucket_name}")
    print(f"Region: {region}")

    # Create AWS clients
    sqs = boto3.client("sqs", region_name=region)
    s3 = boto3.client("s3", region_name=region)

    # Handle --list-stories
    if args.list_stories:
        print("\nRecent stories in S3:")
        stories = list_s3_stories(s3, bucket_name)
        if not stories:
            print("  No stories found.")
        else:
            for obj in sorted(stories, key=lambda x: x["LastModified"], reverse=True):
                print(f"  - {obj['Key']} ({obj['Size']} bytes, {obj['LastModified']})")
        return

    # Handle --get-story
    if args.get_story:
        print(f"\nFetching story: {args.get_story}")
        try:
            story = get_s3_story(s3, bucket_name, args.get_story)
            print(json.dumps(story, indent=2, ensure_ascii=False))
        except Exception as e:
            print(f"Error: {e}")
        return

    # Send messages
    message_ids = []
    for i in range(args.count):
        if args.prompt:
            prompt = args.prompt
        else:
            # Cycle through sample prompts
            prompt = sample_prompts[i % len(sample_prompts)]

        print(f"\nSending message {i + 1}/{args.count}:")
        print(f"  Prompt: {prompt[:80]}...")

        response = send_message(sqs, queue_url, prompt)
        message_id = response["MessageId"]
        message_ids.append(message_id)
        print(f"  MessageId: {message_id}")
        print(f"  Status: Success")

    print(f"\nSent {args.count} message(s) to the queue.")

    # Wait for S3 if requested
    if args.wait_for_s3:
        print("\nWaiting for stories to appear in S3...")
        print("(This may take 60-90 seconds for processing)")

        max_wait = 120  # seconds
        check_interval = 10  # seconds
        waited = 0

        initial_stories = {obj["Key"] for obj in list_s3_stories(s3, bucket_name, 100)}

        while waited < max_wait:
            time.sleep(check_interval)
            waited += check_interval
            print(f"  Checking S3... ({waited}s)")

            current_stories = {obj["Key"] for obj in list_s3_stories(s3, bucket_name, 100)}
            new_stories = current_stories - initial_stories

            if new_stories:
                print(f"\nNew stories found in S3:")
                for key in sorted(new_stories):
                    print(f"  - {key}")

                # Show the first new story content
                first_key = sorted(new_stories)[0]
                print(f"\nContent of {first_key}:")
                story = get_s3_story(s3, bucket_name, first_key)
                print(f"  Title: {story.get('story', {}).get('title', 'N/A')}")
                print(f"  Prompt: {story.get('prompt', 'N/A')[:60]}...")
                break
        else:
            print("\nTimeout waiting for stories. Check CloudWatch logs for errors.")

    print("\nTo check Lambda logs:")
    print("  aws logs tail /aws/lambda/language-tutor-agent --follow")
    print("\nTo list stories in S3:")
    print(f"  python test_queue.py --list-stories")


if __name__ == "__main__":
    main()
