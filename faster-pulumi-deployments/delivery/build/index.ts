import * as pulumi from "@pulumi/pulumi";
import * as delivery from "@pulumi/delivery";

const config = new pulumi.Config();
const org = pulumi.getOrganization();
const branch = config.get("branch") ?? "delivery-tests";
const repository = config.require("repository");
const registryUsername = config.require("registryUsername");
const registryPassword = config.requireSecret("registryPassword");
const root = "faster-pulumi-deployments";
const project = `${org}/faster-pulumi-deployments`;

const repo = new delivery.GitHubSource("workshops", {
    repository: "pulumi/workshops",
    branch,
    trigger: {
        paths: [
            `${root}/programs/go/**`,
            `${root}/images/**`,
            `${root}/scripts/**`,
            `${root}/provider-plugins.txt`,
            `${root}/delivery/build/**`,
            `${root}/delivery/image/**`,
        ],
    },
});

const pipeline = new delivery.Pipeline("fpd-build");

const build = new delivery.Stage("build", {pipeline});

const image = new delivery.Stacks("image", {
    stage: build,
    stacks: {
        image: {
            stack: `${org}/fpd-image-delivery/go`,
            source: repo,
            directory: `${root}/delivery/image`,
            config: {repository, commit: repo.commit, language: "go"},
            environment: {
                REGISTRY_USERNAME: registryUsername,
                REGISTRY_PASSWORD: registryPassword,
            },
        },
    },
});

const imageRef = image.outputs.apply(outputs => String(outputs?.["image"]?.["imageRef"] ?? ""));

new delivery.Artifact("imageRef", {stage: build, value: imageRef});
new delivery.Artifact("commit", {stage: build, value: repo.commit});

function deployImage(stage: delivery.Stage, name: string, environment: string): delivery.Stacks {
    return new delivery.Stacks(name, {
        stage,
        stacks: {
            app: {
                stack: `${project}/delivery-${name}`,
                source: repo,
                directory: `${root}/programs/go`,
                config: {environment},
                image: {
                    reference: imageRef,
                    credentials: {username: registryUsername, password: registryPassword},
                },
                preRunCommands: ["cp Pulumi.image.yaml Pulumi.yaml"],
            },
        },
    });
}

const dev = new delivery.Stage("dev", {pipeline, from: [build]});
deployImage(dev, "dev", "development");

const prod = new delivery.Stage("prod", {
    pipeline,
    from: [dev],
    when: delivery.manual({description: "Promote the image that development ran to production."}),
});
deployImage(prod, "prod", "production");

export const release = pipeline.releaseNumber;
