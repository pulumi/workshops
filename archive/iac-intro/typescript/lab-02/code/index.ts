import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

const config = new pulumi.Config();
const stack = pulumi.getStack();

const imageName = config.require('image_name');

const image = new docker.Image('local-image', {
    build: './app',
    imageName: `${imageName}:${stack}`,
    skipPush: true,
})

const container = new docker.Container('local-container', {
    image: image.baseImageName,
    ports: [{
        internal: 3000,
        external: 3000,
    }]
})
