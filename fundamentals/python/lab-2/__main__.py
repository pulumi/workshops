import os
import pulumi
import pulumi_docker as docker

# get configuration
config = pulumi.Config()
frontend_port = config.require_int("frontend_port")
backend_port = config.require_int("backend_port")
mongo_port = config.require_int("mongo_port")

stack = pulumi.get_stack()

# build our backend image!
backend_image_name = "backend"
backend = docker.RemoteImage("backend",
                             name="pulumi/tutorial-pulumi-fundamentals-backend:latest"
                            )

# build our frontend image!
frontend_image_name = "frontend"
frontend = docker.RemoteImage("frontend",
                              name="pulumi/tutorial-pulumi-fundamentals-frontend:latest"
                             )

# build our mongodb image!
mongo_image = docker.RemoteImage("mongo",
                                 name="pulumi/tutorial-pulumi-fundamentals-database-local:latest"
                                )