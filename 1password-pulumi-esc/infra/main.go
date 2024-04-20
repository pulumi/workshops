package main

import (
	"os"

	"github.com/pulumi/pulumi-docker/sdk/v4/go/docker"
	"github.com/pulumi/pulumi-gcp/sdk/v7/go/gcp/cloudrun"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

const APPNAME = "buzz"

func main() {
	// Create a new Pulumi project
	pulumi.Run(func(ctx *pulumi.Context) error {

		// Create a Docker image from a Dockerfile and push it to Docker Hub.
		username := os.Getenv("DOCKER_USR")
		currentStackName := ctx.Stack()

		image, err := docker.NewImage(ctx, APPNAME, &docker.ImageArgs{
			Build: &docker.DockerBuildArgs{
				Platform:   pulumi.String("linux/amd64"),
				Context:    pulumi.String("../app"), // Path to the directory with Dockerfile and source.
				Dockerfile: pulumi.String(`../app/Dockerfile`),
			},
			ImageName: pulumi.Sprintf("docker.io/%s/%s:%s", username, APPNAME, currentStackName),
			SkipPush:  pulumi.Bool(false),
			Registry: &docker.RegistryArgs{
				Server:   pulumi.String("docker.io"), // Docker Hub server.
				Username: pulumi.String(username),
				Password: pulumi.String(os.Getenv("DOCKER_PAT")),
			},
		})
		if err != nil {
			return err
		}

		// New-ish Cloud Run feature in action :)
		GOOGLE_PROJECT := os.Getenv("GOOGLE_PROJECT")
		GOOGLE_REGION := os.Getenv("GOOGLE_REGION")
		deterministicURL := "https://" + APPNAME + "-" + GOOGLE_PROJECT + "." + GOOGLE_REGION + ".run.app"
		ctx.Export("URL", pulumi.String(deterministicURL))

		// Create a new Cloud Run Service using the image
		service, err := cloudrun.NewService(ctx, APPNAME, &cloudrun.ServiceArgs{
			// https://www.pulumi.com/docs/concepts/resources/names/
			Name:     pulumi.String(APPNAME), // overrides autonaming
			Location: pulumi.String(GOOGLE_REGION),
			Template: &cloudrun.ServiceTemplateArgs{
				Spec: &cloudrun.ServiceTemplateSpecArgs{
					Containers: cloudrun.ServiceTemplateSpecContainerArray{
						&cloudrun.ServiceTemplateSpecContainerArgs{
							Image: image.ImageName,
							Ports: cloudrun.ServiceTemplateSpecContainerPortArray{
								&cloudrun.ServiceTemplateSpecContainerPortArgs{
									ContainerPort: pulumi.Int(8000),
								},
							},
							Envs: cloudrun.ServiceTemplateSpecContainerEnvArray{
								&cloudrun.ServiceTemplateSpecContainerEnvArgs{
									Name:  pulumi.String("GOOGLE_OAUTH_CLIENT_ID"),
									Value: pulumi.String(os.Getenv("GOOGLE_OAUTH_CLIENT_ID")),
								},
								&cloudrun.ServiceTemplateSpecContainerEnvArgs{
									Name:  pulumi.String("GOOGLE_OAUTH_CLIENT_SECRET"),
									Value: pulumi.String(os.Getenv("GOOGLE_OAUTH_CLIENT_SECRET")),
								},
								&cloudrun.ServiceTemplateSpecContainerEnvArgs{
									Name:  pulumi.String("GEMINI_API_KEY"),
									Value: pulumi.String(os.Getenv("GEMINI_API_KEY")),
								},
								&cloudrun.ServiceTemplateSpecContainerEnvArgs{
									Name:  pulumi.String("REDIR"),
									Value: pulumi.String(deterministicURL),
								},
							},
						},
					},
				},
			},
		}, pulumi.DependsOn([]pulumi.Resource{image}), pulumi.DeleteBeforeReplace(true))
		if err != nil {
			return err
		}

		// Create an IAM member to make the service publicly accessible.
		_, err = cloudrun.NewIamMember(ctx, "invoker", &cloudrun.IamMemberArgs{
			Service:  service.Name,
			Location: service.Location,
			Role:     pulumi.String("roles/run.invoker"),
			Member:   pulumi.String("allUsers"),
		})
		if err != nil {
			return err
		}

		// Create Cloudflare CDN
		// if currentStackName == "prod-feature-1test" {

		// 	// conf := config.New(ctx, "cloudflare")

		// 	// Create a new Cloudflare CDN
		// 	zoneID := "" // ctx.Config.Require("zone")
		// 	domain := "" //ctx.Config.Require("domain")

		// 	//  For example, if you are using Cloudflare CDN, you should
		// 	// turn off the "Always use https" option in the "Edge Certificates" tab of the SSL/TLS tab.

		// 	// Create a new domain mapping
		// 	_, err = cloudrun.NewDomainMapping(ctx, APPNAME, &cloudrun.DomainMappingArgs{
		// 		Location: pulumi.String(GOOGLE_REGION),
		// 		Name:     pulumi.String(APPNAME + "." + domain),
		// 		Metadata: &cloudrun.DomainMappingMetadataArgs{

		// 			Namespace: pulumi.String("pulumi-workspaces-project"),
		// 		},
		// 		Spec: &cloudrun.DomainMappingSpecArgs{
		// 			RouteName: service.Name,
		// 		},
		// 	})
		// 	if err != nil {
		// 		return err
		// 	}

		// 	// Set the DNS record for the CDN.
		// 	_, err := cloudflare.NewRecord(ctx, APPNAME, &cloudflare.RecordArgs{
		// 		ZoneId:  pulumi.String(zoneID),  // Replace with your actual Zone ID
		// 		Name:    pulumi.String(APPNAME), // The subdomain or record name
		// 		Type:    pulumi.String("CNAME"), // Typically a CNAME for CDN usage
		// 		Value:   pulumi.String("ghs.googlehosted.com"),  // The value of the record, like a CDN endpoint
		// 		Proxied: pulumi.Bool(false),      // Set to true to proxy traffic through Cloudflare (provides CDN and DDoS protection)
		// 	})
		// 	if err != nil {
		// 		return err
		// 	}
		// }
		return nil
	})
}
