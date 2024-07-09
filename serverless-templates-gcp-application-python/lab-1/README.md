# Lab 1: Projects, Programs, and More

Let's discuss projects, programs, and stacks in Pulumi.

## Create a directory

To get started, we need a new directory. Run these two commands in your terminal:

```bash
mkdir my-serverless-app && cd my-serverless-app
```

## Initialize your project

Let's make a new Pulumi project:

```bash
pulumi new gcp-python -y
```

<details>
<summary><b>Question:</b> What's the name of our new project?</summary>

<br/>
<b>Answer:</b> Pulumi takes the name from the directory, so the name of our new project is <code>my-first-app</code>. If you want to use a different name, use the <code>--name</code> flag or remove the <code>-y</code> flag so you can change the answer at the prompt.
</details>

## Add pulumi-synced-folder
The **pulumi-synced-folder** is a Pulumi component that synchronizes a local folder to Google Cloud Storage. More information is available at [pulumi-synced-folder](https://github.com/pulumi/pulumi-synced-folder?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops)


Add the following to the bottom of the `requirements.txt`
```python
pulumi-synced-folder
```
## Setup Virtual Environment

To create our virtual environment run the following the commands:

```bash
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
```

## Inspect Your New Project

Our project is comprised of multiple files:

* **`__main__.py`**: your program's main entry point file
* **`requirements.txt`**: your project's pip dependency information
* **`Pulumi.yaml`**: your project's metadata, containing its name and language
* **`Pulumi.dev.yaml`**: contains configuration values for the stack you just initialized.


Next up, we setup the configuration and application in [lab 2](../lab-2/).