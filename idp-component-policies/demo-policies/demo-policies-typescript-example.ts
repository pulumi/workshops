/**
 * TypeScript Policy Example - Preventative policies with better type safety
 * 
 * This demonstrates how TypeScript policies can provide better type checking
 * and IDE support compared to string-based resource type matching.
 */

import * as aws from "@pulumi/aws";
import { PolicyPack, validateResourceOfType } from "@pulumi/policy";

new PolicyPack("demo-policies-ts", {
    policies: [
        {
            name: "restrict-dangerous-ports",
            description: "Target Groups must not use dangerous ports",
            enforcementLevel: "mandatory",
            validateResource: validateResourceOfType(aws.lb.TargetGroup, (targetGroup, args, reportViolation) => {
                // TypeScript provides full intellisense and type checking here
                const port = targetGroup.port;
                
                if (port && [22, 23, 3389, 1433, 5432, 3306].includes(port)) {
                    reportViolation(
                        `Target Group '${args.name}' uses dangerous port ${port}. ` +
                        `Avoid well-known service ports (22=SSH, 23=Telnet, 3389=RDP, ` +
                        `1433=SQL Server, 5432=PostgreSQL, 3306=MySQL).`
                    );
                }
            }),
        },
        
        {
            name: "limit-ecs-task-memory",
            description: "ECS Task Definitions should not exceed 1GB memory",
            enforcementLevel: "advisory",
            validateResource: validateResourceOfType(aws.ecs.TaskDefinition, (taskDef, args, reportViolation) => {
                // TypeScript knows taskDef is aws.ecs.TaskDefinition
                // Full type safety and autocomplete available
                const memory = taskDef.memory;
                
                if (memory && parseInt(memory) > 1024) {
                    reportViolation(
                        `ECS Task '${args.name}' requests ${memory}MB memory. ` +
                        `Consider ≤1024MB for development environments.`
                    );
                }
                
                // Can also check container definitions with full type safety
                if (taskDef.containerDefinitions) {
                    taskDef.containerDefinitions.forEach((containerDef, index) => {
                        if (containerDef.memory && containerDef.memory > 1024) {
                            reportViolation(
                                `Container ${index} in task '${args.name}' requests ` +
                                `${containerDef.memory}MB memory. Consider ≤1024MB.`
                            );
                        }
                    });
                }
            }),
        },
        
        {
            name: "require-s3-encryption",
            description: "S3 Buckets must have server-side encryption",
            enforcementLevel: "mandatory",
            validateResource: validateResourceOfType(aws.s3.Bucket, (bucket, args, reportViolation) => {
                // TypeScript provides type-safe access to bucket properties
                if (!bucket.serverSideEncryptionConfiguration) {
                    reportViolation(
                        `S3 Bucket '${args.name}' lacks server-side encryption. ` +
                        `Add serverSideEncryptionConfiguration for security compliance.`
                    );
                }
            }),
        },
        
        {
            name: "security-group-ingress-restrictions",
            description: "Security Groups should not allow unrestricted access",
            enforcementLevel: "advisory", 
            validateResource: validateResourceOfType(aws.ec2.SecurityGroup, (sg, args, reportViolation) => {
                // TypeScript provides full type checking for security group rules
                if (sg.ingress) {
                    sg.ingress.forEach((rule, index) => {
                        // Type-safe access to ingress rule properties
                        if (rule.cidrBlocks?.includes("0.0.0.0/0") && 
                            rule.fromPort !== 80 && rule.fromPort !== 443) {
                            reportViolation(
                                `Security Group '${args.name}' rule ${index} allows ` +
                                `unrestricted access (0.0.0.0/0) on port ${rule.fromPort}. ` +
                                `Consider restricting source IP ranges.`
                            );
                        }
                    });
                }
            }),
        },
    ],
});
