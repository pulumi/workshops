package main

import (
	"encoding/json"

	appsv1 "github.com/pulumi/pulumi-kubernetes/sdk/go/kubernetes/apps/v1"
	corev1 "github.com/pulumi/pulumi-kubernetes/sdk/go/kubernetes/core/v1"
	metav1 "github.com/pulumi/pulumi-kubernetes/sdk/go/kubernetes/meta/v1"
	"github.com/pulumi/pulumi-kubernetes/sdk/go/kubernetes/providers"
	"github.com/pulumi/pulumi/sdk/go/pulumi"
	"github.com/pulumi/pulumi/sdk/go/pulumi/config"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		c := config.New(ctx, "")
		stackRef := c.Require("clusterStackRef")
		infra, err := pulumi.NewStackReference(ctx, stackRef, nil)

		kubeconfig := infra.GetOutput(pulumi.String("kubeconfig")).ApplyString(
			func(in interface{}) string {
				kc, err := json.Marshal(in)
				if err != nil {
					panic(err)
				}
				return string(kc)
			},
		)
		k8sProvider, err := providers.NewProvider(ctx, "k8sprovider", &providers.ProviderArgs{
			Kubeconfig: kubeconfig,
		})
		if err != nil {
			return err
		}

		namespace, err := corev1.NewNamespace(ctx, "app-ns", &corev1.NamespaceArgs{
			Metadata: &metav1.ObjectMetaArgs{
				Name: pulumi.String("joe-duffy"),
			},
		}, pulumi.Provider(k8sProvider))
		if err != nil {
			return err
		}

		appLabels := pulumi.StringMap{
			"app": pulumi.String("iac-workshop"),
		}
		_, err = appsv1.NewDeployment(ctx, "app-dep", &appsv1.DeploymentArgs{
			Metadata: &metav1.ObjectMetaArgs{
				Namespace: namespace.Metadata.Elem().Name(),
			},
			Spec: appsv1.DeploymentSpecArgs{
				Selector: &metav1.LabelSelectorArgs{
					MatchLabels: appLabels,
				},
				Replicas: pulumi.Int(1),
				Template: &corev1.PodTemplateSpecArgs{
					Metadata: &metav1.ObjectMetaArgs{
						Labels: appLabels,
					},
					Spec: &corev1.PodSpecArgs{
						Containers: corev1.ContainerArray{
							corev1.ContainerArgs{
								Name:  pulumi.String("iac-workshop"),
								Image: pulumi.String("jocatalin/kubernetes-bootcamp:v2"),
							}},
					},
				},
			},
		}, pulumi.Provider(k8sProvider))
		if err != nil {
			return err
		}

		return nil
	})
}
