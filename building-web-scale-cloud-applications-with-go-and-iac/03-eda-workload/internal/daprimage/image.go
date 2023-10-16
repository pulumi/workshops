package daprimage

import (
	"encoding/base64"
	"errors"
	"fmt"
	"github.com/pulumi/pulumi-aws/sdk/v6/go/aws/ecr"
	"github.com/pulumi/pulumi-docker/sdk/v4/go/docker"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
	"strings"
)

type Image struct {
	pulumi.ResourceState

	RepoDigest pulumi.StringOutput `pulumi:"repoDigest"`
}

type ImageArgs struct {
	Name    string
	Context string
}

func NewImage(ctx *pulumi.Context, name string, args *ImageArgs, opts ...pulumi.ResourceOption) (*Image, error) {
	var image Image
	err := ctx.RegisterComponentResource("pkg:dapr:Image", name, &image, opts...)
	if err != nil {
		return nil, err
	}

	repository, err := ecr.NewRepository(ctx, fmt.Sprintf("%s-repository", name), &ecr.RepositoryArgs{
		Name:        pulumi.String(args.Name),
		ForceDelete: pulumi.Bool(true),
	}, pulumi.Parent(&image))
	if err != nil {
		return nil, err
	}

	_, err = ecr.NewLifecyclePolicy(ctx, fmt.Sprintf("%s-lifecycle-policy", name), &ecr.LifecyclePolicyArgs{
		Repository: repository.Name,
		Policy: pulumi.String(`{
				"rules": [
					{
					   "rulePriority": 1,
					   "description": "keep last 10 images",
					   "selection": {
						   "tagStatus": "any",
						   "countType": "imageCountMoreThan",
						   "countNumber": 10
					   },
					   "action": {
						   "type": "expire"
					   }
					}
				]
			}`),
	}, pulumi.Parent(&image))
	if err != nil {
		return nil, err
	}

	registryInfo := repository.RegistryId.ApplyT(func(id string) (docker.Registry, error) {
		creds, err := ecr.GetCredentials(ctx, &ecr.GetCredentialsArgs{RegistryId: id})
		if err != nil {
			return docker.Registry{}, err
		}
		decoded, err := base64.StdEncoding.DecodeString(creds.AuthorizationToken)
		if err != nil {
			return docker.Registry{}, err
		}
		parts := strings.Split(string(decoded), ":")
		if len(parts) != 2 {
			return docker.Registry{}, errors.New("invalid credentials")
		}

		return docker.Registry{
			Server:   &creds.ProxyEndpoint,
			Username: &parts[0],
			Password: &parts[1],
		}, nil
	}).(docker.RegistryOutput)

	checkoutImage, err := docker.NewImage(ctx, fmt.Sprintf("%s-image", name), &docker.ImageArgs{
		Build: &docker.DockerBuildArgs{
			Platform:       pulumi.String("linux/amd64"),
			BuilderVersion: docker.BuilderVersionBuilderBuildKit,
			Context:        pulumi.String(args.Context),
		},
		ImageName: repository.RepositoryUrl,
		Registry:  registryInfo,
	}, pulumi.Parent(&image))
	if err != nil {
		return nil, err
	}
	image.RepoDigest = checkoutImage.RepoDigest
	if err := ctx.RegisterResourceOutputs(&image, pulumi.Map{
		"repoDigest": image.RepoDigest,
	}); err != nil {
		return nil, err
	}
	return &image, nil
}
