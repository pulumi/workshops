# Exercise 1: 
Create and use a configuration secret for the linux admin user name, and create a stack output with the value.   
NOTE: The code as written now will fail since there is a reference to an admin user name variable that is not set.   
The goal of this exercise is to address that by storing the user name in the stack config as a secret and then getting the value in the code.   
And, when exported as a stack output, you will see that Pulumi will keep it as a secret.  
Furthermore, secrets are not displayed in logs or in the Pulumi Console (SaaS).  
VALIDATION: Look at the stack config file and see that the password is stored as encrypted data.  

Related Docs:
- Config Doc: https://www.pulumi.com/docs/intro/concepts/config/ 
- Secrets Doc: https://www.pulumi.com/docs/intro/concepts/secrets

# Exercise 2: 
Programmatically set the kubeconfig obtained from the K8s cluster as a secret in the code and make it a stack output.  

Related Docs:
- Programmatic Secrets Doc: https://www.pulumi.com/docs/intro/concepts/secrets/#programmatically-creating-secret
## Exercise 2a: 
See the secret output's value. 

Related Docs:
- Stack Outputs Doc: https://www.pulumi.com/docs/intro/concepts/stack/#outputs
- Seeing Stack Secret Outputs Doc: https://www.pulumi.com/docs/reference/cli/pulumi_stack/

# Exercise 3: 
Create a URL with the "apache_service_ip" and make it an output.  
Bonus: Solve this in two ways.  
Hint: The value of "apache_service_ip" is not known until after deployment. So it's an "Output<T>" type.  

Related Docs:
- Inputs and Outputs Doc: https://www.pulumi.com/docs/intro/concepts/inputs-outputs/

# Exercise 4: 
Make the code more modular and readable by moving config and related set up to it's own file and move the cluster decalration and related bits to it's own file.  
Hint: This is simply using python constructs whereby code blocks can be put in separate files, be imported into the main program and referenced accordingly.  