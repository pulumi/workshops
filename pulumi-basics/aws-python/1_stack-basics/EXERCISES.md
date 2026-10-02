# Exercise 1: 
Export the bucket name as a stack output.  

Related Docs: 
- https://www.pulumi.com/docs/intro/concepts/stack/#outputs

# Exercise 1 bis:
Add a README output

# Exercise 2: 
Use stack configuration to set the bucket name instead of using the hard-coded, string 'my-bucket'. 
Hint: Require a configuration parameter named "baseName" that you can then use as a basis for resource names.  

Related Docs:
- https://www.pulumi.com/docs/intro/concepts/config/#code

# (Optional) Exercise 3: 
Use explicit naming for the bucket instead of autonaming.  
Note: This does mean you have to prevent resource naming conflicts.  
Hint: Resources have a "name" property that allows you to override autonaming.  

Related Docs:
- https://www.pulumi.com/docs/reference/pkg/azure-native/resources/resourcegroup/