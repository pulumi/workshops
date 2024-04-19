package main

import (
	"os"

	"github.com/pulumi/pulumi-cloudflare/sdk/v5/go/cloudflare"
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
				Platform: pulumi.String("linux/amd64"),
				Context:  pulumi.String("../app"), // Path to the directory with Dockerfile and source.
			},
			ImageName: pulumi.Sprintf("docker.io/" + username + "/" + APPNAME + ":" + currentStackName),
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

		// Create a new Cloud Run Service using the image
		service, err := cloudrun.NewService(ctx, APPNAME, &cloudrun.ServiceArgs{
			Location: pulumi.String("us-central1"),
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
							},
						},
					},
				},
			},
		})
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

		// Export the URL
		ctx.Export("url", service.Statuses.Index(pulumi.Int(0)).Url())

		// Create Cloudflare CDN
		if currentStackName == "notyet" {

			// conf := config.New(ctx, "cloudflare")

			// Create a new Cloudflare CDN
			zoneID := "" // ctx.Config.Require("zone")
			domain := "" //ctx.Config.Require("domain")

			//  For example, if you are using Cloudflare CDN, you should
			// turn off the "Always use https" option in the "Edge Certificates" tab of the SSL/TLS tab.

			// Create a new domain mapping
			_, err = cloudrun.NewDomainMapping(ctx, "buzz", &cloudrun.DomainMappingArgs{
				Location: pulumi.String("us-central1"),
				Name:     pulumi.String(APPNAME + "." + domain),
				Metadata: &cloudrun.DomainMappingMetadataArgs{
					Namespace: pulumi.String("wide-pulsar-407202"),
				},
				Spec: &cloudrun.DomainMappingSpecArgs{
					RouteName: service.Name,
				},
			})
			if err != nil {
				return err
			}

			// Set the DNS record for the CDN.
			_, err := cloudflare.NewRecord(ctx, "cdnRecord", &cloudflare.RecordArgs{
				ZoneId:  pulumi.String(zoneID),  // Replace with your actual Zone ID
				Name:    pulumi.String(APPNAME), // The subdomain or record name
				Type:    pulumi.String("CNAME"), // Typically a CNAME for CDN usage
				Value:   pulumi.String(domain),  // The value of the record, like a CDN endpoint
				Proxied: pulumi.Bool(true),      // Set to true to proxy traffic through Cloudflare (provides CDN and DDoS protection)
			})
			if err != nil {
				return err
			}

			// Enable Argo Smart Routing on the zone.
			// _, err = cloudflare.NewArgo(ctx, "cdnArgo", &cloudflare.ArgoArgs{
			// 	ZoneId:       pulumi.String(zoneID),
			// 	SmartRouting: pulumi.String("on"),
			// })
			// if err != nil {
			// 	return err
			// }
		}
		return nil
	})
}
