# Lab 3: Putting it all together

Let's set up the application next.

## Configure the application

Add the following configuration variables to your Pulumi program. These statements go in the static `stack()` method.

```java
var config = ctx.config();
var frontendPort = config.requireInteger("frontendPort");
var backendPort = config.requireInteger("backendPort");
var mongoPort = config.requireInteger("mongoPort");
```

Your Pulumi program should now match this code:

```java
package my_first_app;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.docker.RemoteImage;
import com.pulumi.docker.RemoteImageArgs;

import java.util.List;

public class App {
    public static void main(String[] args) {
        Pulumi.run(App::stack);
    }

    private static void stack(Context ctx) {
        var config = ctx.config();
        var frontendPort = config.requireInteger("frontendPort");
        var backendPort = config.requireInteger("backendPort");
        var mongoPort = config.requireInteger("mongoPort");

        final var stackName = ctx.stackName();

        // Create our images
        final String backendImageName = "backend";
        var backendImage = new RemoteImage(
                backendImageName,
                RemoteImageArgs.builder()
                        .name(String.format("pulumi/tutorial-pulumi-fundamentals-%s:latest",backendImageName))
                        .build()
        );

        final String frontendImageName = "frontend";
        var frontendImage = new RemoteImage(
                frontendImageName,
                RemoteImageArgs.builder()
                        .name(String.format("pulumi/tutorial-pulumi-fundamentals-%s:latest",frontendImageName))
                        .build()
        );

        var mongoImage = new RemoteImage(
                "mongoImage",
                RemoteImageArgs.builder()
                        .name("pulumi/tutorial-pulumi-fundamentals-database-local:latest")
                        .build()
        );
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

We need a new resource: a [`Network`](https://www.pulumi.com/registry/packages/docker/api-docs/network/).

Add these imports at the top:

```java
import com.pulumi.docker.Network;
import com.pulumi.docker.NetworkArgs;
import com.pulumi.docker.Container;
import com.pulumi.docker.ContainerArgs;
import com.pulumi.docker.inputs.ContainerNetworksAdvancedArgs;
import com.pulumi.docker.inputs.ContainerPortArgs;
import com.pulumi.resources.CustomResourceOptions;
```

Add the following code at the bottom of your program:

```java
// Set up a Docker Network
var network = new Network(
        "network",
        NetworkArgs.builder()
                .name(String.format("services-%s",stackName))
                .build()
);
```

Define a new [`Container`](https://www.pulumi.com/registry/packages/docker/api-docs/container/) resource in your Pulumi program below the `Network` resource:

```java
var backendContainer = new Container(
                "backendContainer",
                ContainerArgs.builder()
                        .name(String.format("backend-%s",stackName))
                        .image(backendImage.repoDigest())
                        .ports(ContainerPortArgs.builder()
                                .internal(backendPort)
                                .external(backendPort)
                                .build())
                        .envs(List.of(
                                String.format("DATABASE_HOST=%s",mongoHost),
                                String.format("DATABASE_NAME=%s",database),
                                String.format("NODE_ENV=%s",nodeEnvironment)
                        ))
                        .networksAdvanced(ContainerNetworksAdvancedArgs.builder()
                                .name(network.name())
                                .build()
                        )
                        .build(),
                CustomResourceOptions.builder()
                        .dependsOn(mongoContainer)
                        .build()
        );
```

<details>
<summary><b>Question:</b> How do we define an order of operations here so Pulumi knows to create dependent things after the independent things?</summary>

<br/>
<b>Answer:</b> We don't need to! Pulumi is a declarative IaC system, which means we just tell it what we want, and it figures out how to get everything done in order. Because we're referencing the <code>repo_digest</code> value from the <code>RemoteImage</code> resource in the creation of the <code>Container</code> resource, Pulumi knows that <code>RemoteImage</code> needs to be created first. In short, it can track the dependencies.
</details>
<br/>

We need some more environment variables:

```bash
pulumi config set mongo_host mongodb://mongo:27017
pulumi config set database cart
pulumi config set node_environment development
```

Add them to the top of our program with the rest of the configuration variables:

```java
var mongoHost = config.require("mongoHost");
var database = config.require("database");
var nodeEnvironment = config.require("nodeEnvironment");
var protocol = config.require("protocol");
```

Create `Container` resources for the frontend and mongo containers. Put the `mongo-container` declaration just above the `backend-container` one, and the `frontend-container` declaration at the end of the file. Here's the code for the mongo container:

```java
var mongoContainer = new Container(
        "mongoContainer",
        ContainerArgs.builder()
                .name(String.format("mongo-%s",stackName))
                .image(mongoImage.repoDigest())
                .ports(ContainerPortArgs.builder()
                        .internal(mongoPort)
                        .external(mongoPort)
                        .build())
                .networksAdvanced(ContainerNetworksAdvancedArgs.builder()
                        .name(network.name())
                        .aliases("mongo")
                        .build()
                )
                .build()
);
```

And the code for the frontend container:

```java
var frontendContainer = new Container(
        "frontendContainer",
        ContainerArgs.builder()
                .name(String.format("frontend-%s",stackName))
                .image(frontendImage.repoDigest())
                .ports(ContainerPortArgs.builder()
                        .internal(frontendPort)
                        .external(frontendPort)
                        .build())
                .envs(List.of(
                        String.format("LISTEN_PORT=%d",frontendPort),
                        String.format("HTTP_PROXY=backend-%s:%d",stackName,backendPort),
                        String.format("PROXY_PROTOCOL=%s",protocol)
                ))
                .networksAdvanced(ContainerNetworksAdvancedArgs.builder()
                        .name(network.name())
                        .build())
                .build()
);
```

Let's explore the whole program next.

## Put it all together

Now that we know how to create a container we can complete our program.

```java
package my_first_app;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.docker.RemoteImage;
import com.pulumi.docker.RemoteImageArgs;
import com.pulumi.docker.Network;
import com.pulumi.docker.NetworkArgs;
import com.pulumi.docker.Container;
import com.pulumi.docker.ContainerArgs;
import com.pulumi.docker.inputs.ContainerNetworksAdvancedArgs;
import com.pulumi.docker.inputs.ContainerPortArgs;
import com.pulumi.resources.CustomResourceOptions;

