import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

const stack = pulumi.getStack();

const backendImageName = "backend";
const backend = new docker.RemoteImage(`${backendImageName}`, {
    name: "pulumi/tutorial-pulumi-fundamentals-backend:latest",
});

// build our frontend image!
const frontendImageName = "frontend";
const frontend = new docker.RemoteImage(`${frontendImageName}`, {
    name: "pulumi/tutorial-pulumi-fundamentals-frontend:latest",
});

// build our mongodb image!
const mongoImage = new docker.RemoteImage("mongo", {
    name: "pulumi/tutorial-pulumi-fundamentals-database-local:latest",
});