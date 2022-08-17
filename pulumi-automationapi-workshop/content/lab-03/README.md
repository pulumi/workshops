# Lab 03 &mdash; Build a WebApp

In lab 02, we built a Pulumi program that uses the Pulumi CLI to provision resources. This is the most common mechanism of interacting with Pulumi.

However, it's possible to provision Pulumi programs via other user interfaces. In this lab, we're going to build the skeleton of a web application which can be used to deploy Pulumi programs.

## Step 0 &mdash; Destroy your last deployment

Before you proceed, make sure you destroy your existing deployment:

```bash
pulumi destroy --yes
Previewing destroy (dev)

View Live: https://app.pulumi.com/jaxxstorm/deployment-platyform/dev/previews/d4c9912a-c10d-4ad6-9115-56ea8fc97adb

     Type                                    Name                      Plan       
 -   pulumi:pulumi:Stack                     deployment-platyform-dev  delete     
 -   └─ productionapp:index:ProductionApp    lbriggs                   delete     
 -      └─ kubernetes:core/v1:Namespace      lbriggs                   delete     
 -         ├─ kubernetes:core/v1:Service     lbriggs                   delete     
 -         └─ kubernetes:apps/v1:Deployment  lbriggs                   delete     
 
Outputs:
  - url: "144.126.248.192"

Resources:
    - 5 to delete

Destroying (dev)
```

and then remove the stack:

```bash
pulumi stack rm dev
This will permanently remove the 'dev' stack!
Please confirm that this is what you'd like to do by typing ("dev"): dev
```

Now we're ready to use the automation API to deploy our application!

## Step 1 &mdash; Install Flask

We'll be using Flask to build our Web Application, so let's install it

```bash
# activate our virtualenv
source venv/bin/activate
pip3 install flask
```

## Step 2 &mdash; Update your `__main__.py`

Previously, the `__main__.py` file was being read by our Pulumi CLI. Let's instead turn it into a Flask webserver.

Clear all the code you had in your `__main__.py` and add the following:

```python
import flask
import os

# references the templates and static files in the assets dir
template_dir = os.path.abspath('../assets/templates')
css_dir = os.path.abspath('../assets/static')
app = flask.Flask(__name__, template_folder=template_dir, static_folder=css_dir)

app.secret_key = "super-secret-key"

@app.route("/ping", methods=["GET"])
def ping():
	return flask.jsonify("pong!", 200)

if __name__ == "__main__":
    app.run()    
```

We're making a very barebones flask webserver here, with a single route: `/ping`.

We can now run this using python:

```python
python3 __main__.py
```

If you want to verify everything is working, you can open another terminal and test the endpoint we just made:

```bash
curl http://localhost:5000/ping
["pong!",200]
```

## Step 3 &mdash; Create a root/index Page

Now, we can start building the functionality of our web application. The Git repo you cloned already has all of the HTML and styling prepared,
we just need to add the routes into Flask.

Let's start by adding the root URI, `/`. Before that, we'll need to add some dependencies. Add the following lines of code to your `__main__.py`:

```python
import flask
import os
import pulumi
from pulumi import automation as auto
from app import ProductionAppArgs, ProductionApp

# we want all our deployments to go into the same stack
project_name = "deployment-platyform"

# we use the component resource we built earlier as our Pulumi program
def create_pulumi_program(name: str, image: str, port: int):
	app = ProductionApp(
		name, ProductionAppArgs(image=image, port=port)
	)

"""
this defines the index page, or root URI

we loop through all the deployments in our stack to list all the deployments
"""
@app.route("/", methods=["GET"])
def list_deployments():
	deployments = []
	try:
		ws = auto.LocalWorkspace(project_settings=auto.ProjectSettings(name=project_name, runtime="python"))
		all_stacks = ws.list_stacks()
		for stack in all_stacks:
			stack = auto.select_stack(stack_name=stack.name,
			                          project_name=project_name,
			                          # no-op program, just to get outputs
			                          program=lambda: None)
			outs = stack.outputs()
			deployments.append({"name": stack.name, "url": outs["url"].value})
	except Exception as exn:
		flask.flash(str(exn), category="danger")
	return flask.render_template("index.html", deployments=deployments)
```

> At this stage, your `__main__.py` file should look like this

```python
import flask
import os
import pulumi
from pulumi import automation as auto
from app import ProductionAppArgs, ProductionApp

# references the templates in the assets dir
template_dir = os.path.abspath('../assets/templates')
app = flask.Flask(__name__, template_folder=template_dir)


app.secret_key = "super-secret-key"


# we want all our deployments to go into the same stack
project_name = "deployment-platyform"


# we use the component resource we built earlier as our Pulumi program
def create_pulumi_program(name: str, image: str, port: int):
    app = ProductionApp(
        name, ProductionAppArgs(image=image, port=port)
    )


@app.route("/ping", methods=["GET"])
def ping():
	return flask.jsonify("pong!", 200)


@app.route("/", methods=["GET"])
def list_deployments():
	deployments = []
	try:
		ws = auto.LocalWorkspace(project_settings=auto.ProjectSettings(name=project_name, runtime="python"))
		all_stacks = ws.list_stacks()
		for stack in all_stacks:
			stack = auto.select_stack(stack_name=stack.name,
			                          project_name=project_name,
			                          # no-op program, just to get outputs
			                          program=lambda: None)
			outs = stack.outputs()
			deployments.append({"name": stack.name, "url": outs["url"].value})
	except Exception as exn:
		flask.flash(str(exn), category="danger")
	return flask.render_template("index.html", deployments=deployments)

if __name__ == "__main__":
    app.run()
```

## Step 4 &mdash; Add the `/new` page

We've added the page that lists all current deployments, but we don't actually have any deployments to list.

