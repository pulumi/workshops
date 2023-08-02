package main

import (
	"encoding/json"
	"fmt"

	"github.com/pulumi/pulumi-aws/sdk/v5/go/aws"
	"github.com/pulumi/pulumi-aws/sdk/v5/go/aws/apigateway"
	"github.com/pulumi/pulumi-aws/sdk/v5/go/aws/dynamodb"
	"github.com/pulumi/pulumi-aws/sdk/v5/go/aws/iam"
	"github.com/pulumi/pulumi-aws/sdk/v5/go/aws/lambda"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi/config"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {

		lambdaRawPolicy, err := json.Marshal(map[string]interface{}{
			"Version": "2012-10-17",
			"Statement": []map[string]interface{}{
				map[string]interface{}{
					"Action": "sts:AssumeRole",
					"Effect": "Allow",
					"Principal": map[string]interface{}{
						"Service": "lambda.amazonaws.com",
					},
				},
			},
		})
		if err != nil {
			return err
		}

		lambdaRole, err := iam.NewRole(ctx, "lambda-role", &iam.RoleArgs{
			AssumeRolePolicy: pulumi.String(lambdaRawPolicy),
			ManagedPolicyArns: pulumi.StringArray{
				iam.ManagedPolicyAWSLambdaBasicExecutionRole,
			},
		})
		if err != nil {
			return err
		}

		readHighscoreLambda, err := lambda.NewFunction(ctx, "read-highscore-lambda", &lambda.FunctionArgs{
			Code:    pulumi.NewFileArchive("./function"),
			Name:    pulumi.String("highscore"),
			Role:    lambdaRole.Arn,
			Handler: pulumi.String("index.handler"),
			Runtime: pulumi.String("nodejs16.x"),
		})
		if err != nil {
			return err
		}
		highscoreRestApi, err := apigateway.NewRestApi(ctx, "highscore-rest-api", &apigateway.RestApiArgs{
			Name:        pulumi.String("HighscoreAPI"),
			Description: pulumi.String("This API serves the Highscore of different games"),
		})
		if err != nil {
			return err
		}
		highscoreResource, err := apigateway.NewResource(ctx, "highscore-resource", &apigateway.ResourceArgs{
			RestApi:  highscoreRestApi.ID(),
			ParentId: highscoreRestApi.RootResourceId,
			PathPart: readHighscoreLambda.Name,
		})
		if err != nil {
			return err
		}
		highscoreMethod, err := apigateway.NewMethod(ctx, "highscore-method", &apigateway.MethodArgs{
			RestApi:       highscoreRestApi.ID(),
			ResourceId:    highscoreResource.ID(),
			HttpMethod:    pulumi.String("GET"),
			Authorization: pulumi.String("NONE"),
		})
		if err != nil {
			return err
		}
		highscoreIntegration, err := apigateway.NewIntegration(ctx, "highscore-integration", &apigateway.IntegrationArgs{
			RestApi:               highscoreRestApi.ID(),
			ResourceId:            highscoreResource.ID(),
			HttpMethod:            highscoreMethod.HttpMethod,
			IntegrationHttpMethod: pulumi.String("POST"),
			Type:                  pulumi.String("AWS_PROXY"),
			Uri:                   readHighscoreLambda.InvokeArn,
		})
		if err != nil {
			return err
		}

		highscoreDeployment, err := apigateway.NewDeployment(ctx, "highscore-deployment", &apigateway.DeploymentArgs{
			RestApi:   highscoreRestApi.ID(),
			StageName: pulumi.String("test"),
		}, pulumi.DependsOn([]pulumi.Resource{highscoreIntegration}))
		if err != nil {
			return err
		}

		current, err := aws.GetCallerIdentity(ctx, nil, nil)
		if err != nil {
			return err
		}

		_, err = lambda.NewPermission(ctx, "apigateway-lambda-permission", &lambda.PermissionArgs{
			Action:      pulumi.String("lambda:InvokeFunction"),
			Function:    readHighscoreLambda.Name,
			Principal:   pulumi.String("apigateway.amazonaws.com"),
			StatementId: pulumi.String("AllowExecutionFromAPIGateway"),
			SourceArn:   pulumi.Sprintf("arn:aws:execute-api:%v:%v:%v/*/*/%v", config.Get(ctx, "aws:region"), current.AccountId, highscoreRestApi.ID(), highscoreResource.PathPart),
		})
		if err != nil {
			return err
		}

		highscoreDB, err := dynamodb.NewTable(ctx, "highscore-dynamodb-table", &dynamodb.TableArgs{
			Name:        pulumi.String("HighScores"),
			BillingMode: pulumi.String("PAY_PER_REQUEST"),
			HashKey:     pulumi.String("UserId"),
			RangeKey:    pulumi.String("GameTitle"),
			Attributes: dynamodb.TableAttributeArray{
				&dynamodb.TableAttributeArgs{
					Name: pulumi.String("UserId"),
					Type: pulumi.String("S"),
				},
				&dynamodb.TableAttributeArgs{
					Name: pulumi.String("GameTitle"),
					Type: pulumi.String("S"),
				},
			},
		})
		if err != nil {
			return err
		}

		highscoreDBRawPolicy := highscoreDB.Arn.ApplyT(func(arn string) string {
			dynamoPolicy, err := json.Marshal(map[string]interface{}{
				"Version": "2012-10-17",
				"Statement": []map[string]interface{}{
					{
						"Action": []string{
							"dynamodb:GetItem",
						},
						"Effect": "Allow",
						"Resource": []string{
							fmt.Sprintf("%v", arn),
						},
					},
				},
			})
			if err != nil {
				return ""
			}
			return string(dynamoPolicy)
		})

		highscoreDBPolicy, err := iam.NewPolicy(ctx, "highscore-dynamodb-policy", &iam.PolicyArgs{
			Name:   pulumi.String("dynamodb-policy"),
			Policy: highscoreDBRawPolicy,
		})
		if err != nil {
			return err
		}

		_, err = iam.NewRolePolicyAttachment(ctx, "highscore-dynamodb-policy-attachment", &iam.RolePolicyAttachmentArgs{
			PolicyArn: highscoreDBPolicy.Arn,
			Role:      lambdaRole.Name,
		})
		if err != nil {
			return err
		}

		ctx.Export("url", pulumi.Sprintf("%s/%s", highscoreDeployment.InvokeUrl, highscoreResource.PathPart))
		ctx.Export("readHighscoreLambdaArn", readHighscoreLambda.Arn)

		return nil
	})
}
