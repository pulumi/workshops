package main

import (
	"github.com/pulumi/pulumi-civo/sdk/go/civo"
	k8s "github.com/pulumi/pulumi-kubernetes/sdk/v3/go/kubernetes"
	appsv1 "github.com/pulumi/pulumi-kubernetes/sdk/v3/go/kubernetes/apps/v1"
	corev1 "github.com/pulumi/pulumi-kubernetes/sdk/v3/go/kubernetes/core/v1"
	metav1 "github.com/pulumi/pulumi-kubernetes/sdk/v3/go/kubernetes/meta/v1"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		network, err := civo.NewNetwork(ctx, "network-two", &civo.NetworkArgs{
			Label: pulumi.String("pulumi-workshop"),
		})

		if err != nil {
			return err
		}

		cluster, err := civo.NewKubernetesCluster(ctx, "cluster", &civo.KubernetesClusterArgs{
			Name:           pulumi.String("cluster"),
			NetworkId:      network.ID(),
			NumTargetNodes: pulumi.Int(2),
			Applications:   pulumi.String("metrics-server,-Traefik-v2-nodeport"),
		})

		if err != nil {
			return err
		}

		kubernetesProvider, err := k8s.NewProvider(ctx, "kubernetesProvider", &k8s.ProviderArgs{
			Kubeconfig: cluster.Kubeconfig,
		})

		if err != nil {
			return err
		}

		_, err = appsv1.NewDeployment(ctx, "nginx", &appsv1.DeploymentArgs{
			Metadata: &metav1.ObjectMetaArgs{
				Labels: pulumi.StringMap{
					"app": pulumi.String("nginx"),
				},
			},
			Spec: &appsv1.DeploymentSpecArgs{
				Replicas: pulumi.Int(3),
				Selector: &metav1.LabelSelectorArgs{
					MatchLabels: pulumi.StringMap{
						"app": pulumi.String("nginx"),
					},
				},
				Template: &corev1.PodTemplateSpecArgs{
					Metadata: &metav1.ObjectMetaArgs{
						Labels: pulumi.StringMap{
							"app": pulumi.String("nginx"),
						},
					},
					Spec: &corev1.PodSpecArgs{
						Containers: corev1.ContainerArray{
							&corev1.ContainerArgs{
								Name:  pulumi.String("nginx"),
								Image: pulumi.String("nginx:1.14.2"),
								Ports: corev1.ContainerPortArray{
									&corev1.ContainerPortArgs{
										ContainerPort: pulumi.Int(80),
									},
								},
							},
						},
					},
				},
			},
		}, pulumi.Provider(kubernetesProvider))

		if err != nil {
			return err
		}

		service, err := corev1.NewService(ctx, "nginx", &corev1.ServiceArgs{
			Spec: &corev1.ServiceSpecArgs{
				Type: pulumi.String("NodePort"),
				Selector: pulumi.StringMap{
					"app": pulumi.String("nginx"),
				},
				Ports: corev1.ServicePortArray{
					&corev1.ServicePortArgs{
						Protocol: pulumi.String("TCP"),
						Port:     pulumi.Int(80),
					},
				},
			},
		}, pulumi.Provider(kubernetesProvider))

		if err != nil {
			return err
		}

		nginxUrl := pulumi.All(cluster.MasterIp, service.Spec.Ports()).ApplyT(func(args []interface{}) pulumi.StringOutput {
			clusterIp := args[0].(string)
			ports := args[1].([]corev1.ServicePort)

			return pulumi.Sprintf("http://%s:%d", clusterIp, *ports[0].NodePort)
		})

		ctx.Export("nginxUrl", nginxUrl)
		ctx.Export("kubeconfig", cluster.Kubeconfig)

		return nil
	})
}
