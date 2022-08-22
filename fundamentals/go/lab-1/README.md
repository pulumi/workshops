# Lab 1: Projects, Programs, and More

Let's discuss projects, programs, and stacks in Pulumi.

## Create a directory

To get started, we need a new directory. Run these two commands in your terminal:

```bash
mkdir my-first-app && cd my-first-app
```

## Initialize your project

Let's make a new Pulumi project:

```bash
pulumi new go -y
```

<details>
<summary><b>Question:</b> What's the name of our new project?</summary>

<br/>
<b>Answer:</b> Pulumi takes the name from the directory, so the name of our new project is <code>my-first-app</code>. If you want to use a different name, use the <code>--name</code> flag or remove the <code>-y</code> flag so you can change the answer at the prompt.
</details>

## Inspect your new project

Let's explore the files we generated!

Next up, [Lab 2](../lab-2/).