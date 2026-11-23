import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as dockerBuild from "@pulumi/docker-build";

const config = new pulumi.Config();
const commit = config.require("commit");
const language = config.get("language") ?? "go";
const pulumiVersion = config.get("pulumiVersion") ?? "3.277.0";

const runtimeImages: Record<string, string> = {
    typescript: "node:22-bookworm-slim",
    python: "python:3.12-slim-bookworm",
    go: "golang:1.25-bookworm",
    dotnet: "mcr.microsoft.com/dotnet/sdk:8.0",
    java: "maven:3.9.9-eclipse-temurin-17",
};
const runtimeImage = runtimeImages[language];
if (!runtimeImage) {
    throw new Error(`unsupported language: ${language}`);
}

const usEast1 = new aws.Provider("us-east-1", {region: "us-east-1"});

const repository = new aws.ecrpublic.Repository("executor", {
    repositoryName: "faster-pulumi-deployments",
    catalogData: {
        description: "Prepared Pulumi executor images for the faster Pulumi deployments workshop.",
    },
}, {provider: usEast1});

const token = aws.ecrpublic.getAuthorizationTokenOutput({}, {provider: usEast1});

const cacheRef = pulumi.interpolate`${repository.repositoryUri}:buildcache-${language}`;

const image = new dockerBuild.Image("executor", {
    context: {location: "../.."},
    dockerfile: {location: "../../images/Dockerfile"},
    target: "runtime",
    platforms: ["linux/amd64"],
    buildArgs: {
        LANGUAGE: language,
        RUNTIME_IMAGE: runtimeImage,
        PULUMI_VERSION: pulumiVersion,
    },
    tags: [pulumi.interpolate`${repository.repositoryUri}:${language}-${commit}`],
    push: true,
    cacheFrom: [{registry: {ref: cacheRef}}],
    cacheTo: [{
        registry: {
            ref: cacheRef,
            mode: dockerBuild.CacheMode.Max,
            imageManifest: true,
            ociMediaTypes: true,
        },
    }],
    registries: [{
        address: "public.ecr.aws",
        username: token.userName,
        password: pulumi.secret(token.password),
    }],
});

export const imageRef = image.ref;
