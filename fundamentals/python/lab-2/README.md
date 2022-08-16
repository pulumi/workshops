Now that we've created our images, we can provision our application with a network and containers. First, we're going to add configuration to our Pulumi
program. Pulumi is a tool to
[configure](https://www.pulumi.com/docs/intro/concepts/config/) your infrastructure,
and that includes being able to configure the different stacks with different
values. As a result, it makes sense to include the basic configurations as
variables at the top of your program.

## Configure the application

Add the following configuration variables to your Pulumi program below the
imports:

```python
# get configuration
config = pulumi.Config()
frontend_port = config.require_int("frontend_port")
backend_port = config.require_int("backend_port")
mongo_port = config.require_int("mongo_port")
```

Your Pulumi program should now match this code:

```python
import os
import pulumi
import pulumi_docker as docker

# get configuration
config = pulumi.Config()
frontend_port = config.require_int("frontend_port")
backend_port = config.require_int("backend_port")
mongo_port = config.require_int("mongo_port")

stack = pulumi.get_stack()

# build our backend image!
backend_image_name = "backend"
backend = docker.Image("backend",
                        build=docker.DockerBuild(context=f"{os.getcwd()}/app/backend"),
                        image_name=f"{backend_image_name}:{stack}",
                        skip_push=True
                        )

# build our frontend image!
frontend_image_name = "frontend"
frontend = docker.Image("frontend",
                        build=docker.DockerBuild(context=f"{os.getcwd()}/app/frontend"),
                        image_name=f"{frontend_image_name}:{stack}",
                        skip_push=True
                        )

# build our mongodb image!
mongo_image = docker.RemoteImage("mongo", name="mongo:bionic")
```

Try and run your `pulumi up` again at this point. You should get an error like
this:

```bash
Diagnostics:
  pulumi:pulumi:Stack (my-first-app-dev):
    error: Missing required configuration variable 'my-first-app:frontend_port'
        please set a value using the command `pulumi config set my-first-app:frontend_port <value>`
    error: an unhandled error occurred: Program exited with non-zero exit code: 1
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

```python
# create a network!
network = docker.Network("network", name=f"services-{stack}")
```

Define a new
[`Container`](https://www.pulumi.com/registry/packages/docker/api-docs/container/)
resource in your Pulumi program below the `Network` resource, like this:

```python
# create the backend container!
backend_container = docker.Container("backend_container",
                        name=f"backend-{stack}",
                        image=backend.base_image_name,
                        ports=[docker.ContainerPortArgs(
                            internal=backend_port,
                            external=backend_port)],
                        envs=[
                            f"DATABASE_HOST={mongo_host}",
                            f"DATABASE_NAME={database}",
                            f"NODE_ENV={node_environment}"
                        ],
                        networks_advanced=[docker.ContainerNetworksAdvancedArgs(
                            name=network.name
                        )],
                        opts=pulumi.ResourceOptions(depends_on=[mongo_container])
                        )
```

It is important to note something here. In the `Container` resource, we are
referencing `base_image_name` from the `Image` resource. Pulumi now knows there is
a dependency between these two resources and will know to create the
`Container` resource _after_ the `Image` resource. Another dependency to note is
that the `backend_container` depends on the `mongo_container`. If we tried to
run `pulumi up` without the `mongo_container` running or present somewhere in
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

```python
mongo_host = config.require("mongo_host") # Note that strings are the default, so it's not `config.require_str`, just `config.require`.
database = config.require("database")
node_environment = config.require("node_environment")
```

We also need to create `Container` resources for the frontend and mongo
containers. Put the `mongo_container` declaration just above the `backend_container` one, and the
`frontend_container` declaration at the end of the file. Here's the code for the mongo container:

```python
# create the mongo container!
mongo_container = docker.Container("mongo_container",
                        image=mongo_image.repo_digest,
                        name=f"mongo-{stack}",
                        ports=[docker.ContainerPortArgs(
                          internal=mongo_port,
                          external=mongo_port
                        )],
                        networks_advanced=[docker.ContainerNetworksAdvancedArgs(
                            name=network.name,
                            aliases=["mongo"]
                        )]
                        )
```

And the code for the frontend container:

```python
# create the frontend container!
frontend_container = docker.Container("frontend_container",
                                      image=frontend.base_image_name,
                                      name=f"frontend-{stack}",
                                      ports=[docker.ContainerPortArgs(
                                          internal=frontend_port,
                                          external=frontend_port
                                      )],
                                      envs=[
                                          f"LISTEN_PORT={frontend_port}",
                                          f"HTTP_PROXY=backend-{stack}:{backend_port}"
                                      ],
                                      networks_advanced=[docker.ContainerNetworksAdvancedArgs(
                                          name=network.name
                                      )]
                                      )
```

Let's see what the whole program looks like next.

## Put it all together

Now that we know how to create a container we can complete our program.

```python
import os
import pulumi
import pulumi_docker as docker

# get configuration
config = pulumi.Config()
frontend_port = config.require_int("frontend_port")
backend_port = config.require_int("backend_port")
mongo_port = config.require_int("mongo_port")
mongo_host = config.require("mongo_host") # Note that strings are the default, so it's not `config.require_str`, just `config.require`.
database = config.require("database")
node_environment = config.require("node_environment")

stack = pulumi.get_stack()

# build our backend image!
backend_image_name = "backend"
backend = docker.Image("backend",
                        build=docker.DockerBuild(context=f"{os.getcwd()}/app/backend"),
                        image_name=f"{backend_image_name}:{stack}",
                        skip_push=True
                        )

# build our frontend image!
frontend_image_name = "frontend"
frontend = docker.Image("frontend",
                        build=docker.DockerBuild(context=f"{os.getcwd()}/app/frontend"),
                        image_name=f"{frontend_image_name}:{stack}",
                        skip_push=True
                        )

# build our mongodb image!
mongo_image = docker.RemoteImage("mongo", name="mongo:bionic")

# create a network!
network = docker.Network("network", name=f"services-{stack}")

# create the mongo container!
mongo_container = docker.Container("mongo_container",
                        image=mongo_image.repo_digest,
                        name=f"mongo-{stack}",
                        ports=[docker.ContainerPortArgs(
                          internal=mongo_port,
                          external=mongo_port
                        )],
                        networks_advanced=[docker.ContainerNetworksAdvancedArgs(
                            name=network.name,
                            aliases=["mongo"]
                        )]
                        )

# create the backend container!
backend_container = docker.Container("backend_container",
                        name=f"backend-{stack}",
                        image=backend.base_image_name,
                        ports=[docker.ContainerPortArgs(
                            internal=backend_port,
                            external=backend_port)],
                        envs=[
                            f"DATABASE_HOST={mongo_host}",
                            f"DATABASE_NAME={database}",
                            f"NODE_ENV={node_environment}"
                        ],
                        networks_advanced=[docker.ContainerNetworksAdvancedArgs(
                            name=network.name
                        )],
                        opts=pulumi.ResourceOptions(depends_on=[mongo_container])
                        )

# create the frontend container!
frontend_container = docker.Container("frontend_container",
                                      image=frontend.base_image_name,
                                      name=f"frontend-{stack}",
                                      ports=[docker.ContainerPortArgs(
                                          internal=frontend_port,
                                          external=frontend_port
                                      )],
                                      envs=[
                                          f"LISTEN_PORT={frontend_port}",
                                          f"HTTP_PROXY=backend-{stack}:{backend_port}"
                                      ],
                                      networks_advanced=[docker.ContainerNetworksAdvancedArgs(
                                          name=network.name
                                      )]
                                      )

```

With Docker networking, we can use image names to refer to a container. In our
example, the React frontend client sends requests to the Express backend client.
The URL to the backend is set via the `setupProxy.js` file in the
`app/frontend/src` directory with the `HTTP_PROXY` environment variable.

Run `pulumi up` to get the application running. However, the store is empty, and
we need to add products to the database.

## Populate the database

Now we can populate MongoDB and set up our Pulumi program to autopopulate the
next time we deploy. First, copy the `products.json` file into the same
directory as your {{< langfile >}} file.

```bash
cp app/data/products.json .
```

Then, we'll mount the file to an ephemeral seed container, and then use
`mongoimport` to transfer that data into the database. The ephemeral container
imports the data we need into the initialized database, all in a container that
does work and shuts down and removes itself after the import is completed. This
kind of workflow with temporary containers is fairly common when updating
databases intermittently with data pulled from another system. Generally,
however, you would typically wire the database to an API and update it that way.
This example demonstrates, however, that you _can_ do this workflow with Pulumi,
just like you could with Docker.

Add this snippet after the `backend_container` declaration:

```python
data_seed_container = docker.Container("data_seed_container",
                                       image=mongo_image.repo_digest,
                                       name="data_seed",
                                       must_run=False,
                                       opts=pulumi.ResourceOptions(depends_on=[backend_container]),
                                       mounts=[docker.ContainerMountArgs(
                                           target="/home/products.json",
                                           type="bind",
                                           source=f"{os.getcwd()}/products.json"
                                       )],
                                       command=[
                                           "sh", "-c",
                                           "mongoimport --host mongo --db cart --collection products --type json --file /home/products.json --jsonArray"
                                       ],
                                       networks_advanced=[docker.ContainerNetworksAdvancedArgs(
                                           name=network.name
                                       )]
                                       )
```

Note the `mounts` part, which allows you to use a `bind mount` storage type to
add the necessary file. If you're not familiar with mounts compared to volumes
in Docker, see [the docs on bind
mounts](https://docs.docker.com/storage/bind-mounts/). In this case, we're using
a bind mount over a volume for simplicity.

Once you've added this snippet, run `pulumi up` to refresh the data in the
database. From here, you can choose to comment out or remove that seed container
as long as you have the infrastructure up and running. If you were to rebuild
this environment elsewhere, though, or to tear it down and rebuild it from
scratch, you'll need to have this resource in your code.

Open a browser to `http://localhost:3001`, and our application is now deployed.

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
