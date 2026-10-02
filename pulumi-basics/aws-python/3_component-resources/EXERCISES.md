# Exercise 1: 
Create a reusable "webserver" component resource that encapsulates the logic for creating the following resources:
* Security Group
* Webserver EC2 Instance

The component resource should take the following input parameters:
* VPC ID
* Subnet ID
* T-Shirt size (small, medium, large) - which should be translated to an instance size
* Webpage message to display 

The component resource should have the following output properties:
* Web server IP address

Note: An empty "webserver-component" component resource shell is provided as an outline.

Related Docs:
- Component Resources Doc: https://www.pulumi.com/docs/intro/concepts/resources/#components
- Example Code: https://github.com/pulumi/examples/blob/master/azure-py-virtual-data-center/spoke.py

# Exercise 1b:
Use the `aliases` resource option in the component resource to avoid recreating the resources in the component.

Related Docs:
- Blog about using Aliases: https://www.pulumi.com/blog/cumundi-guest-post/ 
- Aliases Resource Option: https://www.pulumi.com/docs/intro/concepts/resources/options/aliases/ 
- Resource Options in General: https://www.pulumi.com/docs/intro/concepts/resources/options/ 

# Exercise 2: 
Add the "protect" resource option to the "Webserver" resource and do a `pulumi up` and then a `pulumi destroy`  
Note how the component resource children get the protect option enabled.  

Note how you can't destroy the stack as long as protect is true.  
To get around this you can set `protect: true` and do another `pulumi up` and then `pulumi destroy`.
Or, you can do `pulumi state unprotect --all` and then `pulumi destroy`.

Related Docs:
- Protect: https://www.pulumi.com/docs/intro/concepts/resources/#protect
- Unprotect: https://www.pulumi.com/docs/reference/cli/pulumi_state_unprotect/