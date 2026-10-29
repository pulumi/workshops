import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "scripts/checksum.py"


class ChecksumTests(unittest.TestCase):
    def run_tool(self, mode, path):
        return subprocess.run(
            [sys.executable, str(SCRIPT), mode, str(path)],
            capture_output=True,
            text=True,
        )

    def test_verified_artifact(self):
        with tempfile.TemporaryDirectory() as directory:
            archive = Path(directory) / "program.tar.gz"
            archive.write_bytes(b"release contents")
            self.assertEqual(self.run_tool("write", archive).returncode, 0)
            result = self.run_tool("verify", archive.with_suffix(".gz.sha256"))
            self.assertEqual(result.returncode, 0, result.stderr)

    def test_changed_artifact_fails(self):
        with tempfile.TemporaryDirectory() as directory:
            archive = Path(directory) / "program.tar.gz"
            archive.write_bytes(b"original release")
            self.assertEqual(self.run_tool("write", archive).returncode, 0)
            archive.write_bytes(b"changed release")
            result = self.run_tool("verify", archive.with_suffix(".gz.sha256"))
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("does not match", result.stderr)

    def test_manifest_cannot_select_parent_file(self):
        with tempfile.TemporaryDirectory() as directory:
            manifest = Path(directory) / "program.tar.gz.sha256"
            manifest.write_text("0" * 64 + "  ../program.tar.gz\n")
            result = self.run_tool("verify", manifest)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("same directory", result.stderr)
