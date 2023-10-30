#!/bin/bash

mkdir -p ~/.aws
echo "${GITLAB_OIDC_TOKEN}" > /tmp/web_identity_token
echo -e "[profile oidc]\nrole_arn=${ROLE_ARN}\nweb_identity_token_file=/tmp/web_identity_token" > ~/.aws/config

echo "length of GITLAB_OIDC_TOKEN=${#GITLAB_OIDC_TOKEN}"
echo "ROLE_ARN=${ROLE_ARN}"

export AWS_PROFILE="oidc"
aws sts get-caller-identity
