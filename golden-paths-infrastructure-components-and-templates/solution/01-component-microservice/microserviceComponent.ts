import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

export class MicroserviceComponent extends pulumi.ComponentResource {
    public readonly publicUrl: pulumi.Output<string>;

    constructor(name: string, args: MicroserviceComponentArgs, opts?: pulumi.ComponentResourceOptions) {
        super("component-microservice:index:MicroserviceComponent", name, args, opts);

        // Create an ECR repository for pushing.
        const ecrRepository = new awsx.ecr.Repository("repo", {
            forceDelete: true, // This will delete the repository and all images when the stack is destroyed.
        }, { parent: this });

        // Build and push an image to ECR
        const image = new awsx.ecr.Image("image", {
            repositoryUrl: ecrRepository.url,
            context: args.appPath,
            platform: "linux/amd64",
        }, { parent: this });

        const lb = new awsx.lb.ApplicationLoadBalancer("lb", {
            defaultTargetGroup: { port: args.port }
        }, { parent: this });
        const cluster = new aws.ecs.Cluster("cluster", {}, { parent: this });

        const service = new awsx.ecs.FargateService("service", {
            cluster: cluster.arn,
            assignPublicIp: true,
            desiredCount: 2,
            taskDefinitionArgs: {
                container: {
                    name: "my-service",
                    image: image.imageUri,
                    cpu: args.cpu || 256, // Default to 0.25 vCPU,
                    memory: args.memory || 512, // Default to 0.5 GB,
                    essential: true,
                    portMappings: [
                        {
                            containerPort: args.port,
                            targetGroup: lb.defaultTargetGroup,
                        },
                    ],
                },
                // Add tags to make memory value available to policies during preview
                tags: {
                    "microservice:memory": pulumi.output(args.memory || 512).apply(m => m.toString()),
                    "microservice:cpu": pulumi.output(args.cpu || 256).apply(c => c.toString()),
                    "microservice:component": "true"
                },
            },
        }, { parent: this });

        this.publicUrl = pulumi.interpolate`http://${lb.loadBalancer.dnsName}`;

        this.registerOutputs({
            publicUrl: this.publicUrl
        });
    }
}

export interface MicroserviceComponentArgs {
    /**
     * Path to a dockerized application to serve. Directory must contain a dockerfile
     */
    appPath: pulumi.Input<string>;
    /**
     * Port the application exposes
     */
    port: pulumi.Input<number>;
    /**
     * (Optional) CPU capacity. Defaults to 256 (i.e. 0.25 vCPU).
     */
    cpu?: pulumi.Input<number>;
    /**
     * (Optional) Memory capacity. Defaults to 512 (i.e. 0.5GB).
     */
    memory?: pulumi.Input<number>;
}