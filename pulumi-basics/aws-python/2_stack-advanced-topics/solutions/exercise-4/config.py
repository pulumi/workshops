import pulumi

config = pulumi.Config()
base_name = config.get("base_name") or f"{pulumi.get_organization()}-{pulumi.get_stack()}".lower()
db_username = config.get("db_username") or "dbadmin"
db_password = config.require_secret("db_password")