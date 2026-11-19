"""Offline tests for the tagging and instance-size guardrail rules.

Runs without pulumi_policy installed: exercises rules.missing_required_tag
and rules.instance_type_too_large directly, each against a passing and a
failing case.
"""

import unittest

from rules import instance_type_too_large, missing_required_tag


class MissingRequiredTagTests(unittest.TestCase):
    def test_flags_instance_missing_cost_center(self) -> None:
        self.assertTrue(missing_required_tag({"Name": "demo"}))

    def test_passes_instance_with_cost_center(self) -> None:
        self.assertFalse(missing_required_tag({"Name": "demo", "CostCenter": "platform-eng"}))


class InstanceTypeTooLargeTests(unittest.TestCase):
    def test_flags_oversized_instance(self) -> None:
        self.assertTrue(instance_type_too_large("t3.2xlarge"))

    def test_passes_allowed_instance(self) -> None:
        self.assertFalse(instance_type_too_large("t3.micro"))

    def test_passes_largest_allowed_instance(self) -> None:
        self.assertFalse(instance_type_too_large("t3.large"))


if __name__ == "__main__":
    unittest.main()
