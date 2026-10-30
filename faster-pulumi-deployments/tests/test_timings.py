import json
import unittest
from unittest.mock import MagicMock, patch

from benchmarks.collect import extract_record, request, summaries
from benchmarks.run import inspect


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
    @patch("benchmarks.run.request")
    def test_code_change_rejects_resource_replacements(self, api):
        api.return_value = [{"info": {"kind": "update", "result": "succeeded", "resourceChanges": {"replace": 1, "same": 1}}}]
        run = {"cohort": "controlled-code-change", "cache_expectation": "disabled"}
        with self.assertRaisesRegex(ValueError, "no-change"):
            inspect("https://example.test", "/deployments", deployment(), run)

    @patch("benchmarks.run.logs", return_value="Cache restored successfully")
    @patch("benchmarks.run.request")
    def test_dependency_change_rejects_an_already_warm_key(self, api, logs):
        api.return_value = [{"info": {"kind": "update", "result": "succeeded", "resourceChanges": {"same": 2}}}]
        item = deployment()
        item["jobs"][0]["steps"].append({"name": "Restore cache"})
        run = {"cohort": "controlled-dependency-change", "cache_expectation": "miss"}
        with self.assertRaisesRegex(ValueError, "Expected cache miss"):
            inspect("https://example.test", "/deployments", item, run)

    @patch.dict("os.environ", {"PULUMI_ACCESS_TOKEN": "test-token"})
    @patch("benchmarks.collect.time.sleep")
    @patch("benchmarks.collect.urllib.request.urlopen")
    def test_read_timeout_retries_the_same_request(self, urlopen, sleep):
        response = MagicMock()
        response.__enter__.return_value.read.return_value = b'{"status": "succeeded"}'
        urlopen.side_effect = [TimeoutError(), response]
        self.assertEqual(request("https://example.test", "/deployment/existing"), {"status": "succeeded"})
        self.assertEqual(urlopen.call_count, 2)
        self.assertIs(urlopen.call_args_list[0].args[0], urlopen.call_args_list[1].args[0])

    @patch.dict("os.environ", {"PULUMI_ACCESS_TOKEN": "test-token"})
    @patch("benchmarks.collect.urllib.request.urlopen", side_effect=TimeoutError())
    def test_create_timeout_never_retries_a_deployment(self, urlopen):
        with self.assertRaises(TimeoutError):
            request("https://example.test", "/deployments", "POST", {})
        urlopen.assert_called_once()

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
