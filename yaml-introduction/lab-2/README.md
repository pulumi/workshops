Now that we've created our images, we can provision our application with a network and containers. First, we're going to add configuration to our Pulumi
program. Pulumi is a tool to
[configure](https://www.pulumi.com/docs/intro/concepts/config/) your infrastructure,
and that includes being able to configure the different stacks with different
values. As a result, it makes sense to include the basic configurations as
variables at the top of your program.

## Configure the application

Add the following configuration variables to your Pulumi program. These statements go between the description and the resources.

```yaml
configuration:
  frontendPort:
    type: Integer
  backendPort:
    type: Integer
  mongoPort:
    type: Integer
variables:
  backendImageName: backend
  frontendImageName: frontend
```

Your Pulumi program should now match this code:

```yaml
name: fundamentals
runtime: yaml
description: a yaml test
configuration:
  frontendPort:
    type: Integer
  backendPort:
    type: Integer
  mongoPort:
    type: Integer
variables:
  backendImageName: backend
  frontendImageName: frontend
resources:
  backend-image:
    type: docker:index:RemoteImage
    properties:
      name: pulumi/tutorial-pulumi-fundamentals-backend:latest
  frontend-image:
    type: docker:index:RemoteImage
    properties:
      name: pulumi/tutorial-pulumi-fundamentals-frontend:latest
  mongo-image:
    type: docker:index:RemoteImage
    properties:
      name: pulumi/tutorial-pulumi-fundamentals-database-local:latest
```

Try and run your `pulumi up` again at this point. You should get an error like
this:

```bash
Diagnostics:
  pulumi:pulumi:Stack (my_first_app-dev):
    error: Missing required configuration variable 'my_first_app:frontendPort'
        please set a value using the command `pulumi config set my_first_app:frontendPort <value>`
    error: an unhandled error occurred: <...> exited with non-zero exit code: 1
```

This is because we have specified that this config option is _required_.
Remember how we can use the same program to define multiple stacks? Let's set
the ports for this stack, which the Pulumi command line knows already from when
you first initialized the project (it's the `dev` stack by default):

```bash
pulumi config set frontend_port 3001
pulumi config set backend_port 3000
pulumi config set mongo_port 27017
```

This set of commands creates a file in your directory called `Pulumi.dev.yaml`
to store the configuration for this stack.

Now, try and rerun your Pulumi program.

Your Pulumi program should now run, but you're not actually using these newly
configured ports just yet! That's because we don't have any container resources
that use the ports; we only have image resources.

## Create a Container resource

In the last topic, we built Docker images. Now we want to create Docker
containers and pass our configuration to them. Our containers will need to
connect to each other, so we will need to create a
[`Network`](https://www.pulumi.com/registry/packages/docker/api-docs/network/), which
is another resource. Add the following code at the bottom of your program:

```yaml
network:
    type: docker:index:Network
    properties:
      name: services-${pulumi.stack}
```

Define a new
[`Container`](https://www.pulumi.com/registry/packages/docker/api-docs/container/)
resource in your Pulumi program below the `Network` resource, like this:

```yaml
backend-container:
    type: docker:index:Container
    properties:
      name: backend-${pulumi.stack}
      image: ${backend-image.repoDigest}
      ports:
        - internal: ${backendPort}
          external: ${backendPort}
      envs:
        [
          "DATABASE_HOST=${mongoHost}",
          "DATABASE_NAME=${database}",
          "NODE_ENV=${nodeEnvironment}"
        ]
      networksAdvanced:
        - name: ${network.name}
          aliases: ["backend-${pulumi.stack}"]
    options:
      dependsOn:
        - ${mongo-container}
```

It is important to note something here. In the `Container` resource, we are
referencing `repoDigets` from the `RemoteImage` resource. Pulumi now knows there is
a dependency between these two resources and will know to create the
`Container` resource _after_ the `RemoteImage` resource. Another dependency to note is
that the `backend-container` depends on the `mongo-container`. If we tried to
run `pulumi up` without the `mongo-container` running or present somewhere in
state, Pulumi would let us know that the resource didn't exist and would stop.

The backend container also requires environment variables to connect to the
mongo container and set the node environment for Express.js. These are set in
`./app/backend/src/.env`. Like before we can set them using `pulumi config` on
the command line:

```bash
pulumi config set mongo_host mongodb://mongo:27017
pulumi config set database cart
pulumi config set node_environment development
```

Then, we need to add them to the top of our program with the rest of the
configuration variables.

```yaml
mongoHost:
    type: String
  database:
    type: String
  nodeEnvironment:
    type: String
  protocol:
    type: String
```

We also need to create `Container` resources for the frontend and mongo
containers. Put the `mongo-container` declaration just above the `backend-container` one, and the
`frontend-container` declaration at the end of the file. Here's the code for the mongo container:

```yaml
mongo-container:
    type: docker:index:Container
    properties:
      name: mongo-${pulumi.stack}
      image: ${mongo-image.repoDigest}
      ports:
        - internal: ${mongoPort}
          external: ${mongoPort}
      networksAdvanced:
        - name: ${network.name}
          aliases: ["mongo"]
```

And the code for the frontend container:

```yaml
frontend-container:
    type: docker:index:Container
    properties:
      name: frontend-${pulumi.stack}
      image: ${frontend-image.repoDigest}
      ports:
        - internal: ${frontendPort}
          external: ${frontendPort}
      envs:
        [
          "LISTEN_PORT=${frontendPort}",
          "HTTP_PROXY=backend-${pulumi.stack}:${backendPort}",
          "PROXY_PROTOCOL=http://"
        ]
      networksAdvanced:
        - name: ${network.name}
          aliases: ["frontend-${pulumi.stack}"]
```

Let's see what the whole program looks like next.

## Put it all together

Now that we know how to create a container we can complete our program.

```yaml
name: fundamentals
runtime: yaml
description: a yaml test
configuration:
  frontendPort:
    type: Number
  backendPort:
    type: Number
  mongoPort:
    type: Number
  mongoHost:
    type: String
  database:
    type: String
  nodeEnvironment:
    type: String
  protocol:
    type: String
variables:
  backendImageName: backend
  frontendImageName: frontend
resources:
  backend-image:
    type: docker:index:RemoteImage
    properties:
      name: pulumi/tutorial-pulumi-fundamentals-backend:latest
  frontend-image:
    type: docker:index:RemoteImage
    properties:
      name: pulumi/tutorial-pulumi-fundamentals-frontend:latest
  mongo-image:
    type: docker:index:RemoteImage
    properties:
      name: pulumi/tutorial-pulumi-fundamentals-database-local:latest
  network:
    type: docker:index:Network
    properties:
      name: services-${pulumi.stack}
  mongo-container:
    type: docker:index:Container
    properties:
      name: mongo-${pulumi.stack}
      image: ${mongo-image.repoDigest}
      ports:
        - internal: ${mongoPort}
          external: ${mongoPort}
      networksAdvanced:
        - name: ${network.name}
          aliases: ["mongo"]
  backend-container:
    type: docker:index:Container
    properties:
      name: backend-${pulumi.stack}
      image: ${backend-image.repoDigest}
      ports:
        - internal: ${backendPort}
          external: ${backendPort}
      envs:
        [
          "DATABASE_HOST=${mongoHost}",
          "DATABASE_NAME=${database}",
          "NODE_ENV=${nodeEnvironment}"
        ]
      networksAdvanced:
        - name: ${network.name}
          aliases: ["backend-${pulumi.stack}"]
    options:
      dependsOn:
        - ${mongo-container}
  frontend-container:
    type: docker:index:Container
    properties:
      name: frontend-${pulumi.stack}
      image: ${frontend-image.repoDigest}
      ports:
        - internal: ${frontendPort}
          external: ${frontendPort}
      envs:
        [
          "LISTEN_PORT=${frontendPort}",
          "HTTP_PROXY=backend-${pulumi.stack}:${backendPort}",
          "PROXY_PROTOCOL=http://"
        ]
      networksAdvanced:
        - name: ${network.name}
          aliases: ["frontend-${pulumi.stack}"]

```

With Docker networking, we can use image names to refer to a container. In our
example, the React frontend client sends requests to the Express backend client.
The URL to the backend is set via the `setupProxy.js` file in the
`app/frontend/src` directory with the `HTTP_PROXY` environment variable.

Run `pulumi up` to get the application running. Open a browser to `http://localhost:3001`, and our application is now deployed.


## Update the database

What if we want to add to the products on the page? We can POST to the API just as we would any API. Generally speaking, you would typically wire the database to an API and update it that way with any cloud, so we’re going to do exactly that here.

Open a terminal and run the following command.

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
```
{"status":"ok","data":{"product":{"ratings":{"reviews":[],"total":63,"avg":5},"created":1600979464567,"currency":{"id":"USD","format":"$"},"sizes":["M","L"],"category":"boba","teaType":2,"status":1,"_id":"5f6d025008a1b6f0e5636bc7","images":[{"_id":"62608f2a9ad5d90026847b0f","src":"classic_boba.png"}],"name":"My New Milk Tea","price":5,"description":"none","productCode":"852542-107","__v":0}}}
```

Open a browser to `http://localhost:3001`, and our data is now updated.

## Cleaning up

Whenever you're working on learning something new with Pulumi, it's always a
good idea to clean up any resources you've created so you don't get charged on a
free tier or otherwise leave behind resources you'll never use. Let's clean up.

Run the `pulumi destroy` command to remove all of the resources:

```bash
$ pulumi destroy
Previewing destroy (dev)

View Live: https://app.pulumi.com/<org>/<project>/<stack>/previews/<build-id>

...
Do you want to perform this destroy? yes
Destroying (dev)

View Live: https://app.pulumi.com/<org>/<project>/<stack>/updates/<update-id>

...

The resources in the stack have been deleted, but the history and configuration associated with the stack are still maintained.
If you want to remove the stack completely, run 'pulumi stack rm dev'.
```

Now your resources should all be cleared! That last comment you see in the
output notes that the stack and all of the configuration and history will stay
in your dashboard on the Pulumi Service ([app.pulumi.com](https://app.pulumi.com/)). For now, that's okay. We'll talk
more about removing the project from your history in another pathway.

---

Congratulations, you've now finished Pulumi Fundamentals! You learned to create
a Pulumi project; work on your Pulumi program to build Docker images,
containers, and networks; and deploy the infrastructure locally with your first
resource provider.
