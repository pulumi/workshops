import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";

const cluster = new awsx.ecs.Cluster("cluster");
