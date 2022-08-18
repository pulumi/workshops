package main

import (
	"encoding/json"

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

		return nil
	})
}
