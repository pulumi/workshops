import hashlib
import sys
from pathlib import Path


def checksum(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


mode, argument = sys.argv[1:]
path = Path(argument).resolve()
if mode == "write":
    digest = checksum(path)
    path.with_name(path.name + ".sha256").write_text(f"{digest}  {path.name}\n")
elif mode == "verify":
    digest, filename = path.read_text().strip().split(maxsplit=1)
    if Path(filename).name != filename:
        raise SystemExit("Checksum must refer to a filename in the same directory")
    actual = checksum(path.with_name(filename))
    if actual != digest:
        raise SystemExit("Artifact checksum does not match")
    print("Verified", filename)
else:
    raise SystemExit("Usage: checksum.py write <archive> | verify <checksum-file>")
