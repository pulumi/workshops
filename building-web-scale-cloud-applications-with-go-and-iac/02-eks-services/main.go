package main

import (
	"github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes"
	"github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/helm/v3"
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

		k8sProvider, err := kubernetes.NewProvider(ctx, "go-eda-workshop-k8s-provider", &kubernetes.ProviderArgs{
			Kubeconfig:            infraStackRef.GetStringOutput(pulumi.String("kubeconfig")),
			EnableServerSideApply: pulumi.Bool(true),
		})

		if err != nil {
			return err
		}

		dapr, err := helm.NewRelease(ctx, "go-eda-workshop-dapr", &helm.ReleaseArgs{
			Chart:           pulumi.String("dapr"),
			Namespace:       pulumi.String("dapr-system"),
			CreateNamespace: pulumi.Bool(true),
			Version:         pulumi.String(cfg.Get("daprVersion")),
			RepositoryOpts: &helm.RepositoryOptsArgs{
				Repo: pulumi.String("https://dapr.github.io/helm-charts/"),
			},
		}, pulumi.Provider(k8sProvider), pulumi.IgnoreChanges([]string{"checksum"}))
		if err != nil {
			return err
		}

		_, err = helm.NewRelease(ctx, "go-eda-workshop-dapr-dashboard", &helm.ReleaseArgs{
			Chart:          pulumi.String("dapr-dashboard"),
			Namespace:      dapr.Namespace,
			Version:        pulumi.String(cfg.Get("daprDashboardVersion")),
			RepositoryOpts: dapr.RepositoryOpts,
		}, pulumi.Provider(k8sProvider), pulumi.DependsOn([]pulumi.Resource{dapr}))
		if err != nil {
			return err
		}

		_, err = helm.NewRelease(ctx, "go-eda-workshop-keda", &helm.ReleaseArgs{
			Chart:           pulumi.String("keda"),
			Namespace:       pulumi.String("keda"),
			CreateNamespace: pulumi.Bool(true),
			Version:         pulumi.String(cfg.Get("kedaVersion")),
			Timeout:         pulumi.Int(600),
			SkipAwait:       pulumi.Bool(true),
			RepositoryOpts: &helm.RepositoryOptsArgs{
				Repo: pulumi.String("https://kedacore.github.io/charts"),
			},
			Values: pulumi.Map{
				"serviceAccount": pulumi.Map{
					"annotations": pulumi.Map{
						"eks.amazonaws.com/role-arn": edaInfraStackRef.GetStringOutput(pulumi.String("dapr-role-arn")),
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
