package main

import (
	"github.com/pulumi/pulumi-civo/sdk/go/civo"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		_, err := civo.NewNetwork(ctx, "one-functions", &civo.NetworkArgs{
			Label: pulumi.String("pulumi-workshop"),
		})

		if err != nil {
			return err
		}

		return nil
	})
}