import java.util.List;

public class App {
    public static void main(String[] args) {
        Pulumi.run(App::stack);
    }

    private static void stack(Context ctx) {
        var config = ctx.config();
        var frontendPort = config.requireInteger("frontendPort");
        var backendPort = config.requireInteger("backendPort");
        var mongoPort = config.requireInteger("mongoPort");
        var mongoHost = config.require("mongoHost");
        var database = config.require("database");
        var nodeEnvironment = config.require("nodeEnvironment");
        var protocol = config.require("protocol");

        final var stackName = ctx.stackName();

        // Create our images
        final String backendImageName = "backend";
        var backendImage = new RemoteImage(
                backendImageName,
                RemoteImageArgs.builder()
                        .name(String.format("pulumi/tutorial-pulumi-fundamentals-%s:latest",backendImageName))
                        .build()
        );

        final String frontendImageName = "frontend";
        var frontendImage = new RemoteImage(
                frontendImageName,
                RemoteImageArgs.builder()
                        .name(String.format("pulumi/tutorial-pulumi-fundamentals-%s:latest",frontendImageName))
                        .build()
        );

        var mongoImage = new RemoteImage(
                "mongoImage",
                RemoteImageArgs.builder()
                        .name("pulumi/tutorial-pulumi-fundamentals-database-local:latest")
                        .build()
        );

        // Set up a Docker Network
        var network = new Network(
                "network",
                NetworkArgs.builder()
                        .name(String.format("services-%s",stackName))
                        .build()
        );

        // Container time!
        var mongoContainer = new Container(
                "mongoContainer",
                ContainerArgs.builder()
                        .name(String.format("mongo-%s",stackName))
                        .image(mongoImage.repoDigest())
                        .ports(ContainerPortArgs.builder()
                                .internal(mongoPort)
                                .external(mongoPort)
                                .build())
                        .networksAdvanced(ContainerNetworksAdvancedArgs.builder()
                                .name(network.name())
                                .aliases("mongo")
                                .build()
                        )
                        .build()
        );

        var backendContainer = new Container(
                "backendContainer",
                ContainerArgs.builder()
                        .name(String.format("backend-%s",stackName))
                        .image(backendImage.repoDigest())
                        .ports(ContainerPortArgs.builder()
                                .internal(backendPort)
                                .external(backendPort)
                                .build())
                        .envs(List.of(
                                String.format("DATABASE_HOST=%s",mongoHost),
                                String.format("DATABASE_NAME=%s",database),
                                String.format("NODE_ENV=%s",nodeEnvironment)
                        ))
                        .networksAdvanced(ContainerNetworksAdvancedArgs.builder()
                                .name(network.name())
                                .build()
                        )
                        .build(),
                CustomResourceOptions.builder()
                        .dependsOn(mongoContainer)
                        .build()
        );

        var frontendContainer = new Container(
                "frontendContainer",
                ContainerArgs.builder()
                        .name(String.format("frontend-%s",stackName))
                        .image(frontendImage.repoDigest())
                        .ports(ContainerPortArgs.builder()
                                .internal(frontendPort)
                                .external(frontendPort)
                                .build()
                        )
                        .envs(List.of(
                                String.format("LISTEN_PORT=%d",frontendPort),
                                String.format("HTTP_PROXY=backend-%s:%d",stackName,backendPort),
                                String.format("PROXY_PROTOCOL=%s",protocol)
                        ))
                        .networksAdvanced(ContainerNetworksAdvancedArgs.builder()
                                .name(network.name())
                                .build())
                        .build()
        );

        ctx.export("link", Output.of("http://localhost:3001"));
        return ctx.exports();
    }
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
