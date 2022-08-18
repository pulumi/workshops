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
$ pulumi new yaml -y
```
This command prints output similar to the following example with a bit more
information and status as it goes:

```bash
Created project 'my_first_app'
# ...
Created stack 'dev'

Your new project is ready to go! ✨

To perform an initial deployment, run 'pulumi up'
```

This command creates all the files we need, initializes a new stack named `dev`
(an instance of our project), and installs any necessary dependencies.

## Inspect your new project

The basic project created by `pulumi new` is comprised of multiple files:

- `Pulumi.yaml`: your project's metadata, containing its name and language, and also your program's main entrypoint file

Use the command `cat Pulumi.yaml` to explore the contents of your
project's empty program:

```yaml
description: ${DESCRIPTION}
runtime: yaml
template:
    description: A minimal Pulumi YAML program
configuration: {}
variables: {}
resources: {}
outputs: {}
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
we're using YAML as our _language host_, or the executor that compiles the
code we write and interprets it for Pulumi.

```text
Note that we're only using Docker here to make it easier to learn about Pulumi
(mainly because setting up a new account on any of the cloud providers can take
some time and can introduce a lot of complexity). Most users are using one of
the major cloud providers to build with Pulumi.
```

## Verify your application

Let’s explore what app we’re deploying on the infrastructure we’re creating. Open up 
the [pulumi/tutorial-pulumi-fundamentals repo](https://github.com/pulumi/tutorial-pulumi-fundamentals). Let’s explore the contents of the `app/` 
directory. There is a backend, a frontend, and a data directory. All three directories 
contain a Dockerfile that builds the application images.

Let’s examine the backend `Dockerfile` in `app/backend/Dockerfile`:



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

Back inside your Pulumi program, let’s build your first Docker image. Remember that a Pulumi program is the code that defines the desired state of your infrastructure using a general-purpose programming language. In this case, we’re using YAML , so our main file is `Pulumi.yaml` . Inside your program’s `Pulumi.yaml` file, use any editor to add the following code:

```yaml
name: fundamentals
runtime: yaml
description: A minimal Pulumi YAML program
resources:
  backend-image:
    type: docker:index:RemoteImage
    properties:
      name: pulumi/tutorial-pulumi-fundamentals-backend:latest
```

In this file, we’re defining a `RemoteImage` resource using the Docker provider. The properties are the arguments (or *inputs* in Pulumi terms) that the resource takes. The Docker provider uses the `name` input to pull a remote image for us to use.

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

Now that we've provisioned our first piece of infrastructure, let's add the
other pieces of our application.

## Add the frontend client and MongoDB

Our application includes a frontend client and MongoDB. We'll add them to the
program, so add this code after the previous fragment.

```yaml
frontend-image:
    type: docker:index:RemoteImage
    properties:
      name: pulumi/tutorial-pulumi-fundamentals-frontend:latest
mongo-image:
  type: docker:index:RemoteImage
  properties:
    name: pulumi/tutorial-pulumi-fundamentals-database-local:latest
```

We build the frontend client and the populated MongoDB database image the same way we built the backend.

Compare your program now to this complete program before we move forward:

```yaml
name: fundamentals
runtime: yaml
description: a yaml test
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

If your code looks the same, great! Otherwise, update yours to match this code.

Now, run `pulumi up` to build all of the images that we'll need.

```text
Note that, in the future, you don't need to run `pulumi up` in stages like this
to create your infrastructure. You can write the entire program and then run it.
We're only doing a step-by-step process here to make learning easier.
```

From here, we can move on to [configuring and provisioning our containers](../lab-2/README.md).

Onward!
