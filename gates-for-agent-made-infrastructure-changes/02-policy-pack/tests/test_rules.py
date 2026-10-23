import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import rules  # noqa: E402
from rules import Res  # noqa: E402

B1 = "urn:pulumi:s::p::aws:s3/bucketV2:BucketV2::one"
B2 = "urn:pulumi:s::p::aws:s3/bucketV2:BucketV2::two"


def test_tags_complete():
    assert rules.missing_tags({"tags": {"owner": "a", "change-ref": "b"}}) == []


def test_tags_missing_all():
    assert rules.missing_tags({}) == ["owner", "change-ref"]


def test_tags_missing_one_and_empty_value():
    assert rules.missing_tags({"tags": {"owner": "a", "change-ref": ""}}) == ["change-ref"]


def test_tag_message():
    assert rules.tag_message({"tags": {"owner": "a", "change-ref": "b"}}) is None
    assert "owner" in rules.tag_message({"tags": {"change-ref": "b"}})


def test_buckets_without_companion():
    res = [
        Res(rules.BUCKET, B1),
        Res(rules.BUCKET, B2),
        Res(rules.PUBLIC_ACCESS_BLOCK, "pab", dependency_urns=[B1]),
    ]
    assert rules.buckets_without(res, rules.PUBLIC_ACCESS_BLOCK) == [B2]
    assert rules.buckets_without(res, rules.SSE_CONFIG) == [B1, B2]


def test_no_buckets_no_violations():
    assert rules.buckets_without([], rules.SSE_CONFIG) == []
