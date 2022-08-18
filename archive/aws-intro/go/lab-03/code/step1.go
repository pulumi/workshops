package main

import (
	"github.com/pulumi/pulumi-aws/sdk/go/aws/ecs"
	"github.com/pulumi/pulumi/sdk/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		// Create an ECS cluster to run a container-based service.
		cluster, err := ecs.NewCluster(ctx, "app-cluster", nil)
		if err != nil {
			return err
		}

		return nil
	})
}
