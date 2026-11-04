import json
import re
import tomllib
import xml.etree.ElementTree as ET
from pathlib import Path

root = Path(__file__).resolve().parent.parent
name, version = (root / "provider-plugins.txt").read_text().split()
assert name == "random", "This fixture expects the Random provider"
programs = root / "programs"
actual = {}
actual["typescript"] = json.loads((programs / "typescript/package.json").read_text())["dependencies"]["@pulumi/random"]
actual["go"] = re.search(r"pulumi-random/sdk/v4 v(\S+)", (programs / "go/go.mod").read_text()).group(1)
project = ET.parse(programs / "dotnet/DeploymentProgram.csproj")
actual["dotnet"] = project.find(".//PackageReference[@Include='Pulumi.Random']").attrib["Version"]
ns = {"m": "http://maven.apache.org/POM/4.0.0"}
pom = ET.parse(programs / "java/pom.xml")
for dependency in pom.findall("m:dependencies/m:dependency", ns):
    if dependency.findtext("m:artifactId", namespaces=ns) == "random":
        actual["java"] = dependency.findtext("m:version", namespaces=ns)
python = tomllib.loads((programs / "python/pyproject.toml").read_text())
actual["python"] = next(d.split("==")[1] for d in python["project"]["dependencies"] if d.startswith("pulumi-random=="))
for language, sdk_version in actual.items():
    assert sdk_version == version, f"{language}: SDK {sdk_version} does not match plugin {version}"
    print(f"PASS {language}: Random SDK and plugin {version}")
