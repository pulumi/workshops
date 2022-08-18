import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";

const cluster = new awsx.ecs.Cluster("cluster");

const alb = new awsx.elasticloadbalancingv2.ApplicationLoadBalancer(
    "app-lb", { external: true, securityGroups: cluster.securityGroups });
const atg = alb.createTargetGroup(
    "app-tg", { port: 80, deregistrationDelay: 0 });
const web = atg.createListener("web", { port: 80 });

const appService = new awsx.ecs.FargateService("app-svc", {
    cluster,
    taskDefinitionArgs: {
        container: {
            image: "nginx",
            portMappings: [ web ],
        },
    },
    desiredCount: 1,
});

export const url = pulumi.interpolate`${web.endpoint.hostname}`;
