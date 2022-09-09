# Creating a New Project

Infrastructure in Pulumi is organized into projects. Each project is a single program that, when run, declares the desired infrastructure for Pulumi to manage.

## Step 1 &mdash; Create a Directory

Each Pulumi project lives in its own directory. Create one now and change into it:

```bash
mkdir my-first-gcp-app
cd my-first-gcp-app
```

Pulumi will use the directory name as your project name by default.

## Step 2 &mdash; Initialize Your Project

A Pulumi project is just a directory with some files in it. It's possible for you to create a new one by hand. The `pulumi new` command automates the process:

```bash
pulumi new python -y
```

This command has created all the files we need, initialized a new stack named `dev` (an instance of our project), and installed the needed package dependencies from PyPI.

## Step 3 &mdash; Inspect Your New Project

Our project is comprised of multiple files:

* **`__main__.py`**: your program's main entry point
* **`requirements.txt`**: your project's NPM dependency information
* **`Pulumi.yaml`**: your project's metadata, containing its name and language

Run the command `cat __main__.py` to see the contents of your project's empty program:

```python
"""A Python Pulumi program"""

import pulumi
```

Feel free to explore the other files, although we won't be editing any of them by hand, except `requirements.txt`.

## Step 4 &mdash; Install the GCP provider

In order to interact with GCP, we need to install the GCP provider. We can do this using `pip`. Add the following line to the bottom of your `requirements.txt`:

```text
pulumi_gcp>=6.0.0,<7.0.0
```

Install your dependencies using pip:

```bash
pip install -r requirements.txt
```

> If you'd like to do all of this from the command line in a single command, run the following:
>
> ```bash
> echo "pulumi_gcp>=6.0.0,<7.0.0" >> requirements.txt && pip install -r requirements.txt`
> ```

This installs the Pulumi GCP Classic SDK and the GCP Classic provider plugin.

## Step 5 &mdash; Configure your project

We want all our resources to provision in a specific project. We'll set this globally in our Pulumi program. Run the following command in your terminal, replacing `your-project-name` with the project name given by GCP:

```bash
pulumi config set gcp:project your-project-name
```

## Next Steps

* [Create a static website](../lab-02/README.md)
