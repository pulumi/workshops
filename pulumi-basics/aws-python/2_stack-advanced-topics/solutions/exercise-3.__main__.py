import pulumi
from pulumi_aws import rds

config = pulumi.Config()
base_name = config.get("base_name", f"{pulumi.get_organization()}-{pulumi.get_stack()}".lower())
db_username = config.get("db_username", "dbadmin")
## Exercise 1 ##
db_password = config.require_secret("db_password")
pulumi.export("db_password", db_password)
## Exercise 1 ##

db = rds.Instance(f"{base_name}-rds", 
  instance_class="db.t3.micro",
  allocated_storage=20,
  engine="mariadb",
  engine_version="10.6",
  password=db_password,
  username=db_username,
  skip_final_snapshot=True
)

## Exercise 2 ##
pulumi.export("db_admin", pulumi.Output.secret(db_username))
## Exercise 2 ##

## Exercise 3 ##
db_endpoint_wrong = f"DB connection endpoint-> ${db.endpoint}"
pulumi.export("db_endpoint_wrong", db_endpoint_wrong)
db_endpoint_using_concat = pulumi.Output.concat("mysql://", db.endpoint)
pulumi.export("db_endpoint_using_concat", db_endpoint_using_concat)
db_endpoint_using_format = pulumi.Output.format("mysql://{0}", db.endpoint)
pulumi.export("db_endpoint_using_format", db_endpoint_using_format)
db_endpoint_using_apply = db.endpoint.apply(lambda endpoint : f"DB connection endpoint-> {endpoint}")
pulumi.export("db_endpoint_using_apply", db_endpoint_using_apply)
## Exercise 3 ##
