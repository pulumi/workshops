import pulumi
import pulumi_awsx as awsx
from webserver_component import Webserver, WebserverArgs

config = pulumi.Config()
base_name = config.get("base_name") or f"{pulumi.get_organization()}-{pulumi.get_stack()}".lower()

vpc = awsx.ec2.Vpc(base_name)

server = Webserver(base_name, WebserverArgs(
    vpc_id=vpc.vpc_id,
    subnet_id=vpc.public_subnet_ids[0],
    size="small",
    message="Hello Component Resource"
)) 

pulumi.export('url', pulumi.Output.concat("http://",server.server_ip))
