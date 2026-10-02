# Exercise 1: 
Move the AKS Cluster Related Resources into the provided "cluster" component resource module shell.  
Hint: The block of resources to move is marked with "### AKS Cluster Related Resoures"  
It should take as input parameters: 
- the various config values used by the resources
- resource group name

It should provide the following output: 
- K8s kubeconfig

Related Docs:
- Component Resources Doc: https://www.pulumi.com/docs/intro/concepts/resources/#components
- Example Code: https://github.com/pulumi/examples/blob/master/azure-py-virtual-data-center/spoke.py

# Exercise 2: 
Add the "protect" resource option to the "cluster" resource and do a `pulumi up` and then a `pulumi destroy`  
Note how the component resource children get the protect option enabled.  
Note how you can't destroy the stack as long as protect is true.  

Related Docs:
- Protect: https://www.pulumi.com/docs/intro/concepts/resources/#protect
- Unprotect: https://www.pulumi.com/docs/reference/cli/pulumi_state_unprotect/