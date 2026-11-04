package main

import (
	"github.com/hashicorp/go-version"
	"github.com/pulumi/pulumi-random/sdk/v4/go/random"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi/config"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		environment := config.New(ctx, "").Require("environment")
		pet, err := random.NewRandomPet(ctx, "name", &random.RandomPetArgs{
			Prefix: pulumi.String(environment),
			Length: pulumi.Int(2),
		})
		if err != nil {
			return err
		}
		revision, err := version.NewVersion("1.1.0")
		if err != nil {
			return err
		}
		ctx.Export("environment", pulumi.String(environment))
		ctx.Export("name", pet.ID())
		ctx.Export("revision", pulumi.String(revision.String()))
		return nil
	})
}
