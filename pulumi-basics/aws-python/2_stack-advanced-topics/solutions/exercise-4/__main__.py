import pulumi
from pulumi_aws import rds

## Exercise 4 ##
import config

base_name = config.base_name
db_username = config.db_username
db_password = config.db_password
## Exercise 4 ##


db = rds.Instance(f"{base_name}-rds", 
  instance_class="db.t3.micro",
  allocated_storage=20,
  engine="mariadb",
  engine_version="10.6",
  password=db_password,
  username=db_username,
  skip_final_snapshot=True
)

## Exercise 1 ##
pulumi.export("db_password", db_password)
## Exercise 1 ##

## Exercise 2 ##
pulumi.export("db_admin", pulumi.Output.secret(db_username))
## Exercise 2 ##

## Exercise 3 ##
db_endpoint_wrong = f"DB connection endpoint-> ${db.endpoint}"
pulumi.export("db_endpoint_wrong", db_endpoint_wrong)
db_endpoint_using_concat = pulumi.Output.concat("DB connection endpoint-> ", db.endpoint)
pulumi.export("db_endpoint_using_concat", db_endpoint_using_concat)
db_endpoint_using_format = pulumi.Output.format("DB connection endpoint-> {0}", db.endpoint)
pulumi.export("db_endpoint_using_format", db_endpoint_using_format)
db_endpoint_using_apply = db.endpoint.apply(lambda endpoint : f"DB connection endpoint-> {endpoint}")
pulumi.export("db_endpoint_using_apply", db_endpoint_using_apply)
## Exercise 3 ##
