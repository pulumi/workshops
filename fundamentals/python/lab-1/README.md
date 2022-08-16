Infrastructure in Pulumi is organized into _projects_. In the Pulumi ecosystem,
a project represents a Pulumi _program_ that, when run, declares the desired
infrastructure for Pulumi to manage. The program has corresponding _stacks_, or
isolated, independently configurable instances of your Pulumi program. 

## Create a directory

Each Pulumi project lives in its own directory. Create one now and change into
it by running these commands in your terminal:

```bash
mkdir my-first-app
cd my-first-app
```

Pulumi will use the directory name as your project name by default. To create an
independent project, name the directory differently.

## Initialize your project

Since a Pulumi project is just a directory with some files in it, it is possible
for you to create a new one by hand. The `pulumi new` command-line interface
(CLI) command, however, automates the process and ensures you have everything
you need, so let's use that command. The `-y` flag answers "yes" to the prompts to
create a default project:

```bash
$ pulumi new python -y
```
This command prints output similar to the following example with a bit more
information and status as it goes:

```bash
Created stack 'dev'

Creating virtual environment...

Finished creating virtual environment

Updating pip, setuptools, and wheel in virtual environment...
...
Your new project is ready to go! ✨

To perform an initial deployment, run 'pulumi up'
```

This command creates all the files we need, initializes a new stack named `dev`
(an instance of our project), and installs any necessary dependencies.

## Inspect your new project

The basic project created by `pulumi new` is comprised of multiple files:

