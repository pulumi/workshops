# Exercise 1: `dependsOn`

Combine the bucket & RDS instance example. Let the bucket depend on the RDS instance.

# Exercise 2: `protect`

Add the "protect" resource option to the "RDS instance" resource and do a `pulumi up` 
and then a `pulumi destroy`  

See how Pulumi will prevent deleting the RDS instance

# Exercise 3: `alias`

Rename the bucket resource and alias the old name.

# Exercise 4: `delete_before_replace`

Security group (with auto-naming) & security group rule


# Exercise 5: `retain_on_delete`

Set this on the bucket and run `pulumi up`. Write down the actual bucket id!
Run `pulumi destroy`, see the state being emptied but the bucket still exist.

Delete the bucket manually!