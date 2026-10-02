import pulumi
from pulumi_aws import rds

config = pulumi.Config()
base_name = config.get("base_name", f"{pulumi.get_organization()}-{pulumi.get_stack()}".lower())
db_username = config.get("db_username", "dbadmin")

db = rds.Instance(f"{base_name}-rds", 
  instance_class="db.t3.micro",
  allocated_storage=20,
  engine="mariadb",
  engine_version="10.6",
  password=db_password,
  username=db_username,
  skip_final_snapshot=True
)

pulumi.export("db_admin", db_username)
