package myproject;

import com.pulumi.Pulumi;
import com.pulumi.asset.*;
import com.pulumi.aws.apigatewayv2.*;
import com.pulumi.aws.apigatewayv2.inputs.StageRouteSettingArgs;
import com.pulumi.aws.iam.Role;
import com.pulumi.aws.iam.RolePolicyAttachment;
import com.pulumi.aws.iam.RoleArgs;
import com.pulumi.aws.iam.RolePolicyAttachmentArgs;
import com.pulumi.aws.lambda.*;
import com.pulumi.aws.lambda.inputs.FunctionSnapStartArgs;
import com.pulumi.command.local.Command;
import com.pulumi.command.local.CommandArgs;
import com.pulumi.core.Output;
import com.pulumi.resources.CustomResourceOptions;

public class App {
    public static void main(String[] args) {
        Pulumi.run(ctx -> {
            // Create an IAM Role for the Lambda function
            var role = new Role("lambdaRole", RoleArgs.builder()
                    .assumeRolePolicy("""
                        {
                          "Version": "2012-10-17",
                          "Statement": [
                            {
                              "Action": "sts:AssumeRole",
                              "Principal": {
                                "Service": "lambda.amazonaws.com"
                              },
                              "Effect": "Allow",
                              "Sid": ""
                            }
                          ]
                        }
                    """)
                    .build());

            new RolePolicyAttachment("lambdaPolicyAttachment", RolePolicyAttachmentArgs.builder()
                    .role(role.name())
                    .policyArn("arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole")
                    .build());

            var lambdaFunction = new Function("javaLambdaFunction", FunctionArgs.builder()
                    .code(new FileArchive("petstore.zip")) // Path to the ZIP file
                    .runtime("java11")
                    .handler("com.amazonaws.serverless.sample.springboot2.StreamLambdaHandler::handleRequest")
                    .memorySize(1512)
                    .timeout(60)
                    .role(role.arn())
                    .snapStart(FunctionSnapStartArgs.builder()
                            .applyOn("PublishedVersions")
                        .build())
                    .build());

            var publishVersion = new Command("publishVersion",
                    CommandArgs.builder()
                        .create(Output.format("aws lambda publish-version --function-name %s", lambdaFunction.arn()))
                        .triggers(lambdaFunction)
                        .build(),
                    CustomResourceOptions.builder()
                            .dependsOn(lambdaFunction)
                            .build()
            );

            var alias = new Alias("lambdaAlias",
                    AliasArgs.builder()
                        .functionName(lambdaFunction.arn())
                        .functionVersion("1")
                        .name("v1")
                        .build(),
                    CustomResourceOptions.builder()
                            .dependsOn(publishVersion)
                            .build()
            );

            var api = new Api("api", ApiArgs.builder()
                    .protocolType("HTTP")
                    .build()
            );

            var integration = new Integration("integration", IntegrationArgs.builder()
                    .apiId(api.id())
                    .integrationType("AWS_PROXY")
                    .integrationUri(alias.arn())
                    .integrationMethod("GET")
                    .payloadFormatVersion("1.0")
                    .passthroughBehavior("WHEN_NO_MATCH")
                    .connectionType("INTERNET")
                    .build()
            );

            var route = new Route("route", RouteArgs.builder()
                    .apiId(api.id())
                    .routeKey("$default")
                    .target(Output.format("integrations/%s", integration.id()))
                    .build()
            );

            new Stage("stage",
                StageArgs.builder()
                    .apiId(api.id())
                    .name("$default")
                    .routeSettings(StageRouteSettingArgs.builder()
                            .routeKey(route.routeKey())
                            .throttlingBurstLimit(5000)
                            .throttlingRateLimit(10000.0)
                            .build()
                    )
                    .autoDeploy(true)
                    .build(),
                CustomResourceOptions.builder()
                    .dependsOn(route)
                    .build()
            );

            new Permission("permission", PermissionArgs.builder()
                    .action("lambda:InvokeFunction")
                    .principal("apigateway.amazonaws.com")
                    .function(alias.arn())
                    .sourceArn(Output.format("%s/*/*", api.executionArn()))
                    .build()
            );

            ctx.export("url", Output.format("%s/pets", api.apiEndpoint()));
        });
    }
}
