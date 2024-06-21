// Copyright 2024, Pulumi Corporation.  All rights reserved.
import * as dockerBuild from "@pulumi/docker-build";
import * as pulumi from "@pulumi/pulumi"; // Required for Config
const config = new pulumi.Config();

// Docker Build Cloud (DBC) builder name
const builder = config.require("builder"); // Example, "cloud-pulumi-my-cool-builder"
const dockerUsr = config.require("DOCKER_USR");
const registryAddress = "docker.io";
const tag = registryAddress+"/"+dockerUsr+"/jan:latest";

const image = new dockerBuild.Image("image", {
    exec: true,
    builder: {
        name: builder, // Example, "cloud-pulumi-my-cool-builder",
    },
    platforms: [
        dockerBuild.Platform.Linux_amd64,
        dockerBuild.Platform.Linux_arm64,
    ],
    push: true,
    registries: [{
        address: registryAddress,
        username: dockerUsr,
        password: config.require("DOCKER_PAT"),
    }],
    tags: [tag],
    context: {
        location: "../",
    },
});
