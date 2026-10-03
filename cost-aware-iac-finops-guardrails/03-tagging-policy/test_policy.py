"""Offline tests for the CostCenter tagging rule.

Runs without pulumi_policy installed: exercises rules.missing_required_tag
directly against a passing and a failing case, so the rule is genuinely
tested before it is ever run against a real Pulumi program.
"""

import unittest

from rules import missing_required_tag


class MissingRequiredTagTests(unittest.TestCase):
    def test_flags_instance_with_no_tags(self) -> None:
        self.assertTrue(missing_required_tag(None))

    def test_flags_instance_missing_cost_center(self) -> None:
        self.assertTrue(missing_required_tag({"Name": "demo"}))

    def test_passes_instance_with_cost_center(self) -> None:
        self.assertFalse(missing_required_tag({"Name": "demo", "CostCenter": "platform-eng"}))


if __name__ == "__main__":
    unittest.main()
