# Creating a New Project

Infrastructure in Pulumi is organized into projects. Each project is a single program that declares the desired infrastructure for Pulumi to manage.

---

<details>
<summary>✨ Presenter's full list of bash commands to run for this lab ✨</summary>

```bash
mkdir my-first-gcp-app
cd my-first-gcp-app
pulumi new python -y
source venv/bin/activate
echo "pulumi_gcp>=6.0.0,<7.0.0" >> requirements.txt
pip3 install -r requirements.txt
## This GCP Project is under the pulumi.com GCP account
## Ensure you have access to it prior using it.
pulumi config set gcp:project pulumi-workshops-project
```

</details>

---

## Step 1 &mdash; Create a Directory and Initialize Your Project

Each Pulumi project lives in its own directory. Create one now and change into it:

```bash
mkdir my-first-gcp-app
cd my-first-gcp-app
```

A Pulumi project is just a directory with some files in it. You can create a Pulumi project by hand, but the `pulumi new` command automates this process.

Run the following at the command line:

```bash
pulumi new python -y
```

This command creates all the files we need, initializes a new stack named `dev` (an instance of our project), initializes a Python virtual environment, and installs package dependencies from PyPI.

## Step 2 &mdash; Inspect Your New Project

Our project is comprised of multiple files:

* **`__main__.py`**: your program's main entry point
* **`requirements.txt`**: your project's pip dependency information
* **`Pulumi.yaml`**: your project's metadata, containing its name and language

Run the command `cat __main__.py` to see the contents of your project's empty program:

```python
"""A Python Pulumi program"""

import pulumi
```

Feel free to explore the other files, although we won't be editing any of them by hand, except `requirements.txt`.

## Step 3 &mdash; Install the GCP provider

Pulumi created a `virtualenv` for us when we created our `my-first-gcp-app` project. We’ll need to activate it to install dependencies:

```bash
source venv/bin/activate
```

In order to interact with GCP, we need to install the GCP provider. We can do this using `pi3`.

Add the following line to `requirements.txt`:

```text
pulumi_gcp>=6.0.0,<7.0.0
```

Run the following command to install the GCP provider:

```bash
pip3 install -r requirements.txt
```

## Step 4 &mdash; Configure your project

We want all our resources to be provisioned in a specific project. We'll set this globally in our Pulumi program. Run the following command in your terminal, replacing `your-project-name` with the project name given by GCP:

```bash
pulumi config set gcp:project your-project-name
```

Pulumi will create the file `Pulumi.dev.yaml` which contains the configuration for our dev stack.

## Next Steps

[Create a static website](../lab-02/README.md)
