import * as pulumi from "@pulumi/pulumi";

const config = pulumi.Config();

const container = config.require("container");

