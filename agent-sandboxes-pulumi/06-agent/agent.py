"""Step 6: a simulated agent. No LLM, just the calls an agent would make.

    python agent.py <my-task> <other-task>

It assumes its own sandbox role, writes a file to its own bucket, then tries to read
another task's bucket. The first succeeds, the second must come back AccessDenied.
"""
import sys
import time

import boto3
from botocore.exceptions import ClientError

REGION = "eu-west-1"


def assume(task: str):
    sts = boto3.client("sts", region_name=REGION)
    arn = f"arn:aws:iam::{sts.get_caller_identity()['Account']}:role/agent-{task}"
    for attempt in range(1, 7):  # IAM is eventually consistent right after role creation
        try:
            c = sts.assume_role(RoleArn=arn, RoleSessionName=f"agent-{task}", DurationSeconds=900)["Credentials"]
            return boto3.client("s3", region_name=REGION, aws_access_key_id=c["AccessKeyId"],
                                aws_secret_access_key=c["SecretAccessKey"], aws_session_token=c["SessionToken"])
        except ClientError as err:
            if attempt == 6:
                raise
            print(f"assume_role not ready ({err.response['Error']['Code']}), retry {attempt}")
            time.sleep(2 * attempt)


def main(mine: str, other: str) -> int:
    s3 = assume(mine)
    for attempt in range(1, 7):
        try:
            s3.put_object(Bucket=f"agent-sandbox-{mine}", Key="notes.txt", Body=b"hello from the sandbox")
            print(f"write  agent-sandbox-{mine}/notes.txt: OK")
            break
        except ClientError as err:
            if attempt == 6:
                raise
            time.sleep(2 * attempt)
    try:
        s3.get_object(Bucket=f"agent-sandbox-{other}", Key="notes.txt")
        print(f"read   agent-sandbox-{other}/notes.txt: ALLOWED (this is a bug)")
        return 1
    except ClientError as err:
        print(f"read   agent-sandbox-{other}/notes.txt: {err.response['Error']['Code']}")
        return 0 if err.response["Error"]["Code"] == "AccessDenied" else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1], sys.argv[2]))
