# Lab 3: Putting it all together

Let's set up the application next.

## Configure the application

Add the following configuration variables to your Pulumi program. These statements go in the `main` function inside of `pulumi.Run`.

```go
		cfg := config.New(ctx, "")
		_ := cfg.RequireFloat("frontendPort")
		_ := cfg.RequireFloat("backendPort")
		_ := cfg.RequireFloat("mongoPort")
```

Your Pulumi program should now match this code:

```go
package main

import (
	"fmt"

	"github.com/pulumi/pulumi-docker/sdk/v3/go/docker"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi/config"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		cfg := config.New(ctx, "")
		_ := cfg.RequireFloat("frontendPort")
		_ := cfg.RequireFloat("backendPort")
		_ := cfg.RequireFloat("mongoPort")
		backendImageName := "backend"
		frontendImageName := "frontend"
		_, err := docker.NewRemoteImage(ctx, fmt.Sprintf("%v-image", ctx.backendImageName), &docker.RemoteImageArgs{
			Name: pulumi.String("pulumi/tutorial-pulumi-fundamentals-backend:latest"),
		})
		if err != nil {
			return err
		}
		_, err := docker.NewRemoteImage(ctx, fmt.Sprintf("%v-image", ctx.frontendImageName), &docker.RemoteImageArgs{
			Name: pulumi.String("pulumi/tutorial-pulumi-fundamentals-frontend:latest"),
		})
		if err != nil {
			return err
		}
		_, err := docker.NewRemoteImage(ctx, "mongo-image", &docker.RemoteImageArgs{
			Name: pulumi.String("pulumi/tutorial-pulumi-fundamentals-database-local:latest"),
		})
		if err != nil {
			return err
		}
		return nil
	})
}
```

Try and run your `pulumi up` again at this point.

<details>
<summary><b>Question:</b> What happened?</summary>

<br/>
<b>Answer:</b> We specified that the config options are <i>required</i>. Remember how we can use the same program to define multiple stacks? We need to set the various values for this specific stack before running an up.
</details>

<br/>
Use the `pulumi config set` command to set ports:

```bash
pulumi config set frontend_port 3001
pulumi config set backend_port 3000
pulumi config set mongo_port 27017
```

**Action:** Explore the new `Pulumi.dev.yaml` file.

Now, try and rerun your Pulumi program.

Let's add container resources.

## Create a Container resource

