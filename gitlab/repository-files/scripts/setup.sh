#!/bin/bash

# exit if a command returns a non-zero exit code and also print the commands and their args as they are executed
set -e -x

# Make sure everything we need is installed:
which curl tar node npm

# Ensure all necessary operating system packages are in place:
apt-get update -y
apt-get install sudo ca-certificates curl gnupg tar -y

# Download and install Pulumi:
curl -fsSL https://get.pulumi.com/ | bash
export PATH=$PATH:$HOME/.pulumi/bin

# Login into pulumi. This will require the PULUMI_ACCESS_TOKEN environment variable:
pulumi login

# Install nodejs:
mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
NODE_MAJOR=20
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
apt-get update -y
apt-get install -y nodejs

# Install yarn (The `pulumi` command will install any required npm packages):
npm i -g yarn