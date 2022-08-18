package main

import (
	"github.com/pulumi/pulumi/sdk/go/pulumi"
	"github.com/pulumi/pulumi-aws/sdk/go/aws/s3"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {

		_, err := s3.NewBucket(ctx, "my-bucket", nil)
		if err != nil {
			return err
		}

		return nil
	})
}