We need a new resource: a [`Network`](https://www.pulumi.com/registry/packages/docker/api-docs/network/). Add the following code at the bottom of your program:

```go
		network, err := docker.NewNetwork(ctx, "network", &docker.NetworkArgs{
			Name: pulumi.String(fmt.Sprintf("services-%v", ctx.Stack())),
		})
		if err != nil {
			return err
		}
```

Define a new [`Container`](https://www.pulumi.com/registry/packages/docker/api-docs/container/) resource in your Pulumi program below the `Network` resource. Ensure you update all of the relevant `_` variables elsewhere!

```go
		_, err = docker.NewContainer(ctx, "backend-container", &docker.ContainerArgs{
			Name:  pulumi.String(fmt.Sprintf("backend-%v", ctx.Stack())),
			Image: backendImage.RepoDigest,
			Ports: ContainerPortArray{
				&ContainerPortArgs{
					Internal: pulumi.Float64(backendPort),
					External: pulumi.Float64(backendPort),
				},
			},
			Envs: pulumi.StringArray{
				pulumi.String(fmt.Sprintf("DATABASE_HOST=%v", mongoHost)),
				pulumi.String(fmt.Sprintf("DATABASE_NAME=%v", database)),
				pulumi.String(fmt.Sprintf("NODE_ENV=%v", nodeEnvironment)),
			},
			NetworksAdvanced: ContainerNetworksAdvancedArray{
				&ContainerNetworksAdvancedArgs{
					Name: network.Name,
					Aliases: pulumi.StringArray{
						pulumi.String(fmt.Sprintf("backend-%v", ctx.Stack())),
					},
				},
			},
		}, pulumi.DependsOn([]pulumi.Resource{
			mongoContainer,
		}))
		if err != nil {
			return err
		}
```

<details>
<summary><b>Question:</b> How do we define an order of operations here so Pulumi knows to create dependent things after the independent things?</summary>

<br/>
<b>Answer:</b> We don't need to! Pulumi is a declarative IaC system, which means we just tell it what we want, and it figures out how to get everything done in order. Because we're referencing the <code>repo_digest</code> value from the <code>RemoteImage</code> resource in the creation of the <code>Container</code> resource, Pulumi knows that <code>RemoteImage</code> needs to be created first. In short, it can track the dependencies.
</details>
<br/>

We need some more environment variables:

```bash
pulumi config set mongoHost mongodb://mongo:27017
pulumi config set database cart
pulumi config set nodeEnvironment development
pulumi config set protocol http://
```

Add them to the top of our program with the rest of the configuration variables:

```go
		mongoHost := cfg.Require("mongoHost")
		database := cfg.Require("database")
		nodeEnvironment := cfg.Require("nodeEnvironment")
		protocol := cfg.Require("protocol")
```

Create `Container` resources for the frontend and mongo containers. Put the `mongo-container` declaration just above the `backend-container` one, and the `frontend-container` declaration at the end of the file. Here's the code for the mongo container:

```go
		mongoContainer, err := docker.NewContainer(ctx, "mongo-container", &docker.ContainerArgs{
			Name:  pulumi.String(fmt.Sprintf("mongo-%v", ctx.Stack())),
			Image: mongoImage.RepoDigest,
			Ports: ContainerPortArray{
				&ContainerPortArgs{
					Internal: pulumi.Float64(mongoPort),
					External: pulumi.Float64(mongoPort),
				},
			},
			NetworksAdvanced: ContainerNetworksAdvancedArray{
				&ContainerNetworksAdvancedArgs{
					Name: network.Name,
					Aliases: pulumi.StringArray{
						pulumi.String("mongo"),
					},
				},
			},
		})
		if err != nil {
			return err
		}
```

And the code for the frontend container:

```go
		_, err = docker.NewContainer(ctx, "frontend-container", &docker.ContainerArgs{
			Name:  pulumi.String(fmt.Sprintf("frontend-%v", ctx.Stack())),
			Image: frontendImage.RepoDigest,
			Ports: ContainerPortArray{
				&ContainerPortArgs{
					Internal: pulumi.Float64(frontendPort),
					External: pulumi.Float64(frontendPort),
				},
			},
			Envs: pulumi.StringArray{
				pulumi.String(fmt.Sprintf("LISTEN_PORT=%v", frontendPort)),
				pulumi.String(fmt.Sprintf("HTTP_PROXY=backend-%v:%v", ctx.Stack(), backendPort)),
				pulumi.String("PROXY_PROTOCOL=http://"),
			},
			NetworksAdvanced: ContainerNetworksAdvancedArray{
				&ContainerNetworksAdvancedArgs{
					Name: network.Name,
					Aliases: pulumi.StringArray{
						pulumi.String(fmt.Sprintf("frontend-%v", ctx.Stack())),
					},
				},
			},
		})
		if err != nil {
			return err
		}
```

Let's explore the whole program next. Check that you've updated all of the relevant `_` variables.

## Put it all together

Now that we know how to create a container we can complete our program.

```go
package main

import (
	"fmt"

	"github.com/pulumi/pulumi-docker/sdk/v3/go/docker"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi/config"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		cfg := config.New(ctx, "")
		frontendPort := cfg.RequireFloat("frontendPort")
		backendPort := cfg.RequireFloat("backendPort")
		mongoPort := cfg.RequireFloat("mongoPort")
		mongoHost := cfg.Require("mongoHost")
		database := cfg.Require("database")
		nodeEnvironment := cfg.Require("nodeEnvironment")
		protocol := cfg.Require("protocol")
		backendImageName := "backend"
		frontendImageName := "frontend"
		backendImage, err := docker.NewRemoteImage(ctx, fmt.Sprintf("%v-image", ctx.backendImageName), &docker.RemoteImageArgs{
			Name: pulumi.String("pulumi/tutorial-pulumi-fundamentals-backend:latest"),
		})
		if err != nil {
			return err
		}
		frontendImage, err := docker.NewRemoteImage(ctx, fmt.Sprintf("%v-image", ctx.frontendImageName), &docker.RemoteImageArgs{
			Name: pulumi.String("pulumi/tutorial-pulumi-fundamentals-frontend:latest"),
		})
		if err != nil {
			return err
		}
		mongoImage, err := docker.NewRemoteImage(ctx, "mongo-image", &docker.RemoteImageArgs{
			Name: pulumi.String("pulumi/tutorial-pulumi-fundamentals-database-local:latest"),
		})
		if err != nil {
			return err
		}
		network, err := docker.NewNetwork(ctx, "network", &docker.NetworkArgs{
			Name: pulumi.String(fmt.Sprintf("services-%v", ctx.Stack())),
		})
		if err != nil {
			return err
		}
		mongoContainer, err := docker.NewContainer(ctx, "mongo-container", &docker.ContainerArgs{
			Name:  pulumi.String(fmt.Sprintf("mongo-%v", ctx.Stack())),
			Image: mongoImage.RepoDigest,
			Ports: ContainerPortArray{
				&ContainerPortArgs{
					Internal: pulumi.Float64(mongoPort),
					External: pulumi.Float64(mongoPort),
				},
			},
			NetworksAdvanced: ContainerNetworksAdvancedArray{
				&ContainerNetworksAdvancedArgs{
					Name: network.Name,
					Aliases: pulumi.StringArray{
						pulumi.String("mongo"),
					},
				},
			},
		})
		if err != nil {
			return err
		}
		_, err = docker.NewContainer(ctx, "backend-container", &docker.ContainerArgs{
			Name:  pulumi.String(fmt.Sprintf("backend-%v", ctx.Stack())),
			Image: backendImage.RepoDigest,
			Ports: ContainerPortArray{
				&ContainerPortArgs{
					Internal: pulumi.Float64(backendPort),
					External: pulumi.Float64(backendPort),
				},
			},
			Envs: pulumi.StringArray{
				pulumi.String(fmt.Sprintf("DATABASE_HOST=%v", mongoHost)),
				pulumi.String(fmt.Sprintf("DATABASE_NAME=%v", database)),
				pulumi.String(fmt.Sprintf("NODE_ENV=%v", nodeEnvironment)),
			},
			NetworksAdvanced: ContainerNetworksAdvancedArray{
				&ContainerNetworksAdvancedArgs{
					Name: network.Name,
					Aliases: pulumi.StringArray{
						pulumi.String(fmt.Sprintf("backend-%v", ctx.Stack())),
					},
				},
			},
		}, pulumi.DependsOn([]pulumi.Resource{
			mongoContainer,
		}))
		if err != nil {
			return err
		}
		_, err = docker.NewContainer(ctx, "frontend-container", &docker.ContainerArgs{
			Name:  pulumi.String(fmt.Sprintf("frontend-%v", ctx.Stack())),
			Image: frontendImage.RepoDigest,
			Ports: ContainerPortArray{
				&ContainerPortArgs{
					Internal: pulumi.Float64(frontendPort),
					External: pulumi.Float64(frontendPort),
				},
			},
			Envs: pulumi.StringArray{
				pulumi.String(fmt.Sprintf("LISTEN_PORT=%v", frontendPort)),
				pulumi.String(fmt.Sprintf("HTTP_PROXY=backend-%v:%v", ctx.Stack(), backendPort)),
				pulumi.String("PROXY_PROTOCOL=http://"),
			},
			NetworksAdvanced: ContainerNetworksAdvancedArray{
				&ContainerNetworksAdvancedArgs{
					Name: network.Name,
					Aliases: pulumi.StringArray{
						pulumi.String(fmt.Sprintf("frontend-%v", ctx.Stack())),
					},
				},
			},
		})
		if err != nil {
			return err
		}
		return nil
	})
}
```

<details>
<summary><b>Question:</b> Why are we using image names to refer to the container?</summary>

<br/>
<b>Answer:</b> With Docker networking, we can use image names to refer to a container. In our example, the React frontend client sends requests to the Express backend client. The URL to the backend is set via the <code>setupProxy.js</code> file in the <code>app/frontend/src</code> directory with the <code>HTTP_PROXY</code> environment variable.
</details>
<br/>

Run `pulumi up`, and open a browser to `http://localhost:3001` to explore our application.

## Update the database

Let's try updating the database.

Open a terminal on your local machine, and run the following command:

```bash
curl --location --request POST 'http://localhost:3000/api/products' \
--header 'Content-Type: application/json' \
--data-raw '{
    "ratings": {
        "reviews": [],
        "total": 63,
        "avg": 5
    },
    "created": 1600979464567,
    "currency": {
        "id": "USD",
        "format": "$"
    },
    "sizes": [
        "M",
        "L"
    ],
    "category": "boba",
    "teaType": 2,
    "status": 1,
    "_id": "5f6d025008a1b6f0e5636bc7",
    "images": [
        {
            "src": "classic_boba.png"
        }
    ],
    "name": "My New Milk Tea",
    "price": 5,
    "description": "none",
    "productCode": "852542-107"
}'
```

You should get back the following response:

```json
{"status":"ok","data":{"product":{"ratings":{"reviews":[],"total":63,"avg":5},"created":1600979464567,"currency":{"id":"USD","format":"$"},"sizes":["M","L"],"category":"boba","teaType":2,"status":1,"_id":"5f6d025008a1b6f0e5636bc7","images":[{"_id":"62608f2a9ad5d90026847b0f","src":"classic_boba.png"}],"name":"My New Milk Tea","price":5,"description":"none","productCode":"852542-107","__v":0}}}
```

Open a browser to `http://localhost:3001`, and our data is now updated.

## Cleaning up

Always clean up with Pulumi when working with a sandbox environment:

```bash
$ pulumi destroy
```

Ensure you select `yes` when prompted to tear down your environment.