Let's add a page to create a new deployment.

Add the following to your `__main__.py`


```python
@app.route("/new", methods=["GET", "POST"])
def create_deployment():
    """creates new deployment"""
    if flask.request.method == "POST":
        stack_name = flask.request.form.get("name")
        image = flask.request.form.get("image")
        port = flask.request.form.get("port")

        def pulumi_program():
            return create_pulumi_program(stack_name, image, int(port))

        try:
            # create a new stack, generating our pulumi program on the fly from the POST body
            stack = auto.create_stack(
                stack_name=str(stack_name),
                project_name=project_name,
                program=pulumi_program,
            )
            # deploy the stack, tailing the logs to stdout
            stack.up(on_output=print)
            flask.flash(f"Successfully created deployment '{stack_name}'", category="success")
        except auto.StackAlreadyExistsError:
            flask.flash(
                f"Error: Deployment with name '{stack_name}' already exists, pick a unique name",
                category="danger",
            )

        return flask.redirect(flask.url_for("list_deployments"))

    return flask.render_template("create.html")
```

## Step 5 &mdash; Add a delete deployment page

Finally, we ened to be able to delete our deployments. Let's add a `/delete` page. Add the following to your `__main__.py`:

```python
@app.route("/<string:id>/delete", methods=["POST"])
def delete_deployment(id: str):
    stack_name = id
    try:
        stack = auto.select_stack(stack_name=stack_name,
                                  project_name=project_name,
                                  # noop program for destroy
                                  program=lambda: None)
        stack.destroy(on_output=print)
        stack.workspace.remove_stack(stack_name)
        flask.flash(f"Deployment '{stack_name}' successfully deleted!", category="success")
    except auto.ConcurrentUpdateError:
        flask.flash(f"Error: Deployment '{stack_name}' already has update in progress", category="danger")
    except Exception as exn:
        flask.flash(str(exn), category="danger")

    return flask.redirect(flask.url_for("list_deployments"))
```

> At this stage, your `__main__.py` should look like this:

```python
import flask
import os
import pulumi
from pulumi import automation as auto
from app import ProductionAppArgs, ProductionApp

# references the templates and static files in the assets dir
template_dir = os.path.abspath('../assets/templates')
css_dir = os.path.abspath('../assets/static')
app = flask.Flask(__name__, template_folder=template_dir, static_folder=css_dir)


app.secret_key = "super-secret-key"


# we want all our deployments to go into the same stack
project_name = "deployment-platyform"


# we use the component resource we built earlier as our Pulumi program
def create_pulumi_program(name: str, image: str, port: int):
    app = ProductionApp(
        name, ProductionAppArgs(image=image, port=port)
    )


@app.route("/ping", methods=["GET"])
def ping():
	return flask.jsonify("pong!", 200)


@app.route("/", methods=["GET"])
def list_deployments():
	deployments = []
	try:
		ws = auto.LocalWorkspace(project_settings=auto.ProjectSettings(name=project_name, runtime="python"))
		all_stacks = ws.list_stacks()
		for stack in all_stacks:
			stack = auto.select_stack(stack_name=stack.name,
			                          project_name=project_name,
			                          # no-op program, just to get outputs
			                          program=lambda: None)
			outs = stack.outputs()
			deployments.append({"name": stack.name, "url": outs["url"].value})
	except Exception as exn:
		flask.flash(str(exn), category="danger")
	return flask.render_template("index.html", deployments=deployments)

@app.route("/new", methods=["GET", "POST"])
def create_deployment():
    """creates new deployment"""
    if flask.request.method == "POST":
        stack_name = flask.request.form.get("name")
        image = flask.request.form.get("image")
        port = flask.request.form.get("port")

        def pulumi_program():
            return create_pulumi_program(stack_name, image, int(port))

        try:
            # create a new stack, generating our pulumi program on the fly from the POST body
            stack = auto.create_stack(
                stack_name=str(stack_name),
                project_name=project_name,
                program=pulumi_program,
            )
            # deploy the stack, tailing the logs to stdout
            stack.up(on_output=print)
            flask.flash(f"Successfully created deployment '{stack_name}'", category="success")
        except auto.StackAlreadyExistsError:
            flask.flash(
                f"Error: Deployment with name '{stack_name}' already exists, pick a unique name",
                category="danger",
            )

        return flask.redirect(flask.url_for("list_deployments"))

    return flask.render_template("create.html")

@app.route("/<string:id>/delete", methods=["POST"])
def delete_deployment(id: str):
    stack_name = id
    try:
        stack = auto.select_stack(stack_name=stack_name,
                                  project_name=project_name,
                                  # noop program for destroy
                                  program=lambda: None)
        stack.destroy(on_output=print)
        stack.workspace.remove_stack(stack_name)
        flask.flash(f"Deployment '{stack_name}' successfully deleted!", category="success")
    except auto.ConcurrentUpdateError:
        flask.flash(f"Error: Deployment '{stack_name}' already has update in progress", category="danger")
    except Exception as exn:
        flask.flash(str(exn), category="danger")

    return flask.redirect(flask.url_for("list_deployments"))

if __name__ == "__main__":
    app.run()
```

We now need to restart our http server by running it:

```python
python3 __main__.py
```

## Step 6 &mdash; Try out your deployment platyform

Open up your web browser to port 5000. You should see a website like so:

![Deployment Platyform UI](../../img/ui.png?raw=true)

Click, create new and fill out the boxes as required:

![Deployment Platyform New](../../img/new.png?raw=true)

You will see the website spin as it deploys your website. We can observe the status in the terminal from where we ran our python flask webserver.

Once your deployment is complete, you can click the image to open the deployed website.

![Deployment Platyform New](../../img/link.png?raw=true)

Finally, make sure to delete the website using the delete button.

