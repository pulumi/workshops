#!/bin/bash

# exit if a command returns a non-zero exit code and also print the commands and their args as they are executed
set -e -x

# Add the pulumi CLI to the PATH
export PATH=$PATH:$HOME/.pulumi/bin

yarn install
pulumi login
pulumi org set-default $PULUMI_ORG
pulumi stack select dev
export AWS_PROFILE="oidc"
pulumi up -y
