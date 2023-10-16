package main

import (
	"02-eda-infrastructure/internal/pubsub"
	"fmt"
	"github.com/pulumi/pulumi-aws/sdk/v6/go/aws/iam"
	"github.com/pulumi/pulumi-aws/sdk/v6/go/aws/s3"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi/config"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		cfg := config.New(ctx, "")
		infraStackRef, err := pulumi.NewStackReference(ctx, cfg.Get("infraStackRef"), nil)
		if err != nil {
			return err
		}

		oidcProviderArn := infraStackRef.GetStringOutput(pulumi.String("eks-oidc-provider-arn"))
		oidcProviderUrl := infraStackRef.GetStringOutput(pulumi.String("eks-oidc-provider-url"))

		daprRole, err := iam.NewRole(ctx, "go-eda-workshop-dapr-role", &iam.RoleArgs{
			AssumeRolePolicy: pulumi.All(oidcProviderArn, oidcProviderUrl).ApplyT(func(args []interface{}) string {
				arn := args[0].(string)
				url := args[1].(string)
				assumeRolePolicy, _ := iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
					Statements: []iam.GetPolicyDocumentStatement{
						{
							Effect: pulumi.StringRef("Allow"),
							Actions: []string{
								"sts:AssumeRoleWithWebIdentity",
								"sts:AssumeRole",
							},
							Principals: []iam.GetPolicyDocumentStatementPrincipal{
								{
									Type: "Federated",
									Identifiers: []string{
										arn,
									},
								},
							},
							Conditions: []iam.GetPolicyDocumentStatementCondition{
								{
									Test: "StringEquals",
									Values: []string{
										"system:serviceaccount:default:dapr-operator",
										"system:serviceaccount:keda:keda-operator",
									},
									Variable: fmt.Sprintf("%s:sub", url),
								},
							},
						},
					},
				})
				return assumeRolePolicy.Json
			}).(pulumi.StringOutput),
		})
		if err != nil {
			return err
		}

		darpPolicyJson, err := iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
			Statements: []iam.GetPolicyDocumentStatement{
				{
					Effect: pulumi.StringRef("Allow"),
					Actions: []string{
						"sqs:DeleteMessage",
						"sqs:ReceiveMessage",
						"sqs:ChangeMessageVisibility",
						"sqs:GetQueueUrl",
						"sqs:GetQueueAttributes",
						"sns:Publish",
						"sns:ListSubscriptionsByTopic",
						"sns:GetTopicAttributes",
						"s3:PutObject",
						"s3:GetObject",
						"s3:ListBucket",
					},
					Resources: []string{
						"*",
					},
				},
			},
		})

		daprIAMPolicy, err := iam.NewPolicy(ctx, "go-eda-workshop-dapr-policy", &iam.PolicyArgs{
			Policy: pulumi.String(darpPolicyJson.Json),
		}, pulumi.DependsOn([]pulumi.Resource{daprRole}))
		if err != nil {
			return err
		}

		_, err = iam.NewRolePolicyAttachment(ctx, "go-eda-workshop-dapr-role-policy-attachment", &iam.RolePolicyAttachmentArgs{
			PolicyArn: daprIAMPolicy.Arn,
			Role:      daprRole.Name,
		}, pulumi.DependsOn([]pulumi.Resource{daprIAMPolicy}))
		if err != nil {
			return err
		}

		ctx.Export("dapr-role-arn", daprRole.Arn)

		component, err := pubsub.NewDaprPubSubComponent(ctx, "go-eda-workshop-dapr-pubsub", &pubsub.DaprPubSubComponentArgs{
			TopicName: "orders",
			QueueName: "qrcode-processor",
		})
		if err != nil {
			return err
		}
		ctx.Export("topic-name", component.TopicName)
		ctx.Export("queue-name", component.QueueName)
		ctx.Export("queue-url", component.QueueURL)

		bucket, err := s3.NewBucketV2(ctx, "go-eda-workshop-s3-bucket", &s3.BucketV2Args{
			Bucket:       pulumi.String("pulumi-go-eda-workshop-qrcodes"),
			ForceDestroy: pulumi.Bool(true),
		})
		if err != nil {
			return err
		}
		ctx.Export("s3-bucket-name", bucket.Bucket)
		ownershipControls, err := s3.NewBucketOwnershipControls(ctx, "go-eda-workshop-s3-bucket-ownership-controls", &s3.BucketOwnershipControlsArgs{
			Bucket: bucket.ID(),
			Rule: s3.BucketOwnershipControlsRuleArgs{
				ObjectOwnership: pulumi.String("BucketOwnerPreferred"),
			},
		})
		if err != nil {
			return err
		}
		publicAccessBlock, err := s3.NewBucketPublicAccessBlock(ctx, "go-eda-workshop-s3-bucket-public-access-block", &s3.BucketPublicAccessBlockArgs{
			Bucket:                bucket.ID(),
			BlockPublicAcls:       pulumi.Bool(false),
			BlockPublicPolicy:     pulumi.Bool(false),
			IgnorePublicAcls:      pulumi.Bool(false),
			RestrictPublicBuckets: pulumi.Bool(false),
		})
		if err != nil {
			return err
		}

		_, err = s3.NewBucketAclV2(ctx, "go-eda-workshop-s3-bucket-acl", &s3.BucketAclV2Args{
			Bucket: bucket.ID(),
			Acl:    pulumi.String("public-read"),
		}, pulumi.DependsOn([]pulumi.Resource{ownershipControls, publicAccessBlock}))
		if err != nil {
			return err
		}

		return nil
	})
}
