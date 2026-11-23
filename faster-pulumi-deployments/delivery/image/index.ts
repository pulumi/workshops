import * as pulumi from "@pulumi/pulumi";
import * as dockerBuild from "@pulumi/docker-build";

const config = new pulumi.Config();
const repository = config.require("repository");
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

const [registryHost] = repository.split("/");
const cacheRef = `${repository}:buildcache-${language}`;

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
    tags: [`${repository}:${language}-${commit}`],
    push: true,
    cacheFrom: [{registry: {ref: cacheRef}}],
    cacheTo: [{registry: {ref: cacheRef, mode: dockerBuild.CacheMode.Max}}],
    registries: [{
        address: registryHost,
        username: process.env.REGISTRY_USERNAME,
        password: pulumi.secret(process.env.REGISTRY_PASSWORD ?? ""),
    }],
});

export const imageRef = image.ref;
