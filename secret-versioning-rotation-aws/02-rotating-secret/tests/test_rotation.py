"""Offline test for lambda/rotation.py: a fake Secrets Manager client runs all four steps."""
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambda"))
import rotation  # noqa: E402


class FakeClient:
    class exceptions:
        class ResourceNotFoundException(Exception):
            pass

    def __init__(self):
        self.stages = {"v1": ["AWSCURRENT"], "v2": ["AWSPENDING"]}
        self.values = {"v1": "a" * 32}

    def describe_secret(self, SecretId):
        return {"RotationEnabled": True, "VersionIdsToStages": {k: list(v) for k, v in self.stages.items()}}

    def get_secret_value(self, SecretId, VersionId=None, VersionStage=None):
        if VersionId is None:
            VersionId = next(k for k, v in self.stages.items() if VersionStage in v)
        if VersionId not in self.values:
            raise self.exceptions.ResourceNotFoundException()
        return {"SecretString": self.values[VersionId]}

    def get_random_password(self, PasswordLength, ExcludePunctuation):
        return {"RandomPassword": "b" * PasswordLength}

    def put_secret_value(self, SecretId, ClientRequestToken, SecretString, VersionStages):
        self.values[ClientRequestToken] = SecretString
        self.stages[ClientRequestToken] = list(VersionStages)

    def update_secret_version_stage(self, SecretId, VersionStage, MoveToVersionId, RemoveFromVersionId):
        self.stages[RemoveFromVersionId].remove(VersionStage)
        self.stages[RemoveFromVersionId].append("AWSPREVIOUS")
        self.stages[MoveToVersionId].remove("AWSPENDING")
        self.stages[MoveToVersionId].append(VersionStage)


class RotationTest(unittest.TestCase):
    def test_four_steps(self):
        client = FakeClient()
        for step in ["createSecret", "setSecret", "testSecret", "finishSecret"]:
            rotation.lambda_handler({"SecretId": "arn", "ClientRequestToken": "v2", "Step": step}, None, client=client)
        self.assertEqual(client.stages["v2"], ["AWSCURRENT"])
        self.assertEqual(client.stages["v1"], ["AWSPREVIOUS"])
        self.assertEqual(len(client.values["v2"]), 32)

    def test_rerun_after_finish_is_a_no_op(self):
        client = FakeClient()
        for step in ["createSecret", "setSecret", "testSecret", "finishSecret", "finishSecret"]:
            rotation.lambda_handler({"SecretId": "arn", "ClientRequestToken": "v2", "Step": step}, None, client=client)
        self.assertEqual(client.stages["v2"], ["AWSCURRENT"])

    def test_unknown_step_fails(self):
        with self.assertRaises(ValueError):
            rotation.lambda_handler({"SecretId": "arn", "ClientRequestToken": "v2", "Step": "nope"}, None, client=FakeClient())


if __name__ == "__main__":
    unittest.main()
