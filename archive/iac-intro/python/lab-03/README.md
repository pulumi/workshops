# Lab 03 - Using configuration

Now that we've provisioned our first resource, let's use Pulumi's configuration management to make it configurable.

We want to run the image we've provisioned, so we're going to learn about configuration and another important topic, inputs and outputs.

## Step 1 - Instantiate the config

Add the following to your Pulumi program below your imports:


```python
config = pulumi.Config()
port = config.require_int("port")
```
Your Pulumi program should now look like this:

```python
import pulumi
from pulumi_docker import Image, DockerBuild

config = pulumi.Config()
port = config.require_int("port")

stack = pulumi.get_stack()
image_name = "my-first-app"


# build our image!
image = Image(image_name,
              build=DockerBuild(context="app"),
              image_name=f"{image_name}:{stack}",
              skip_push=True)
```

Try and run your `pulumi up` again at this point. You should see an error like this:

```
Diagnostics:
  pulumi:pulumi:Stack (my-first-app-dev):
    error: Missing required configuration variable 'my-first-app:port'
        please set a value using the command `pulumi config set my-first-app:port <value>`
```

This is because we have specified that this config option is _required_. Let's set it for this stack:

```
pulumi config set port 3000
```

Now, try and rerun your Pulumi program.

Your Pulumi program should now run, but you're not actually using this newly configured port, yes!

## Step 2 - Update your Python WebApp

Let's update your `app/__main__.py` file to use a port which can be configured by an environment variable. Update that file so it looks like this:

```python
import http.server
import socketserver
import os
from http import HTTPStatus


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(HTTPStatus.OK)
        self.end_headers()
        self.wfile.write(b'Hello, world!')



PORT = os.environ.get("LISTEN_PORT")
httpd = socketserver.TCPServer(('', int(PORT)), Handler)
httpd.serve_forever()
```

We're grabbing the `PORT` value here from the environment variable `LISTEN_PORT`. Now, let's use Pulumi to pass that into our Docker container.

## Step 3 - Create a Container resource

In lab 02 we built a Docker Image. Now we want to create a Docker container which runs that image and pass our configuration to it.

Define a new resource in your Pulumi program below the `image` resource, like this:

```python
container = Container('my-first-app',
                      image=image.base_image_name,
                      envs=[
                          f"LISTEN_PORT={port}"
                      ],
                      ports=[ContainerPortArgs(
                          internal=port,
                          external=port,
                      )])
```

It's important to note something here. In the Container resource, we are reference `baseImageName` from the `image` resource. Pulumi now knows there's a dependency between these two resources, and will know to create the `container` resource _after_ the image resource.

Run your `pulumi up` again here and see your docker image running.

# Next Steps

* [Export Outputs](../lab-04/README.md)
