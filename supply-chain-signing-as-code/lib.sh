#!/usr/bin/env bash
# lib.sh — shared helpers, sourced (never executed) by every script in this
# workshop folder via: . "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"
# shellcheck shell=bash
# shellcheck disable=SC2034 # every constant below is used by scripts that source this file, not by this file itself

say() {
  printf '\033[1;35m▶ %s\033[0m\n' "$*"
}

note() {
  printf '  \033[2m%s\033[0m\n' "$*"
}

die() {
  printf '\033[1;31mERROR: %s\033[0m\n' "$*" >&2
  exit 1
}

have() {
  command -v "$1" >/dev/null 2>&1
}

# Pinned tool versions for this workshop. Every script that checks a tool's
# presence reports the version it was built against; it does not enforce an
# exact match, since a presenter may have a newer patch release installed.
NOTATION_VERSION="1.3.2"
KUBESCAPE_VERSION="4.0.14"
KYVERNO_CHART_VERSION="3.9.1"
KIND_NODE_IMAGE="kindest/node:v1.37.0@sha256:a1ed56cfb0e7b93589bdf97c8cd566405a265939e3620fc4f5de89adff580ae5"
CLUSTER_NAME="signing-demo"
ECR_REPO_NAME="supply-chain-signing-demo"
AWS_REGION="us-east-1"
