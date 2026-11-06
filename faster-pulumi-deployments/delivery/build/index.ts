import * as pulumi from "@pulumi/pulumi";
import * as delivery from "@pulumi/delivery";

const config = new pulumi.Config();
const org = pulumi.getOrganization();
const branch = config.get("branch") ?? "delivery-tests";
const probeCrossStage = config.getBoolean("probeCrossStage") ?? false;
const publishSecretArtifact = config.getBoolean("publishSecretArtifact") ?? false;
const root = "faster-pulumi-deployments";

const repo = new delivery.GitHubSource("workshops", {
    repository: "pulumi/workshops",
    branch,
    trigger: {paths: [`${root}/programs/go/**`, `${root}/delivery/build/**`, `${root}/delivery/scripts/**`]},
});

const pipeline = new delivery.Pipeline("fpd-build", {
    program: {source: repo, directory: `${root}/delivery/build`},
});

const build = new delivery.Stage("build", {pipeline});

const probe = new delivery.Job("probe", {
    stage: build,
    source: repo,
    directory: root,
    command: "bash delivery/scripts/probe.sh",
    environment: {PUBLISH_SECRET: String(publishSecretArtifact)},
});
const programDigest = probe.outputs.apply(outputs => String(outputs["programDigest"] ?? "none"));

new delivery.Artifact("programDigest", {stage: build, value: programDigest});
new delivery.Artifact("commit", {stage: build, value: repo.commit});
if (publishSecretArtifact) {
    new delivery.Artifact("probeSecret", {stage: build, value: probe.outputs.apply(outputs => outputs["probeSecret"])});
}

new delivery.Stacks("dev", {
    stage: build,
    stacks: {
        app: {
            stack: `${org}/faster-pulumi-deployments/delivery-dev`,
            source: repo,
            directory: `${root}/programs/go`,
            config: {
                environment: "development",
                buildDigest: programDigest,
            },
        },
    },
});

const prod = new delivery.Stage("prod", {
    pipeline,
    from: [build],
    when: delivery.manualOutput({description: "Promote the development build to production."}),
});

new delivery.Stacks("prod", {
    stage: prod,
    stacks: {
        app: {
            stack: `${org}/faster-pulumi-deployments/delivery-prod`,
            source: repo,
            directory: `${root}/programs/go`,
            config: {environment: "production"},
        },
    },
});

if (probeCrossStage) {
    new delivery.Job("cross-stage", {
        stage: prod,
        source: repo,
        directory: root,
        command: "echo \"digest from the build stage: $DIGEST\"",
        environment: {DIGEST: programDigest},
    });
}

export const release = pipeline.releaseNumber;
