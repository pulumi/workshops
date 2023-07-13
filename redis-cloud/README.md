# redis-cloud

This folder contains the code for a workshop delivered on 2023-07-13 with Redis Cloud. The program creates a Redis Cloud subscription and database peered to an AWS VPC along with the necessary routes to allow communication from the VPC to Redis Cloud. The VPC also contains an EC2 instance with SSM Systems Manager connectivity to demonstrate connectivity to the Redis Cloud instance.

When presenting this workshop, we start with the Redis resources already provisioned (because they take about 15 minutes to spin up), then create the AWS resources live.
