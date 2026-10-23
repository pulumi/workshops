"""Pure rule logic for the policy pack. No Pulumi imports, so pytest can run it."""
from dataclasses import dataclass, field
from typing import Any, List, Mapping, Optional

BUCKET = "aws:s3/bucketV2:BucketV2"
PUBLIC_ACCESS_BLOCK = "aws:s3/bucketPublicAccessBlock:BucketPublicAccessBlock"
SSE_CONFIG = "aws:s3/bucketServerSideEncryptionConfigurationV2:BucketServerSideEncryptionConfigurationV2"
REQUIRED_TAGS = ("owner", "change-ref")


@dataclass
class Res:
    """The parts of a resource the rules need."""
    type: str
    urn: str
    props: Mapping[str, Any] = field(default_factory=dict)
    dependency_urns: List[str] = field(default_factory=list)


def missing_tags(props: Mapping[str, Any]) -> List[str]:
    tags = props.get("tags") or {}
    return [t for t in REQUIRED_TAGS if not tags.get(t)]


def buckets_without(resources: List[Res], companion_type: str) -> List[str]:
    """URNs of buckets that no resource of companion_type depends on."""
    covered = {u for r in resources if r.type == companion_type for u in r.dependency_urns}
    return [r.urn for r in resources if r.type == BUCKET and r.urn not in covered]


def tag_message(props: Mapping[str, Any]) -> Optional[str]:
    missing = missing_tags(props)
    if not missing:
        return None
    return "S3 bucket is missing required tags: " + ", ".join(missing)
