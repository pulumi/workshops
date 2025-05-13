package main

import (
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
	"talos-go-component/pkg/talos"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		component, err := talos.NewTalosCluster(ctx, "talos-cluster", talos.TalosClusterArgs{
			ClusterName:       pulumi.String("talos-cluster"),
			Version:           pulumi.String("v1.9.5"),
			Region:            pulumi.String("lon1"),
			CountControlPlane: 3,
			CountWorker:       1,
			Size:              pulumi.String("s-2vcpu-4gb"),
		})
		if err != nil {
			return err
		}
		ctx.Export("kubeconfig", component.Kubeconfig)
		return nil
	})
}
