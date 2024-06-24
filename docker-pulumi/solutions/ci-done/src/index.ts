// Copyright 2024, Pulumi Corporation.  All rights reserved.

import * as dockerBuild from "@pulumi/docker-build";
import * as pulumi from "@pulumi/pulumi"; // Required for Config

// Get the configuration values
// from the Pulumi.<stack>.yaml file
const config = new pulumi.Config();

// Example, "cloud-pulumidockerdemo-my-cool-builder", 
// where "my-cool-builder" is the name of the builder, 
// and "pulumidockerdemo" is the DBC organization.
const builderInstance = "cloud-" + config.require("DOCKER_DBC_ORG") + "-" + config.require("DOCKER_DBC_BUILDER_NAME");
const dockerUsr = config.require("DOCKER_USR");

// Push the image to Docker Hub once built in DBC, edit as needed
const registryAddress = "docker.io";
const tag = registryAddress + "/" + dockerUsr + "/" + config.require("DOCKER_TAG");

// Build the image in DBC using the pre-configured builder and remote git repo as the context
new dockerBuild.Image("image", {
    exec: true,
    builder: {
        name: builderInstance,
    },
    context: {
        location: config.require("DOCKERFILE_REPO"),
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
});
