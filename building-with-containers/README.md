---
author: Laura
language: go
provider: azure-native
use: first-party
last-ran: 2 Nov 2022
boilerplate: none
last-host: Laura
learn-content: none
original-repo: none
status: active
---
# Building with Containers on Azure

Let’s explore more about building up a containerized microservices architecture on Azure using infrastructure as code and cloud engineering principles. We’ll use Go to build up our new architecture, and we’ll explore more about stacks, inputs and outputs, secrets, and more.

### Prerequisites

You will need the following tools:

* [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops)
* [Pulumi FREE SaaS Account](https://app.pulumi.com/signup/?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops)
  * Pulumi state storage is FREE for developers, you can use this account for all your personal Pulumi projects and you never need to worry about where to store your state 😃
* [Go 1.19.x](https://www.pulumi.com/docs/intro/languages/go/?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops)
* An [Azure account](https://www.pulumi.com/registry/packages/azure-native/installation-configuration/#credentials?utm_source=da&utm_medium=referral&utm_campaign=workshops&utm_content=ced-fall2022-workshops). The free tier should be all we need, but any costs accrued will be minimal if any appear at all.
* [Docker](https://docs.docker.com/get-docker/) set up on your machine to build the container.

### About this workshop

In this workshop, we will explore secrets, stacks, inputs and outputs, and more.

## Lab 1 - Setup

Let's set up our sandbox application using a [Pulumi template for containers on Azure with Go](https://www.pulumi.com/templates/container-service/azure/). First, make a new directory, and change into it.

```bash
mkdir build-with-containers && cd build-with-containers
```

Next, we'll create a new Pulumi project and define our program with the `pulumi new` command. Accept all of the defaults if they're sensible for your specific situation.

```bash
pulumi new container-azure-go
```

Take a moment to explore the generated project before we move forward. Run `pulumi up` before continuing.

## Lab 2 - Inputs and Outputs

### Concepts

Resources accept inputs as arguments, and resource properties when computed are outputs. Outputs aren't available until the resource instance has been created or fully provisioned. It may help to think of an Output like a promise, or a value that will be known in the future compared to the start of runtime or compilation. The use of Outputs enable us to have asynchronous provisioning with interdependent architecture.

### Outputs in our code

To understand the result of this concept, let's explore lines 96-98 of the code.

```go
		dnsName := dnsNameSuffix.Result.ApplyT(func(result string) string {
			return fmt.Sprintf("%s-%s", imageName, strings.ToLower(result))
		}).(pulumi.StringOutput)
```

This construction allows us to access the raw value of an output and transform it into a new value after the resource has been provisioned.

### A special case: Stack outputs

A related concept is a stack output. At the very end of our program on lines 149-151, we find some stack outputs:

```go
		ctx.Export("ip", containerGroup.IpAddress.Elem().Ip())
		ctx.Export("hostname", containerGroup.IpAddress.Elem().Fqdn())
		ctx.Export("url", pulumi.Sprintf("http://%s:%d", containerGroup.IpAddress.Elem().Fqdn(), containerPort))
```

We can use this output in other commands:

```bash
open $(pulumi stack output url)
```

<details>
<summary><b>Question:</b> Why are stack outputs useful?</summary>

<br/>
<b>Answer:</b> We can easily call these outputs in other commands as we did in the terminal, or even in other parts of our code.
</details>
<br/>

## Lab 3 - Stacks and Stack References

Speaking of stacks, what do we know about them?

### Adding a stack

First, let's modify our code to add the stack name to the various resource names.

_New lines 46-47 in ./main.go:_
```go
		// Add the stack details
		stack := ctx.Stack()
```

And then modify all of the various names like the following code from new line 50:

_New line 50 in ./main.go:_
```go
		resourceGroup, err := resources.NewResourceGroup(ctx, fmt.Sprintf("resource-group-%v-", stack), nil)
```

Note that the registry name can't have dashes, so use a `0` instead for now if you want a human-readable name that doesn't run together.

Let's also modify our app to have the return show which stack we're in.

_New line 19 in ./app/main.go:_
```go
			Message: fmt.Sprintf("Hello, world, from the %s stack!", os.Getenv("STACK")),
```

and

_New lines 130-133 in ./main.go:_
```go
						containerinstance.EnvironmentVariableArgs{
							Name:  pulumi.String("STACK"),
							Value: pulumi.Sprintf("%s", stack),
						},
```

_(If you need to copy this, head to the `answers/` directory!)_

Create a stack:

```bash
pulumi stack init staging
```

By initializing the stack, you should automatically switch to it, but just to be sure, run this command:

```bash
pulumi stack select staging
```

We can specify different configuration for each stack. Explore the config for `staging`:

```bash
pulumi config
```

Update the stack config to match the config from `dev`:

```bash
pulumi stack select dev
pulumi config cp -d staging
pulumi stack select staging
pulumi config
```

Now if you run `pulumi preview --diff`, you'll find all of the resource names use the stack name!

If you were to switch back to `dev` and run `pulumi up` to update the stack, you'll find the stack appears in the output, just as we modified the source code to do.

<details>
<summary><b>Question:</b> Why are stacks useful?</summary>

<br/>
<b>Answer:</b> If you're wanting to stand up separate environments or even ephemeral environments, this kind of adjustment avoids collisions and still makes the environment resources easily identifiable in a sea of hundreds of resources.
</details>
</br>

### Accessing stack references

What if we wanted to call a stack output from another stack, say call something from dev in staging or even from a related project's stack? We use stack references!

Let's call the URL of the dev stack in the staging stack. Add the following code just before the exports, replacing the `<org>` placeholder with your username:

_New lines 155-159 in ./main.go:_
```go
		devStackUrl, err := pulumi.NewStackReference(ctx, "<org>/build-with-containers/dev", nil)
		if err != nil {
			return err
		}
		devStackUrlOutput := devStackUrl.GetOutput(pulumi.String("url"))
```

And add this export, just for fun:

_New line 165 in ./main.go:_
```go
		ctx.Export("devUrl", devStackUrlOutput)
```

You should have stood up your dev stack at the beginning with lab 1. Let's see what happens now when you call it here on staging:

```bash
$ pulumi preview --diff
View Live: 
...
    > pulumi:pulumi:StackReference: (read)
        [urn=urn:pulumi:staging::build-with-containers::pulumi:pulumi:StackReference::<org>/build-with-containers/dev]
        name: "<org>/build-with-containers/dev"
...
    --outputs:--
    devUrl  : "<actual URL from the dev stack>"
    hostname: output<string>
    ip      : output<string>
    url     : output<string>
Resources:
    + 6 to create
```

Note that we **have** to export the value with a key from the original stack to get a callable reference in another stack. The stack reference is basically a map of all of the exports from any given stack.

Let's stand up `staging`, just to check it out.

```bash
pulumi stack select staging
pulumi up
```

Run the following two commands from `staging` and compare the differences:

```bash
$ curl $(pulumi stack output url)
{"message":"Hello, world, from the staging stack!"}
```

```bash
$ curl $(pulumi stack output devUrl)
{"message":"Hello, world, from the dev stack!"}
```

Pretty cool!

<details>
<summary><b>Question:</b> Why are stack references useful?</summary>

<br/>
<b>Answer:</b> If you have, let's say, your database running in another project, you might want to reference your staging database for your staging app stack and your dev database for your dev stack and your prod database for your prod stack... Let's just say there are so many ways to find stack references useful!
</details>
</br>

## Lab 4 - Secrets

The Pulumi Service backend (the SaaS or managed backend) encrypts your state file at rest and handles all remote communication over TLS. However, for real secrets like API keys or service tokens, you want more than that. Pulumi allows you to have individual secrets encrypted, no matter the backend chosen, and keeps those values encrypted and secure in transit and at rest, even in your state file. Let's explore what that experience is like!

Let's add a secret configuration to our dev stack:

```bash
pulumi stack select dev
pulumi config set --secret fakeSecret cloudEngineering
```

<details>
<summary><b>Action:</b> How can we try to get this to dump to our terminal? Now that you know how to work with outputs, try getting it to appear! (Hints to try are in the <code>answers/</code> directory.)</summary>

<br/>
<b>Result:</b> You'll find that <code>pulumi config</code> only shows <code>[secret]</code> for the <code>fakeSecret</code> key, and the same thing appears in the stack file. Exporting it doesn't work either... at least, not exactly. Try running the <code>pulumi stack output fakeSecret --show-secrets</code> (note the flag at the end) after adding an export call, like this:
<pre><code>		ctx.Export("fakeSecret", cfg.GetSecret("fakeSecret"))
</code></pre>
Note that you will have to run a <code>pulumi up</code> on the dev stack first before the output is callable!
</details>
<br/>

## Lab 5 - Cleanup

It's always a good idea to tear down any sandbox infrastructure at the end of your experiments or any workshop. Run the following command to remove all of the infrastructure we generated so you don't get charged:

```bash
pulumi stack select dev
pulumi destroy -y
pulumi stack select staging
pulumi destroy -y
```

If you want to remove all traces of the stacks themselves so it's like you never tried this workshop (and that includes all of the configuration data and secrets we made!), run the following commands after running `pulumi destroy`:

```bash
pulumi stack rm dev
```

and

```bash
pulumi stack rm staging
```

and follow the prompts.