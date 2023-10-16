package main

import (
	"02-eda-workload/internal/daprimage"
	"github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes"
	"github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/apiextensions"
	appsv1 "github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/apps/v1"
	v1 "github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/core/v1"
	metav1 "github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/meta/v1"
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

		edaInfraStackRef, err := pulumi.NewStackReference(ctx, cfg.Get("edaInfraStackRef"), nil)
		if err != nil {
			return err
		}

		checkout, err := daprimage.NewImage(ctx, "go-eda-workshop-checkout", &daprimage.ImageArgs{
			Name:    "checkout",
			Context: "./apps/checkout",
		})
		if err != nil {
			return err
		}
		ctx.Export("checkout", checkout.RepoDigest)

		orderProcessor, err := daprimage.NewImage(ctx, "go-eda-workshop-qrcode-processor", &daprimage.ImageArgs{
			Name:    "qrcode-processor",
			Context: "./apps/qrcode-processor",
		})
		if err != nil {
			return err
		}
		ctx.Export("qrcode-processor", orderProcessor.RepoDigest)

		k8sProvider, err := kubernetes.NewProvider(ctx, "k8s-provider", &kubernetes.ProviderArgs{
			Kubeconfig:            infraStackRef.GetStringOutput(pulumi.String("kubeconfig")),
			EnableServerSideApply: pulumi.Bool(true),
		})

		// dapr component for AWS SNS/SQS
		orderpubsubComponent, err := apiextensions.NewCustomResource(ctx, "go-eda-workshop-dapr-aws-pubsub", &apiextensions.CustomResourceArgs{
			ApiVersion: pulumi.String("dapr.io/v1alpha1"),
			Kind:       pulumi.String("Component"),
			Metadata: &metav1.ObjectMetaArgs{
				Name: pulumi.String("orderpubsub"),
			},
			OtherFields: kubernetes.UntypedArgs{
				"spec": kubernetes.UntypedArgs{
					"type":    pulumi.String("pubsub.aws.snssqs"),
					"version": pulumi.String("v1"),
					"metadata": pulumi.Array{
						pulumi.Map{
							"name":  pulumi.String("region"),
							"value": pulumi.String("eu-central-1"),
						},
						pulumi.Map{
							"name":  pulumi.String("disableEntityManagement"),
							"value": pulumi.String("true"),
						},
					},
				},
			},
		}, pulumi.Provider(k8sProvider))

		// dapr component for AWS S3 binding
		s3bindingComponent, err := apiextensions.NewCustomResource(ctx, "go-eda-workshop-dapr-aws-s3", &apiextensions.CustomResourceArgs{
			ApiVersion: pulumi.String("dapr.io/v1alpha1"),
			Kind:       pulumi.String("Component"),
			Metadata: &metav1.ObjectMetaArgs{
				Name: pulumi.Sprintf("%s-s3", edaInfraStackRef.GetStringOutput(pulumi.String("s3-bucket-name"))),
			},
			OtherFields: kubernetes.UntypedArgs{
				"spec": kubernetes.UntypedArgs{
					"type":    pulumi.String("bindings.aws.s3"),
					"version": pulumi.String("v1"),
					"metadata": pulumi.Array{
						pulumi.Map{
							"name":  pulumi.String("bucket"),
							"value": edaInfraStackRef.GetStringOutput(pulumi.String("s3-bucket-name")),
						},
						pulumi.Map{
							"name":  pulumi.String("region"),
							"value": pulumi.String("eu-central-1"),
						},
						pulumi.Map{
							"name":  pulumi.String("direction"),
							"value": pulumi.String("output"),
						},
					},
				},
			},
		}, pulumi.Provider(k8sProvider))

		// keda scaler for AWS SQS
		triggerAuth, err := apiextensions.NewCustomResource(ctx, "go-eda-workshop-keda-aws-trigger", &apiextensions.CustomResourceArgs{
			ApiVersion: pulumi.String("keda.sh/v1alpha1"),
			Kind:       pulumi.String("TriggerAuthentication"),
			Metadata: &metav1.ObjectMetaArgs{
				Name: pulumi.String("keda-trigger-auth-aws"),
			},
			OtherFields: kubernetes.UntypedArgs{
				"spec": kubernetes.UntypedArgs{
					"podIdentity": pulumi.Map{
						"provider": pulumi.String("aws-eks"),
					},
				},
			},
		}, pulumi.Provider(k8sProvider))

		serviceAccount, err := v1.NewServiceAccount(ctx, "go-eda-workshop-dapr-sa", &v1.ServiceAccountArgs{
			Metadata: &metav1.ObjectMetaArgs{
				Name: pulumi.String("dapr-operator"),
				Annotations: pulumi.StringMap{
					"eks.amazonaws.com/role-arn": edaInfraStackRef.GetStringOutput(pulumi.String("dapr-role-arn")),
				},
			},
		}, pulumi.Provider(k8sProvider))
		if err != nil {
			return err
		}

		checkoutDeployment, err := appsv1.NewDeployment(ctx, "go-eda-workshop-checkout-deployment", &appsv1.DeploymentArgs{
			Metadata: &metav1.ObjectMetaArgs{
				Name: pulumi.String("checkout"),
			},
			Spec: &appsv1.DeploymentSpecArgs{
				Replicas: pulumi.Int(1),
				Selector: &metav1.LabelSelectorArgs{
					MatchLabels: pulumi.StringMap{
						"app": pulumi.String("checkout"),
					},
				},
				Template: &v1.PodTemplateSpecArgs{
					Metadata: &metav1.ObjectMetaArgs{
						Labels: pulumi.StringMap{
							"app": pulumi.String("checkout"),
						},
						Annotations: pulumi.StringMap{
							"dapr.io/enabled":            pulumi.String("true"),
							"dapr.io/app-id":             pulumi.String("checkout"),
							"dapr.io/app-port":           pulumi.String("3000"),
							"dapr.io/enable-api-logging": pulumi.String("true"),
						},
					},
					Spec: &v1.PodSpecArgs{
						ServiceAccount: serviceAccount.Metadata.Name(),
						Containers: v1.ContainerArray{
							&v1.ContainerArgs{
								Name:  pulumi.String("checkout"),
								Image: checkout.RepoDigest,
								Ports: v1.ContainerPortArray{
									&v1.ContainerPortArgs{
										Name:          pulumi.String("http"),
										ContainerPort: pulumi.Int(3000),
									},
								},
								Env: v1.EnvVarArray{
									&v1.EnvVarArgs{
										Name:  pulumi.String("PUBSUB_COMPONENT_NAME"),
										Value: orderpubsubComponent.Metadata.Name(),
									},
									&v1.EnvVarArgs{
										Name:  pulumi.String("PUBSUB_TOPIC"),
										Value: edaInfraStackRef.GetStringOutput(pulumi.String("topic-name")),
									},
								},
								ImagePullPolicy: pulumi.String("Always"),
								LivenessProbe: &v1.ProbeArgs{
									InitialDelaySeconds: pulumi.Int(5),
									HttpGet: &v1.HTTPGetActionArgs{
										Path:   pulumi.String("/health/liveness"),
										Port:   pulumi.Int(3000),
										Scheme: pulumi.String("HTTP"),
									},
								},
								ReadinessProbe: &v1.ProbeArgs{
									InitialDelaySeconds: pulumi.Int(5),
									HttpGet: &v1.HTTPGetActionArgs{
										Path: pulumi.String("/health/readiness"),
										Port: pulumi.Int(3000),
									},
								},
							},
						},
					},
				},
			},
		}, pulumi.Provider(k8sProvider), pulumi.DependsOn([]pulumi.Resource{serviceAccount}))

		ctx.Export("checkout", checkoutDeployment.Metadata.Name())

		qrCodeProcessorDeployment, err := appsv1.NewDeployment(ctx, "go-eda-workshop-qrcode-processor-deployment", &appsv1.DeploymentArgs{
			Metadata: &metav1.ObjectMetaArgs{
				Name: pulumi.String("qrcode-processor"),
			},
			Spec: &appsv1.DeploymentSpecArgs{
				Replicas: pulumi.Int(1),
				Selector: &metav1.LabelSelectorArgs{
					MatchLabels: pulumi.StringMap{
						"app": pulumi.String("qrcode-processor"),
					},
				},
				Template: &v1.PodTemplateSpecArgs{
					Metadata: &metav1.ObjectMetaArgs{
						Labels: pulumi.StringMap{
							"app": pulumi.String("qrcode-processor"),
						},
						Annotations: pulumi.StringMap{
							"dapr.io/enabled":  pulumi.String("true"),
							"dapr.io/app-id":   pulumi.String("qrcode-processor"),
							"dapr.io/app-port": pulumi.String("6005"),
						},
					},
					Spec: &v1.PodSpecArgs{
						ServiceAccount: serviceAccount.Metadata.Name(),
						Containers: v1.ContainerArray{
							&v1.ContainerArgs{
								Name:  pulumi.String("qrcode-processor"),
								Image: orderProcessor.RepoDigest,
								Ports: v1.ContainerPortArray{
									&v1.ContainerPortArgs{
										Name:          pulumi.String("http"),
										ContainerPort: pulumi.Int(6005),
									},
								},
								Env: v1.EnvVarArray{
									&v1.EnvVarArgs{
										Name:  pulumi.String("BINDING_NAME"),
										Value: s3bindingComponent.Metadata.Name(),
									},
									&v1.EnvVarArgs{
										Name:  pulumi.String("PUBSUB_COMPONENT_NAME"),
										Value: orderpubsubComponent.Metadata.Name(),
									},
									&v1.EnvVarArgs{
										Name:  pulumi.String("PUBSUB_TOPIC"),
										Value: edaInfraStackRef.GetStringOutput(pulumi.String("topic-name")),
									},
								},
								ImagePullPolicy: pulumi.String("Always"),
								LivenessProbe: &v1.ProbeArgs{
									InitialDelaySeconds: pulumi.Int(5),
									HttpGet: &v1.HTTPGetActionArgs{
										Path:   pulumi.String("/health/liveness"),
										Port:   pulumi.Int(6005),
										Scheme: pulumi.String("HTTP"),
									},
								},
								ReadinessProbe: &v1.ProbeArgs{
									InitialDelaySeconds: pulumi.Int(5),
									HttpGet: &v1.HTTPGetActionArgs{
										Path: pulumi.String("/health/readiness"),
										Port: pulumi.Int(6005),
									},
								},
							},
						},
					},
				},
			},
		}, pulumi.Provider(k8sProvider), pulumi.DependsOn([]pulumi.Resource{serviceAccount}))

		ctx.Export("qrcode-processor", qrCodeProcessorDeployment.Metadata.Name())

		scaledObject, err := apiextensions.NewCustomResource(ctx, "go-eda-workshop-keda-so", &apiextensions.CustomResourceArgs{
			ApiVersion: pulumi.String("keda.sh/v1alpha1"),
			Kind:       pulumi.String("ScaledObject"),
			Metadata: &metav1.ObjectMetaArgs{
				Name: pulumi.String("aws-sqs-scaledobject"),
			},
			OtherFields: kubernetes.UntypedArgs{
				"spec": kubernetes.UntypedArgs{
					"scaleTargetRef": pulumi.Map{
						"name": qrCodeProcessorDeployment.Metadata.Name(),
					},
					"minReplicaCount": pulumi.Int(1),
					"maxReplicaCount": pulumi.Int(5),
					"triggers": pulumi.Array{
						pulumi.Map{
							"type": pulumi.String("aws-sqs-queue"),
							"authenticationRef": pulumi.Map{
								"name": triggerAuth.Metadata.Name(),
							},
							"metadata": pulumi.Map{
								"queueURL":      edaInfraStackRef.GetStringOutput(pulumi.String("queue-url")),
								"awsRegion":     pulumi.String("eu-central-1"),
								"queueLength":   pulumi.String("15"),
								"identityOwner": pulumi.String("operator"),
							},
						},
					},
				},
			},
		}, pulumi.Provider(k8sProvider), pulumi.DependsOn([]pulumi.Resource{triggerAuth}))

		ctx.Export("scaled-object", scaledObject.Metadata.Name())

		return nil
	})
}
