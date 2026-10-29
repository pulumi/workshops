ARG PULUMI_VERSION=3.259.0
ARG RUNTIME_IMAGE=node:22-bookworm-slim
FROM pulumi/pulumi-base:${PULUMI_VERSION} AS cli
FROM ghcr.io/astral-sh/uv:0.9.24 AS uv

FROM ${RUNTIME_IMAGE} AS base
COPY --from=cli /pulumi/bin/ /pulumi/bin/
ENV PATH="/pulumi/bin:${PATH}"
ENV PULUMI_HOME=/opt/pulumi-home
RUN apt-get update \
    && apt-get install -y --no-install-recommends bash ca-certificates curl git python3 \
    && rm -rf /var/lib/apt/lists/*

FROM base AS build
COPY --from=uv /uv /usr/local/bin/uv
WORKDIR /work
COPY . .
ARG LANGUAGE
RUN bash scripts/build.sh "$LANGUAGE" \
    && bash scripts/fetch-plugins.sh \
    && bash scripts/install-plugins.sh \
    && mkdir /payload \
    && cp -a "dist/$LANGUAGE/." /payload/ \
    && rm /payload/Pulumi.yaml

FROM base
COPY --from=build /payload/ /opt/pulumi-program/
COPY --from=build /opt/pulumi-home/plugins/ /opt/pulumi-home/plugins/
RUN if [ -f /opt/pulumi-program/prepare-python.sh ]; then \
        bash /opt/pulumi-program/prepare-python.sh; \
    fi
WORKDIR /workspace
ENTRYPOINT ["pulumi"]
