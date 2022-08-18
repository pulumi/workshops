# Lab 02 - Create & Run a Docker Container

In this lab, we'll create our first Pulumi resource. We'll run a Docker container we build locally using infrastructure as code.

## Step 1 - Create your application

Now, let's make a very simple HTTP application with Python. Inside your project directory, create an application directory:

```bash
mkdir app
```

Inside this `app` directory should be two files. We need to bootstrap a webserver application. We can use native python for this:

In a file called `app/__main__.py` add the following contents:

```python
import http.server
import socketserver
from http import HTTPStatus


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(HTTPStatus.OK)
        self.end_headers()
        self.wfile.write(b'Hello Lee')


httpd = socketserver.TCPServer(('', 3000), Handler)
httpd.serve_forever()
```

Next, create a `Dockerfile` which will be built and will include this webserver

```
FROM python:3.8.6-alpine

WORKDIR /app

COPY __main__.py /app

CMD [ "python", "/app/__main__.py" ]
```

## Step 2 - Build your Docker Image with Pulumi

Back inside your pulumi program, let's build your Docker image. Inside your Pulumi program's `__main__.py` add the following:


```python
import pulumi
from pulumi_docker import Image, DockerBuild

stack = pulumi.get_stack()
image_name = "my-first-app"

# build our image!
image = Image(image_name,
              build=DockerBuild(context="app"),
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
