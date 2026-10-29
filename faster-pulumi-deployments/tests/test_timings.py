import json
import unittest

from benchmarks.collect import extract_record, summaries


def deployment():
    return {
        "id": "test", "status": "succeeded", "version": 1,
        "created": "2026-10-29 12:00:00.000",
        "configuration": {"environmentVariables": [{"secret": "MUST_NOT_EXPORT"}]},
        "jobs": [{
            "status": "succeeded", "started": "2026-10-29T12:00:02Z", "lastUpdated": "2026-10-29T12:00:12Z",
            "steps": [
                {"name": "Setup", "status": "succeeded", "started": "2026-10-29T12:00:02Z", "lastUpdated": "2026-10-29T12:00:05Z"},
                {"name": "pulumi update", "status": "succeeded", "started": "2026-10-29T12:00:06Z", "lastUpdated": "2026-10-29T12:00:12Z"},
            ],
        }],
    }


class TimingTests(unittest.TestCase):
    def test_breakdown_reconciles_and_omits_configuration(self):
        record, raw = extract_record("org/project/stack", deployment())
        self.assertEqual(record["queue_dispatch_s"], 2)
        self.assertEqual(record["setup_s"], 3)
        self.assertEqual(record["pulumi_operation_s"], 6)
        self.assertEqual(record["between_steps_s"], 1)
        self.assertEqual(record["total_elapsed_s"], 12)
        self.assertNotIn("MUST_NOT_EXPORT", json.dumps(raw))

    def test_skipped_is_not_a_zero_second_deployment(self):
        item = {"id": "skipped", "status": "skipped", "jobs": None}
        record, _ = extract_record("org/project/stack", item, {"include_in_comparison": True})
        self.assertIsNone(record["total_elapsed_s"])
        self.assertFalse(record["include_in_comparison"])

    def test_overlapping_steps_are_rejected(self):
        item = deployment()
        item["jobs"][0]["steps"][1]["started"] = "2026-10-29T12:00:04Z"
        with self.assertRaisesRegex(ValueError, "Overlapping"):
            extract_record("org/project/stack", item)

    def test_failed_or_unclassified_runs_do_not_enter_summary(self):
        failed = deployment()
        failed["status"] = "failed"
        a, _ = extract_record("org/project/stack", failed, {"include_in_comparison": True})
        b, _ = extract_record("org/project/stack", deployment())
        self.assertEqual(summaries([a, b]), [])

    def test_repeats_report_count_median_and_range(self):
        records = []
        for duration in (10, 14, 12):
            record, _ = extract_record("org/project/stack", deployment(), {"cohort": "controlled", "variant": "source", "include_in_comparison": True})
            record["total_elapsed_s"] = duration
            records.append(record)
        result = next(r for r in summaries(records) if r["metric"] == "total_elapsed_s")
        self.assertEqual((result["n"], result["median_s"], result["minimum_s"], result["maximum_s"]), (3, 12, 10, 14))
