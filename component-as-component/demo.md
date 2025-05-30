# Designing Reusable Infrastructure as Code

This workshop guides you through creating and consuming a Source-based Pulumi Component
You'll learn how to:
- Create a Source-based Pulumi Component in TypeScript
- Reference and use the component in Pulumi YAML
- Bonus: Learn how to reuse TF modules in Pulumi Programs

**Estimated time**: 30 minutes

## Prerequisites

Before starting this workshop, ensure you have:

- Pulumi CLI installed
- [Node.js](https://nodejs.org/) 20+ installed

## Create a Pulumi Component

### Create a New Pulumi Project

First, let's create a new Pulumi project using the TypeScript template:

```bash
mkdir 01-create && cd 01-create
mkdir ts-component && cd ts-component
pulumi new --force typescript
# Enter project details when prompted
# Name: ts-component
# Description: Designing Reusable Infrastructure as Code
# Stack: dev
# Choose your package manager

# Update dependencies
# (npm install -g ncu)
ncu -u

# Install Pulumi and npm packages to be safe
pulumi install
```

Add the `random` package so we have something simple and interesting to work with:

```bash
npm install @pulumi/random
```

### Create a Component Resource

We are going to be creating a reusable component that generates a random password
Separate concerns by having it in its own file

Create a `randomComponent.ts` file in your `01-create` directory

Start by declaring the imports we'll use:

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as random from "@pulumi/random";
```

We need the actual component resource to work with, create that:

```typescript
export class RandomComponent extends pulumi.ComponentResource {
}
```

Next up, we need an entry point for the component. Stub out a constructor:

```typescript
// add this inside the class
constructor(name: string, args: any, opts?: pulumi.ComponentResourceOptions) {
    super("create-component:index:RandomComponent", name, args, opts);
}
```

We'll follow `package:module:type` for the component type.

We want the component to do something - let's generate a password inside the constructor:

```typescript
// add this inside the constructor
const password = new random.RandomPassword(`${name}-password`, {
    length: 16,
}, { parent: this });
```

Now we're generating a 16 character random password... but not doing anything with it.

Add the generated password as a Pulumi output:

```typescript
// add this after the class definition (export class) line
public readonly password: pulumi.Output<string>;

// add this at the end of your constructor
this.password = password.result;
```

Let's parameterize this a bit so it's more flexible and reusable.

Add an argument interface (outside of the class) that takes a length:

```typescript
export interface RandomComponentArgs {
    length?: pulumi.Input<number>;
}
```

And make use of it in the class itself:

```typescript
// Change the constructor signature's args type to RandomComponentArgs
constructor(name: string, args: RandomComponentArgs, opts?: pulumi.ComponentResourceOptions) {

// Pass the length arg to RandomPassword with a fallback value
const password = new random.RandomPassword(`${name}-password`, {
    // change this line:
    length: args.length || 16,
}, { parent: this });
```

Time to test! Make sure the component works by having Pulumi create the resource.

In `index.ts`:

```typescript
import { RandomComponent } from "./randomComponent";

var myPassword = new RandomComponent("myPassword", { length: 24 })

export const password = myPassword.password;
```

All that is left to do is create and verify the output:

* `pulumi up`
* `pulumi stack output --show-secrets` (as password is a secret)

```
Current stack outputs (1):
    OUTPUT    VALUE
    password  MBK@1&U&B-uOvH8tH(TEKqZM
```

Looks good! Let's clean up before moving on:

* `pulumi destroy`
* `pulumi stack rm dev`

## Consume a Component Resource from YAML

### Set up the Component Resource to consume

We have a working component resource from our first step.

Let's quickly convert that into a sharable resource by exporting:

```typescript
// Replace the entire contents of index.ts with:
export { RandomComponent, RandomComponentArgs } from "./randomComponent";
```

We need to tell Pulumi this directory contains exportable resources.

Create a `PulumiPlugin.yaml` file in the same directory:

```yaml
runtime: nodejs
```

* Delete `Pulumi.yaml` as it's no longer needed
* Run `npm install` to ensure we have all dependencies for the next step

### Create a YAML Pulumi Program to reuse the TS Component

Create a Pulumi YAML program.

Assuming we are still in the `ts-component` directory:

```bash
cd ..
mkdir yaml-consume && cd yaml-consume
pulumi new --force yaml
# Enter project details when prompted
# Name: yaml-consume
# Description: Designing Reusable Infrastructure as Code
# Stack: dev
```

Note this assumes you named your component `ts-component`; if you chose a different name remember to use that going forward.

Add the component we created as a package:

```bash
pulumi package add ../ts-component
```

Open up the `Pulumi.yaml` file that was created. Replace the `resources` key's value. Create a RandomComponent with a smaller length than default:

```yaml
resources:
  myrandom:
    type: ts-component:RandomComponent
    properties:
      length: 6
```

Replace the `outputs` key's value. We want the password value to be available as a stack output:

```yaml
outputs:
  password: ${myrandom.password}
```

Time to test!

* `pulumi up`
* `pulumi stack output --show-secrets` (as password is a secret)

```
Current stack outputs (1):
    OUTPUT    VALUE
    password  d(LIF!
```

That was easy! Let's clean up before moving on:

* `pulumi destroy`
* `pulumi stack rm dev`

## Bonus: Learn how to reuse TF modules in Pulumi Programs

### Use any module in your Pulumi Program

Create a new Pulumi TypeScript program:

```bash
mkdir 03-modules && cd 03-modules
pulumi new --force aws-typescript
# Enter project details when prompted
# Name: 03-modules
# Description: Designing Reusable Infrastructure as Code
# Stack: dev
# Choose your package manager
# Choose your AWS region

# OPTIONAL: remove @pulumi/awsx from package.json as we won't be using it

# Update dependencies
# (npm install -g ncu)
ncu -u

# Install Pulumi and npm packages to be safe
pulumi install
```

We are going to create an S3 bucket via using the TF AWS S3 module directly. Install it now:

```bash
pulumi package add terraform-module terraform-aws-modules/s3-bucket/aws 4.6.0 bucketmod
```

After downloading, you will receive the following message:

```
Downloading provider: terraform-module
Successfully generated a Nodejs SDK for the bucketmod package

...

You can then import the SDK in your TypeScript code with:

  import * as bucketmod from "@pulumi/bucketmod";
```

Let's start writing some code. Replace the contents of `index.ts` with the following:

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as bucketmod from '@pulumi/bucketmod';

const cfg = new pulumi.Config();
const prefix = cfg.get("prefix") ?? pulumi.getStack();

const myBucket = new bucketmod.Module('test-bucket', {
  bucket_prefix: `test-bucket-${prefix}`,
  force_destroy: true
});

export const bucketName = myBucket.s3_bucket_id;
```

* Log into AWS however you'd like - or use ESC (see [aws-esc-oidc](../aws-esc-oidc/README.md) for easy setup!)
* `pulumi up`

Verify you see the bucket name output:

```
Outputs:
    bucketName: "test-bucket-dev##########################"
```

Looks good. One more exercise: Importing a local module.

### Consume a local module in your Pulumi Program

This workshop has provided a simple TF module for you to reuse.

Let's copy and install it for our program:

```bash
cp -R ../tf-mod-random .

# note this may not work due to https://github.com/pulumi/pulumi-terraform-module/issues/308
pulumi package add terraform-module ./tf-mod-random modrandom

# temp workaround (don't move your project directory as this creates an absolute file reference)
pulumi package add terraform-module "$PWD/tf-mod-random" modrandom
```

You will now have access to the module in your Pulumi program. Let's add it to `index.ts`:

```typescript
// add this import
import * as modrandom from "@pulumi/modrandom";

// add this new Module resource at the end
const myPet = new modrandom.Module('test-random', {
    keeper_key: "test-random",
});
export const petName = myPet.pet;
```

* `pulumi up`

You will now see your new randomized pet name in the outputs:

```bash
Outputs:
    bucketName: "test-bucket-dev##########################""
  + petName   : "grateful-thrush"
```

Clean up and congratulations on making it to the end!

* `pulumi destroy`
* `pulumi stack rm dev`

----------

Bonus module number example:

```typescript
const myRandom = new modrandom.Module('test-random', {
    maxlen: 7,
    randseed: "1337"
});

export const myRnd_p = myRandom.random_priority;
export const myRnd_s = myRandom.random_seed;
```