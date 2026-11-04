ARG BASE_IMAGE=pulumi/pulumi-go:3.273.0
FROM ${BASE_IMAGE} AS runtime
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 \
    && rm -rf /var/lib/apt/lists/*

FROM runtime AS tools
RUN apt-get update \
    && apt-get install -y --no-install-recommends unzip \
    && curl -fsSL https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip -o /tmp/awscliv2.zip \
    && unzip -q /tmp/awscliv2.zip -d /tmp \
    && /tmp/aws/install \
    && rm -rf /tmp/aws /tmp/awscliv2.zip /var/lib/apt/lists/*

FROM runtime AS prepared
COPY plugins/pulumi-resource-random-v4.18.2-linux-amd64.tar.gz /tmp/random.tar.gz
RUN pulumi plugin install resource random 4.18.2 --exact --file /tmp/random.tar.gz \
    && rm /tmp/random.tar.gz
COPY infra /opt/pulumi-program/infra
