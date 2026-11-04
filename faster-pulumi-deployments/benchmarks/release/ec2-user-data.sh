#!/bin/bash
# EC2 user data: build the three fixture revisions on one persistent Linux AMD64 host,
# retaining Go and Docker caches between revisions, then upload timings and shut down.
set -euxo pipefail
exec > >(tee /var/log/deployment-timings.log) 2>&1

BUCKET=deployment-timings-20261104-052848974346
export BUILD_HOST=ec2
export IMAGE_REPOSITORY=052848974346.dkr.ecr.us-west-2.amazonaws.com/deployment-timings-20261104
export RELEASE_BUCKET=$BUCKET
export BASE_IMAGE=pulumi/pulumi-go:3.273.0@sha256:99ed8bb8b24722d1e41ab792348e4bdce7c52e3a86ebd549e310152cdc9f8e54
export AWS_DEFAULT_REGION=us-west-2
export HOME=/root GOPATH=/root/go GOCACHE=/root/.cache/go-build
export PATH=/usr/local/go/bin:$PATH

finish() {
    aws s3 cp /var/log/deployment-timings.log "s3://$BUCKET/timings/ec2/user-data.log" --only-show-errors || true
    shutdown -h now
}
trap finish EXIT

host_setup_start=$(date +%s.%N)
dnf install -y docker git
systemctl start docker
mkdir -p /usr/libexec/docker/cli-plugins
curl -fsSL -o /usr/libexec/docker/cli-plugins/docker-buildx \
    https://github.com/docker/buildx/releases/download/v0.38.2/buildx-v0.38.2.linux-amd64
chmod +x /usr/libexec/docker/cli-plugins/docker-buildx
curl -fsSL https://go.dev/dl/go1.26.10.linux-amd64.tar.gz | tar -C /usr/local -xz
git clone --branch bench/deployment-timings-20261104 https://github.com/pulumi/workshops.git /opt/workshops
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin "${IMAGE_REPOSITORY%%/*}"
host_setup_end=$(date +%s.%N)
python3 -c 'import json,sys,os; json.dump({"host_setup_s": round(float(sys.argv[2]) - float(sys.argv[1]), 3), "instance_type": sys.argv[3], "cpus": os.cpu_count()}, open("/opt/host-setup.json", "w"))' \
    "$host_setup_start" "$host_setup_end" "$(curl -fsS -H "X-aws-ec2-metadata-token: $(curl -fsS -X PUT -H 'X-aws-ec2-metadata-token-ttl-seconds: 60' http://169.254.169.254/latest/api/token)" http://169.254.169.254/latest/meta-data/instance-type)"
aws s3 cp /opt/host-setup.json "s3://$BUCKET/timings/ec2/host-setup.json" --only-show-errors

cd /opt/workshops
for entry in baseline:239dc32154d35e30e1246d492437e23fa742c7db code:32ccc693f3bb3d4749be4804a6325bbe9a1e6768 dependency:3609b0c5d3ede1b4965bde6c33a24cf052f872a1; do
    label=${entry%%:*}
    commit=${entry#*:}
    git worktree add "/opt/fixture-$label" "$commit"
    faster-pulumi-deployments/benchmarks/release/build-release.sh \
        "/opt/fixture-$label/faster-pulumi-deployments/benchmarks/changed-program" "$label" /opt/out
    aws s3 cp "/opt/out/release-$label.json" "s3://$BUCKET/timings/ec2/release-$label.json" --only-show-errors
done
