# Exercise 1: 
Create a reusable "storage infra" component resource that encapsulates the logic for creating the following resources:
* Storage Account
* Storage Account Key
* Storage Container

The component resource should take the following input parameters:
* resource group name

The component resource should have the following output properties:
* storage account name
* storage container name  
* storage key

Note: An empty "storage-infra" component resource shell is provided as an outline.

Related Docs:
- Component Resources Doc: https://www.pulumi.com/docs/intro/concepts/resources/#components
- Example Code: https://github.com/pulumi/examples/blob/master/azure-py-virtual-data-center/spoke.py

# Exercise 2: 
Add the "protect" resource option to the "storage infra" resource and do a `pulumi up` and then a `pulumi destroy`  
Note how the component resource children get the protect option enabled.  

Note how you can't destroy the stack as long as protect is true.  
To get around this you can set `protect: true` and do another `pulumi up` and then `pulumi destroy`.
Or, you can do `pulumi state unprotect --all` and then `pulumi destroy`.

Related Docs:
- Protect: https://www.pulumi.com/docs/intro/concepts/resources/#protect
- Unprotect: https://www.pulumi.com/docs/reference/cli/pulumi_state_unprotect/