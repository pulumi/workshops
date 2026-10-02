# Notes
- Stack references impose some book keeping and orchestration:
  - You need to provide enough information to the dependent (i.e. app) stack to find the base-infra stack.
  - You need to run `pulumi up` across the two stacks in order.
- You can `pulumi up` the base-infra dev stack immediately.
  - As you work on the exercise, you will need to do subsequent `pulumi up`s to realize the code changes needed.
- If you `pulumi up` the app dev stack in its current state, it will fail until the exercise is completed.

# Exercise 1
Set up a stack reference to allow the "app" project stacks to get the information they need from the corresponding
"base-infra" project stacks.  
- The two stacks will use the same base stack name (i.e. dev).
- Since the name of the "base-infra" project is the same regardless of stack, you can use Project Level config to pass the name of the "base-infra" project to the "app" stacks.

Hints:
- The "base-infra" project needs to export values that the "app" project needs.
- The "app" project needs to instantiate a stack reference to the "base-infra" stack and then consume the stack outputs.

Related Docs:
- Stack References: https://www.pulumi.com/docs/intro/concepts/stack/#stackreferences
- Project Level Config: https://www.pulumi.com/docs/intro/concepts/config/#project-level-configuration


