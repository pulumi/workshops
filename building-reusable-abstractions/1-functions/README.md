# Functions

The first tool in our arsenal is the almighty function. Almost every programming language has a concept of functions (or subroutines, procedures, predicates, etc) and they're essential to providing a solid foundation for building reusable abstractions.

Whether we're talking [DRY (Don't Repeat Yourself)](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself), [SOLID](https://en.wikipedia.org/wiki/SOLID), or just good programming practices, functions are the foundation of providing composable abstractions that allow us to restrict the scope of a unit (for testing, among many other things) and save us from repeating ourselves in our code.

In this exercise, we're going to build a function that will allow us to create a network on Civo Cloud.

## Exercises

Each of these exercises can be completed for any language. If you need hints or the solutions, check in the README.md for each language.

### 1. Up Up Up!

Let's ensure all our prerequisites are available and run `pulumi up` to execute the initial program.

If you're missing your Pulumi token, ensure you:

1. `pulumi login`

If you have opted not to use Pulumi SaaS, you can use `pulumi login --local`

If you're missing your Civo token, ensure you:

1. [Get your token here](https://www.civo.com/account/security)
2. `pulumi config set --secret civo:token`

### 1. Provide a function for creating networks

There's no real value to this initial "refactoring", but we're going to do it anyway.

### 2. Use your function to create a network

You should be able to "refactor" this to a function and see no changes when running `pulumi up`.

### 3. Use your function to create 3 networks

You should be able to call your function more than once, 3 is arbitrary, and you shouldn't get a naming conflict. If you did, make sure you've not got any hard coded values inside your function.

### 4. Adapt your function to receive a list of firewall ports to open and ensure that the firewall is created

We're going to allow the consumers of our new function provide a list of ports that this network should allow traffic on. The input to this function might appear a little gnarly at first, but we'll explore optimizations for this in the next section.

Here's an example JSON payload that describes what we're after, without getting language specific:

```json
{
  "name": "my-network",
  "firewall": {
    "ports": [
      {
        "label": "my-port",
        "action": "allow",
        "protocol": "tcp",
        "startPort": 80,
        "endPort": 80,
        "cidr": "0.0.0.0/0"
      }
    ]
  }
}
```
