# Lab 02 - Create & Run a Docker Container

In this lab, we'll create our first Pulumi resource. We'll run a Docker container we build locally using infrastructure as code.

## Step 1 - Verify your application

We have a preconfigured python webserver application in our repo. Take a look at `app/python/__main__.py`


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
You'll see this is a very simple Python webserver that listens on a port and serves a response: `Hello, world!`

Next, let's examine our `Dockerfile` in `app/python/Dockerfile`:

```
FROM python:3.8.6-alpine

WORKDIR /app

COPY __main__.py /app

CMD [ "python", "/app/__main__.py" ]
```

This `Dockerfile` copies the python webserver into the Docker container and runs it.

## Step 2 - Build your Docker Image with Pulumi

Back inside your pulumi program, let's build your Docker image. Inside your Pulumi program's `__main__.py` add the following:


```python
import pulumi
from pulumi_docker import Image, DockerBuild

stack = pulumi.get_stack()
image_name = "my-first-app"

# build our image!
image = Image(image_name,
              build=DockerBuild(context="../app/python"),
              image_name=f"{image_name}:{stack}",
              skip_push=True)
```

Make sure you install the `pulumi_docker` provider from pip inside your virtualenv:

```
source venv/bin/activate
pip3 install pulumi_docker
```

You should see some output showing the pip package and the provider being installed

Run `pulumi up` and it should build your docker image

If you run `docker images` you should see your built container.

Now that we've provisioned our first piece of infrastructure, let's look at how we can use configuration in our Pulumi programs.

# Next Steps

* [Use configuration](../lab-03/README.md)