- `Pulumi.yaml`: your project's metadata, containing its name and language
- `__main__.py`: your program's main entrypoint file
- `requirements.txt`: your project's Python dependency information
- `venv`: a [virtualenv](https://pypi.org/project/virtualenv/) for your project

Use the command `cat __main__.py` to explore the contents of your
project's empty program:

```python
"""A Python Pulumi program"""

import pulumi
```

Feel free to explore the other files, although we won't be editing any of them
by hand.

In this part, we'll create our first Pulumi _resource_. Resources in Pulumi are
the basic building blocks of your infrastructure, whether that's a database
instance or a compute instance or a specific storage bucket. In Pulumi,
_resource providers_ manage your resources. You can group those resources to
abstract them (such as a group of compute instances that all have the same
configuration and implementation) via component resources.

In this case, our resources are going to be Docker containers and images that we
build locally using infrastructure as code. Our resource provider is Docker, and
we're using Python as our _language host_, or the executor that compiles the
code we write and interprets it for Pulumi.

```text
Note that we're only using Docker here to make it easier to learn about Pulumi
(mainly because setting up a new account on any of the cloud providers can take
some time and can introduce a lot of complexity). Most users are using one of
the major cloud providers to build with Pulumi.
```

## Verify your application

Create a directory called `app` inside the `my-first-app` directory you made in
the previous tutorial. Clone the code repository there, then move everything
from the code repository directory to the `app/` directory:

```bash
mkdir app
cd app
git clone git@github.com:pulumi/tutorial-pulumi-fundamentals.git
mv -f tutorial-pulumi-fundamentals/* . && rm -rf tutorial-pulumi-fundamentals/
```

Let's explore the contents of the `app/` directory. There is a backend, a
frontend, and a data directory. Both the frontend and backend directories
contain a `Dockerfile` that builds the application images.

Let's examine the backend `Dockerfile` in `app/backend/Dockerfile`:

```docker
FROM node:14

# Create app directory
WORKDIR /usr/src/app

COPY ./src/package*.json ./
RUN npm install
COPY ./src .
RUN npm build
EXPOSE 3000

CMD [ "npm", "start" ]
```

This `Dockerfile` copies the REST backend into the Docker filesystem, installs
the dependencies, and builds the image. Note that port 3000 must be open on your
host machine.

## Build your Docker Image with Pulumi

Before we start writing our Pulumi program, we need to install the right
provider. In this case, we want to use the `pulumi_docker` provider for Python,
our language host. It's always good practice for Python to work inside a virtual
environment, or venv, so let's activate our venv and use `pip` to install the
provider along with the main Pulumi package:

```bash
cd ../
source venv/bin/activate
pip3 install pulumi_docker
```

You should see output showing the provider package being installed, just like
for any Python package install. Add the package to the `requirements.txt` file
by adding `pulumi_docker` on a new line at the end of the file.

Back inside your Pulumi program, let's build your first Docker image. Remember
that a Pulumi program is the code that defines the desired state of your
infrastructure using a general-purpose programming language. In this case, we're
using Python, so our main file is `__main__.py` Inside your program's
`__main__ py`file, use any editor to add the following code:


```python
import os
import pulumi
import pulumi_docker as docker

stack = pulumi.get_stack()

# build our backend image!
backend_image_name = "backend"
backend = docker.Image("backend",
                        build=docker.DockerBuild(context=f"{os.getcwd()}/app/backend"),
                        image_name=f"{backend_image_name}:{stack}",
                        skip_push=True
                        )
```

In this file, we import the main Pulumi package and the Docker provider. Then,
we figure out which stack we're operating against, and populate the `stack`
variable for later use. When we build our backend image, we name it in our stack
as "backend" before passing some arguments to the Docker provider. The Docker
provider uses the build context and the image name to build an image, and it
does not push the image up anywhere.

Notice that we're mixing in some language constructs in here like `os.getcwd()`.
With Pulumi, we have access to the full language ecosystem, including
third-party libraries. Pulumi also has typing support, so you can use the tools
in your favorite IDE, like completion, to verify that you're using the correct
types for any inputs you're using. Pretty cool!

Run `pulumi up`.

```text
Note that it make take a bit before you get any output because Docker is doing a
lot of work in the background before it connects to Pulumi. Be patient!
```

Pulumi should build your Docker image. First, though, it
gives you a preview of the changes you'll be making to the stack and asks if the
changes appear okay to you. You'll need to reply "yes" to the prompt to actually
build the image. After the command finishes, you will see your image if you run
the command `docker images` or `docker image ls` (depending on your preference).

Let's dig a bit deeper into the code and explore the various Pulumi concepts.
Every resource has _inputs_ and _outputs_. Inputs are values that are
provided to the resource. Outputs are the resource's properties. Note that
Pulumi can't know the output until the resource has completed provisioning as
some of those outputs are provided by the provider after everything has loaded,
booted, or otherwise has come online. More on outputs later.

In our case here, the Docker
[`Image`](https://www.pulumi.com/registry/packages/docker/api-docs/image/) resource
takes the following inputs:

- `name`: a name for the resource we are creating
- `build`: the Docker build context (i.e., the path to the app)
- `image_name`: the qualified image name which can include a tag
- `skip_push`: a flag that defines whether to push to a registry

Now that we've provisioned our first piece of infrastructure, let's add the
other pieces of our application.

## Add the frontend client and MongoDB

Our application includes a frontend client and MongoDB. We'll add them to the
program, so add this code after the previous fragment.

```python
# build our frontend image!
frontend_image_name = "frontend"
frontend = docker.Image("frontend",
                        build=docker.DockerBuild(context=f"{os.getcwd()}/app/frontend"),
                        image_name=f"{frontend_image_name}:{stack}",
                        skip_push=True
                        )
```

We build the frontend client the same way we built the backend. However, we are
going to use the official MongoDB image from Docker Hub, so we use the
[`RemoteImage`](https://www.pulumi.com/registry/packages/docker/api-docs/remoteimage/)
resource.

```python
# build our mongodb image!
mongo_image = docker.RemoteImage("mongo", name="mongo:bionic")
```

Compare your program now to this complete program before we move forward:

```python
import os
import pulumi
import pulumi_docker as docker

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

If your code looks the same, great! Otherwise, update yours to match this code.

Now, run `pulumi up` to build all of the images that we'll need.

```text
Note that, in the future, you don't need to run `pulumi up` in stages like this
to create your infrastructure. You can write the entire program and then run it.
We're only doing a step-by-step process here to make learning easier.
```

From here, we can move on to configuring and provisioning our containers.

Onward!
