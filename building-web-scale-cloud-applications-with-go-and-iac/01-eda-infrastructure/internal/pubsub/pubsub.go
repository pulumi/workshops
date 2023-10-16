package pubsub

import (
	"fmt"
	"github.com/pulumi/pulumi-aws/sdk/v6/go/aws/iam"
	"github.com/pulumi/pulumi-aws/sdk/v6/go/aws/sns"
	"github.com/pulumi/pulumi-aws/sdk/v6/go/aws/sqs"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

type DaprPubSubComponent struct {
	pulumi.ResourceState

	QueueURL  pulumi.StringOutput `pulumi:"queueUrl"`
	TopicName pulumi.StringOutput `pulumi:"topicName"`
	QueueName pulumi.StringOutput `pulumi:"queueName"`
}

type DaprPubSubComponentArgs struct {
	TopicName string
	QueueName string
}

func NewDaprPubSubComponent(ctx *pulumi.Context, name string, args *DaprPubSubComponentArgs, opts ...pulumi.ResourceOption) (*DaprPubSubComponent, error) {
	var pubsub DaprPubSubComponent
	err := ctx.RegisterComponentResource("pkg:pubsub:DaprPubSubComponent", name, &pubsub, opts...)
	if err != nil {
		return nil, err
	}
	topic, err := sns.NewTopic(ctx, fmt.Sprintf("%s-sns-topic", name), &sns.TopicArgs{
		Name: pulumi.String(args.TopicName),
		Tags: pulumi.StringMap{
			"dapr-topic-name": pulumi.String(args.TopicName),
		},
	}, pulumi.Parent(&pubsub))
	if err != nil {
		return nil, err
	}
	queue, err := sqs.NewQueue(ctx, fmt.Sprintf("%s-sqs-queue", name), &sqs.QueueArgs{
		Name: pulumi.String(args.QueueName),
		Tags: pulumi.StringMap{
			"dapr-queue-name": pulumi.String(args.QueueName),
		},
	}, pulumi.Parent(&pubsub))
	if err != nil {
		return nil, err
	}

	_, err = sqs.NewQueuePolicy(ctx, fmt.Sprintf("%s-sqs-queue-policy", name), &sqs.QueuePolicyArgs{
		Policy: pulumi.All(queue.Arn, topic.Arn).ApplyT(func(args []interface{}) string {
			queueArn := args[0].(string)
			topicArn := args[1].(string)
			queuePolicy, _ := iam.GetPolicyDocument(ctx, &iam.GetPolicyDocumentArgs{
				Statements: []iam.GetPolicyDocumentStatement{
					{
						Effect: pulumi.StringRef("Allow"),
						Principals: []iam.GetPolicyDocumentStatementPrincipal{
							{
								Type: "Service",
								Identifiers: []string{
									"sns.amazonaws.com",
								},
							},
						},
						Actions: []string{
							"sqs:SendMessage",
						},
						Resources: []string{
							queueArn,
						},
						Conditions: []iam.GetPolicyDocumentStatementCondition{
							{
								Test: "ArnEquals",
								Values: []string{
									topicArn,
								},
								Variable: fmt.Sprintf("aws:SourceArn"),
							},
						},
					},
				},
			})
			return queuePolicy.Json
		}).(pulumi.StringOutput),
		QueueUrl: queue.Url,
	}, pulumi.Parent(&pubsub))
	if err != nil {
		return nil, err
	}

	_, err = sns.NewTopicSubscription(ctx, fmt.Sprintf("%s-sns-topic-subscription", name), &sns.TopicSubscriptionArgs{
		Protocol: pulumi.String("sqs"),
		Topic:    topic.Arn,
		Endpoint: queue.Arn,
	}, pulumi.Parent(&pubsub))
	if err != nil {
		return nil, err
	}
	pubsub.QueueURL = queue.Url
	pubsub.TopicName = topic.Name
	pubsub.QueueName = queue.Name
	if err := ctx.RegisterResourceOutputs(&pubsub, pulumi.Map{
		"queueUrl":  pubsub.QueueURL,
		"topicName": pubsub.TopicName,
		"queueName": pubsub.QueueName,
	}); err != nil {
		return nil, err
	}
	return &pubsub, nil
}
