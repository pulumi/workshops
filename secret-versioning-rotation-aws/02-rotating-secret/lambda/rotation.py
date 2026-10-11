"""Secrets Manager rotation Lambda for the demo app token.

Ported from the AWS generic rotation template (SecretsManagerRotationTemplate in
aws-samples/aws-secrets-manager-rotation-lambdas). The four steps are the ones in
https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets_lambda-functions.html
"""
import logging

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context, client=None):
    arn = event["SecretId"]
    token = event["ClientRequestToken"]
    step = event["Step"]
    client = client or boto3.client("secretsmanager")

    metadata = client.describe_secret(SecretId=arn)
    if not metadata.get("RotationEnabled"):
        raise ValueError("Secret %s is not enabled for rotation" % arn)
    versions = metadata["VersionIdsToStages"]
    if token not in versions:
        raise ValueError("Secret version %s has no stage for rotation of secret %s" % (token, arn))
    if "AWSCURRENT" in versions[token]:
        logger.info("Version %s is already AWSCURRENT, nothing to do", token)
        return
    if "AWSPENDING" not in versions[token]:
        raise ValueError("Secret version %s is not set as AWSPENDING for rotation of secret %s" % (token, arn))

    if step == "createSecret":
        create_secret(client, arn, token)
    elif step == "setSecret":
        set_secret(client, arn, token)
    elif step == "testSecret":
        test_secret(client, arn, token)
    elif step == "finishSecret":
        finish_secret(client, arn, token)
    else:
        raise ValueError("Invalid step parameter %s" % step)


def create_secret(client, arn, token):
    # Make sure a current version exists, then create the pending one unless it is already there.
    client.get_secret_value(SecretId=arn, VersionStage="AWSCURRENT")
    try:
        client.get_secret_value(SecretId=arn, VersionId=token, VersionStage="AWSPENDING")
        logger.info("createSecret: version %s already exists", token)
    except client.exceptions.ResourceNotFoundException:
        passwd = client.get_random_password(PasswordLength=32, ExcludePunctuation=True)
        client.put_secret_value(
            SecretId=arn,
            ClientRequestToken=token,
            SecretString=passwd["RandomPassword"],
            VersionStages=["AWSPENDING"],
        )
        logger.info("createSecret: stored new AWSPENDING version %s", token)


def set_secret(client, arn, token):
    # The demo token is an app signing token that nothing else consumes. There is no database or
    # service to update, so this step writes nothing outside Secrets Manager. A real rotation
    # would change the credential in the target system here.
    logger.info("setSecret: no target system to update for %s", arn)


def test_secret(client, arn, token):
    pending = client.get_secret_value(SecretId=arn, VersionId=token, VersionStage="AWSPENDING")
    value = pending["SecretString"]
    if len(value) != 32:
        raise ValueError("Pending secret has length %d, expected 32" % len(value))
    logger.info("testSecret: pending value for %s looks valid", arn)


def finish_secret(client, arn, token):
    metadata = client.describe_secret(SecretId=arn)
    current = None
    for version, stages in metadata["VersionIdsToStages"].items():
        if "AWSCURRENT" in stages:
            if version == token:
                logger.info("finishSecret: version %s is already AWSCURRENT", version)
                return
            current = version
            break
    client.update_secret_version_stage(
        SecretId=arn,
        VersionStage="AWSCURRENT",
        MoveToVersionId=token,
        RemoveFromVersionId=current,
    )
    logger.info("finishSecret: moved AWSCURRENT from %s to %s", current, token)
