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
pulumi new typescript -y
```

This will print output similar to the following with a bit more information and status as it goes:

```
Created project 'iac-workshop'
Created stack 'dev'
Saved config
Installing dependencies...
Finished installing dependencies

Your new project is ready to go!
```

This command has created all the files we need, initialized a new stack named `dev` (an instance of our project), and installed the needed package dependencies from NPM.

## Step 3 &mdash; Inspect Your New Project

Our project is comprised of multiple files:

* **`index.ts`**: your program's main entrypoint file
* **`package.json`** and **`package-lock.json`**: your project's NPM dependency information
* **`Pulumi.yaml`**: your project's metadata, containing its name and language
* **`tsconfig.json`**: your project's TypeScript settings
* **`node_modules/`**: a directory containing your project's installed NPM dependencies

Run `cat index.ts` to see the contents of your project's empty program:

```typescript
import * as pulumi from "@pulumi/pulumi";
```

Feel free to explore the other files, although we won't be editing any of them by hand.

# Next Steps

* [Configuring AWS](./02-configuring-aws.md)
