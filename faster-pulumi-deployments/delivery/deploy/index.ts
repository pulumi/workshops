import * as pulumi from "@pulumi/pulumi";
import * as delivery from "@pulumi/delivery";

const config = new pulumi.Config();
const org = pulumi.getOrganization();
const branch = config.get("branch") ?? "delivery-tests";
const buildPipeline = config.get("buildPipeline") ?? `${org}/fpd-build-delivery/main`;
const root = "faster-pulumi-deployments";

const repo = new delivery.GitHubSource("workshops", {
    repository: "pulumi/workshops",
    branch,
    trigger: {paths: [`${root}/delivery/deploy/**`]},
});

const built = new delivery.PipelineSource("built", {
    pipeline: buildPipeline,
    stage: "build",
    trigger: true,
});

const pipeline = new delivery.Pipeline("fpd-deploy", {
    program: {source: repo, directory: `${root}/delivery/deploy`},
});

const staging = new delivery.Stage("staging", {pipeline});

const app = new delivery.Stacks("staging", {
    stage: staging,
    stacks: {
        app: {
            stack: `${org}/faster-pulumi-deployments/delivery-staging`,
            source: repo,
            directory: `${root}/programs/go`,
            config: {
                environment: "staging",
                buildDigest: built.artifacts.apply(artifacts => String(artifacts["programDigest"] ?? "none")),
                buildCommit: built.artifacts.apply(artifacts => String(artifacts["commit"] ?? "none")),
            },
        },
    },
});

export const upstreamRelease = built.releaseNumber;
export const upstreamRun = built.runNumber;
export const upstreamArtifacts = built.artifacts;
export const stagingOutputs = app.outputs;
