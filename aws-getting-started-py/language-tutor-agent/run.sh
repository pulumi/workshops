#!/bin/bash
set -e

uv sync
pulumi env run pulumi-idp/auth -- env AWS_REGION=us-east-1 uv run python -u agent.py
