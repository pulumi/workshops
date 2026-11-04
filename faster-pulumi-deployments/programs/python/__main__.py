import pulumi
import pulumi_random

environment = pulumi.Config().require("environment")
pet = pulumi_random.RandomPet("name", prefix=environment, length=2)
pulumi.export("environment", environment)
pulumi.export("name", pet.id)
