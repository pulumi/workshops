# Creating a New Project

Infrastructure in Pulumi is organized into projects. Each project is a single program that, when run, declares the desired infrastructure for Pulumi to manage.

## Step 1 &mdash; Create a Directory

Each Pulumi project lives in its own directory. Create one now and change into it:

```bash
mkdir iac-workshop
cd iac-workshop
```

> Pulumi will use the directory name as your project name by default. To create an independent project, simply name the directory differently.

## Step 2 &mdash; Initialize Your Project

A Pulumi project is just a directory with some files in it. It's possible for you to create a new one by hand. The `pulumi new` command, however, automates the process:

```bash
pulumi new python -y
```

This will print output similar to the following with a bit more information and status as it goes:

```
Created project 'iac-workshop'
Created stack 'dev'

Your new project is ready to go! ✨

To perform an initial deployment, run the following commands:

   1. python3 -m venv venv
   2. source venv/bin/activate
   3. pip3 install -r requirements.txt

Then, run 'pulumi up'
```

This command has created all the files we need, initialized a new stack named `dev` (an instance of our project). We now need
to install our dependencies as part of our virtualenv

## Step 3 &mdash; Setup Virtual Environment

We now need to create our virtual environment as suggested in the output of `pulumi new` in step 2 by following the commands:

```bash
$ python3 -m venv venv
```

```bash
$ source venv/bin/activate
```

```bash
pip3 install -r requirements.txt
```

## Step 4 &mdash; Inspect Your New Project

Our project is comprised of multiple files:

* **`__main__.py`**: your program's main entrypoint file
* **`requirements.txt`**: your project's pip dependency information
* **`Pulumi.yaml`**: your project's metadata, containing its name and language

Run `cat __main__.py` to see the contents of your project's empty program:

```python
import pulumi
```

Feel free to explore the other files, although we won't be editing any of them by hand.

# Next Steps

* [Configuring AWS](./02-configuring-aws.md)
