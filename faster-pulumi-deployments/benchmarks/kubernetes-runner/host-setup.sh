#!/bin/bash
# EC2 user data: run a single-node kind cluster with the customer-managed workflow agent,
# record runner Pod specs and events, and report readiness to S3.
set -euxo pipefail
exec > >(tee /var/log/k8s-runner-setup.log) 2>&1

BUCKET=deployment-timings-20261104-052848974346
REGISTRY=052848974346.dkr.ecr.us-west-2.amazonaws.com
AGENT_IMAGE=pulumi/customer-managed-workflow-agent:v2.3.2@sha256:1852859102e92516a9ba95c81e9fdca7530b8eaf91adae91aefda372df08b049
export AWS_DEFAULT_REGION=us-west-2 HOME=/root KUBECONFIG=/root/.kube/config

dnf install -y docker git
systemctl start docker
curl -fsSLo /usr/local/bin/kind https://kind.sigs.k8s.io/dl/v0.33.0/kind-linux-amd64
curl -fsSLo /usr/local/bin/kubectl https://dl.k8s.io/release/v1.37.2/bin/linux/amd64/kubectl
chmod +x /usr/local/bin/kind /usr/local/bin/kubectl
git clone --branch bench/deployment-timings-20261104 https://github.com/pulumi/workshops.git /opt/workshops
cd /opt/workshops/faster-pulumi-deployments/benchmarks/kubernetes-runner

kind create cluster --name runners --wait 180s
sed "s|AGENT_IMAGE|$AGENT_IMAGE|g" agent.yaml | kubectl apply -f -

kubectl -n cmwa create secret docker-registry ecr-pull --docker-server="$REGISTRY" \
    --docker-username=AWS --docker-password="$(aws ecr get-login-password)"
aws s3 cp "s3://$BUCKET/k8s/agent-token" /tmp/agent-token --only-show-errors
aws s3 rm "s3://$BUCKET/k8s/agent-token" --only-show-errors
kubectl -n cmwa create secret generic agent-token --from-file=PULUMI_AGENT_TOKEN=/tmp/agent-token
rm -f /tmp/agent-token

mkdir -p /opt/k8s-logs
nohup kubectl get pods -n cmwa --watch --output-watch-events -o json > /opt/k8s-logs/pods.json 2>&1 &
nohup kubectl get events -n cmwa --watch -o json > /opt/k8s-logs/events.json 2>&1 &

./configure.sh cache Always none
echo ready | aws s3 cp - "s3://$BUCKET/k8s/ready" --only-show-errors
