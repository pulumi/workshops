# How to Develop Intelligent Q&A Chatbots with RAG, LangChain, and ChromaDB using Pulumi and AWS.

This repository contains the code for the blog post "How to Develop Intelligent Q&A Chatbots with RAG, LangChain, and
ChromaDB using Pulumi and AWS".

## Prerequisites

- If you don't have an AWS account, create one [here](https://aws.amazon.com/).
- Make sure your User has the necessary permissions to create the resources.
- Install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
- Install the [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/).

## Instructions

### Step 1: Authenticate with AWS

I use for the AWS CLI with SSO:

```bash
aws sso login
```

### Step 2 - Configure the Pulumi CLI

> If you run Pulumi for the first time, you will be asked to log in. Follow the instructions on the screen to
> login. You may need to create an account first, don't worry it is free.

To initialize a new Pulumi project, run `pulumi new` and select from all the available templates the `yaml`.

> **Note**: If you run this command in an existing directory, you may need to pass the `--force` flag to
> the `pulumi new` command.

You will be guided through a wizard to create a new Pulumi project. You can use the following values:

```shell
pulumi new yaml --force
This command will walk you through creating a new Pulumi project.

Enter a value or leave blank to accept the (default), and press <ENTER>.
Press ^C at any time to quit.

project name (langchain):
project description (A minimal Pulumi YAML program):
Created project 'langchain'

Please enter your desired stack name.
To create a stack in an organization, use the format <org-name>/<stack-name> (e.g. `acmecorp/dev`).
stack name (dev): dev
Created stack 'dev'

Your new project is ready to go! ✨

To perform an initial deployment, run `pulumi up`
```

### Step 3 - Configure the Pulumi stack

Set the Flowise and AWS RDS password as configuration in the Pulumi stack.

```bash
pulumi config set flowise-password --secret 
pulumi config set db-password --secret 
```

Or use Pulumi ESC. Create a new environment in the Pulumi Cloud:

```yaml
values:
  flowise: xxx
  db: yyyy
  pulumiConfig:
    db-password: ${db}
    flowise-password: ${flowise}
```

```yaml
environment:
- langchain-flowise-aws-chatbot
```

Additionally, you can set the AWS region:

```bash
pulumi config set aws:region eu-central-1
```

> **Note**: Doing this in the stack configuration will give you the flexibility to deploy the same infrastructure code
> for different environments, like dev, test, and production and have different regions for each environment.

### Step 4 - Define the infrastructure

Now we can start to define the pieces of infrastructure we need. We will create a VPC, a subnet, a security group, and
an RDS instance and much more.

Let's start by creating our Log Group:

```yaml
name: aws-yaml-langchain
runtime: yaml
description: A minimal Flowise / Langchain AWS YAML Pulumi program

resources:

  langchain-log-group:
    properties:
      retentionInDays: 7
    type: aws:cloudwatch:LogGroup
```

After this, we can create the VPC, the subnet, and the security group:

```yaml
name: aws-yaml-langchain
runtime: yaml
description: A minimal Flowise / Langchain AWS YAML Pulumi program

resources:

  # Omited the log group

  langchain-vpc:
    type: awsx:ec2:Vpc
    properties:
      numberOfAvailabilityZones: 2
      enableDnsSupport: true
      enableDnsHostnames: true

  langchain-sg:
    type: aws:ec2:SecurityGroup
    properties:
      vpcId: ${langchain-vpc.vpcId}
      ingress:
      - protocol: tcp
        fromPort: 5432
        toPort: 5432
        cidrBlocks: ["0.0.0.0/0"]
      egress:
      - protocol: "-1"
        fromPort: 0
        toPort: 0
        cidrBlocks: ["0.0.0.0/0"]
```

Now we can create the RDS instance:

```yaml
name: aws-yaml-langchain
runtime: yaml
description: A minimal Flowise / Langchain AWS YAML Pulumi program

resources:

  # Omited the log group, vpc, and security group

  langchain-subnet-group:
    type: aws:rds:SubnetGroup
    properties:
      subnetIds: ${langchain-vpc.publicSubnetIds}

  langchain-db-instance:
    type: aws:rds:Instance
    properties:
      engine: postgres
      engineVersion: "15.4"
      instanceClass: db.t3.micro
      allocatedStorage: 20
      dbName: flowise
      username: myuser
      password:
        fn::secret: ${db-password}
      skipFinalSnapshot: true
      publiclyAccessible: true
      dbSubnetGroupName: ${langchain-subnet-group.name}
      multiAz: false
      vpcSecurityGroupIds:
      - ${langchain-sg.id}
```

After creating our RDS instance, we can head over to our Parameter Store and create the necessary parameters for our
passwords:

```yaml
name: aws-yaml-langchain
runtime: yaml
description: A minimal Flowise / Langchain AWS YAML Pulumi program

resources:

  # Omited the log group, vpc, security group, and RDS instance

  langchain-key:
    properties:
      description: "Key for encrypting secrets"
      enableKeyRotation: true
      policy:
        fn::toJSON:
          Statement:
          - Action:
            - kms:Create*
            - kms:Describe*
            - kms:Enable*
            - kms:List*
            - kms:Put*
            - kms:Update*
            - kms:Revoke*
            - kms:Disable*
            - kms:Get*
            - kms:Delete*
            - kms:ScheduleKeyDeletion
            - kms:CancelKeyDeletion
            - kms:Tag*
            - kms:UntagResource
            Effect: Allow
            Principal:
              AWS: arn:aws:iam::${accountId}:root
            Resource: "*"
          - Action:
            - kms:Encrypt
            - kms:Decrypt
            - kms:ReEncrypt*
            - kms:GenerateDataKey*
            - kms:DescribeKey
            Effect: Allow
            Principal:
              AWS: arn:aws:iam::${accountId}:root
            Resource: "*"
          Version: '2012-10-17'
      tags:
        pulumi-application: ${pulumi-project}
        pulumi-environment: ${pulumi-stack}
    type: aws:kms:Key

  langchain-db-password-parameter:
    properties:
      keyId: ${langchain-key.keyId}
      name: /pulumi/${pulumi-project}/${pulumi-stack}/DATABASE_PASSWORD
      tags:
        pulumi-application: ${pulumi-project}
        pulumi-environment: ${pulumi-stack}
      type: SecureString
      value: ${db-password}
    type: aws:ssm:Parameter

  langchain-flowise-parameter:
    properties:
      keyId: ${langchain-key.keyId}
      name: /pulumi/${pulumi-project}/${pulumi-stack}/FLOWISE_PASSWORD
      tags:
        pulumi-application: ${pulumi-project}
        pulumi-environment: ${pulumi-stack}
      type: SecureString
      value: ${flowise-password}
    type: aws:ssm:Parameter

  langchain-chroma-token-parameter:
    properties:
      keyId: ${langchain-key.keyId}
      name: /pulumi/${pulumi-project}/${pulumi-stack}/CHROMA_SERVER_AUTH_CREDENTIALS
      tags:
        pulumi-application: ${pulumi-project}
        pulumi-environment: ${pulumi-stack}
      type: SecureString
      value: "test-token"
    type: aws:ssm:Parameter
```

Finally, we can create our Fargate instance:

```yaml
name: aws-yaml-langchain
runtime: yaml
description: A minimal Flowise / Langchain AWS YAML Pulumi program

resources:

  # Omited the log group, vpc, security group, RDS instance, and parameters

  langchain-cluster-capacity-providers:
    properties:
      capacityProviders:
      - FARGATE
      - FARGATE_SPOT
      clusterName: ${langchain-ecs-cluster.name}
    type: aws:ecs:ClusterCapacityProviders

  langchain-ecs-cluster:
    properties:
      configuration:
        executeCommandConfiguration:
          logging: DEFAULT
      settings:
      - name: containerInsights
        value: disabled
      tags:
        Name: ${pulumi-project}-${pulumi-stack}
    type: aws:ecs:Cluster

  langchain-ecs-security-group:
    properties:
      egress:
      - cidrBlocks:
        - 0.0.0.0/0
        fromPort: 0
        protocol: -1
        toPort: 0
      ingress:
      - cidrBlocks:
        - 0.0.0.0/0
        fromPort: 0
        protocol: -1
        toPort: 0
      vpcId: ${langchain-vpc.vpcId}
    type: aws:ec2:SecurityGroup

  langchain-execution-role:
    properties:
      assumeRolePolicy:
        fn::toJSON:
          Statement:
          - Action: sts:AssumeRole
            Effect: Allow
            Principal:
              Service: ecs-tasks.amazonaws.com
          Version: '2012-10-17'
      inlinePolicies:
      - name: ${pulumi-project}-${pulumi-stack}-service-secrets-policy
        policy:
          fn::toJSON:
            Statement:
            - Action:
              - rds:*
              Effect: Allow
              Resource:
              - "*"
            - Action:
              - ssm:GetParameters
              Condition:
                StringEquals:
                  ssm:ResourceTag/pulumi-application: ${pulumi-project}
                  ssm:ResourceTag/pulumi-environment: ${pulumi-stack}
              Effect: Allow
              Resource:
              - ${langchain-db-password-parameter.arn}
              - ${langchain-flowise-parameter.arn}
              - ${langchain-chroma-token-parameter.arn}
            - Action:
              - kms:Decrypt
              Condition:
                StringEquals:
                  aws:ResourceTag/pulumi-application: ${pulumi-project}
                  aws:ResourceTag/pulumi-environment: ${pulumi-stack}
              Effect: Allow
              Resource:
              - ${langchain-key.arn}
              Sid: DecryptTaggedKMSKey
            Version: '2012-10-17'
      managedPolicyArns:
      - arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
    type: aws:iam:Role

  langchain-target-group:
    properties:
      port: 80
      protocol: HTTP
      targetType: ip
      vpcId: ${langchain-vpc.vpcId}
    type: aws:lb:TargetGroup

  langchain-listener:
    properties:
      defaultActions:
      - targetGroupArn: ${langchain-target-group.arn}
        type: forward
      loadBalancerArn: ${langchain-load-balancer.arn}
      port: 80
      protocol: HTTP
    type: aws:lb:Listener

  langchain-security-group:
    properties:
      egress:
      - cidrBlocks:
        - 0.0.0.0/0
        fromPort: 0
        protocol: -1
        toPort: 0
      ingress:
      - cidrBlocks:
        - 0.0.0.0/0
        fromPort: 80
        protocol: tcp
        toPort: 80
      vpcId: ${langchain-vpc.vpcId}
    type: aws:ec2:SecurityGroup

  langchain-load-balancer:
    properties:
      loadBalancerType: application
      securityGroups:
      - ${langchain-security-group.id}
      subnets: ${langchain-vpc.publicSubnetIds}
    type: aws:lb:LoadBalancer

  langchain-service:
    properties:
      cluster: ${langchain-ecs-cluster.arn}
      desiredCount: 1
      launchType: FARGATE
      loadBalancers:
      - containerName: ${pulumi-project}-${pulumi-stack}-service
        containerPort: 3000
        targetGroupArn: ${langchain-target-group.arn}
      networkConfiguration:
        assignPublicIp: true
        securityGroups:
        - ${langchain-ecs-security-group.id}
        subnets: ${langchain-vpc.publicSubnetIds}
      schedulingStrategy: REPLICA
      serviceConnectConfiguration:
        enabled: true
        namespace: ${langchain-service-discovery-namespace.arn}
      tags:
        Name: ${pulumi-project}-${pulumi-stack}
      taskDefinition: ${langchain-task-definition.arn}
    type: aws:ecs:Service

  langchain-service-discovery-namespace:
    properties:
      name: ${pulumi-stack}.${pulumi-project}.local
      vpc: ${langchain-vpc.vpcId}
    type: aws:servicediscovery:PrivateDnsNamespace

  langchain-task-definition:
    properties:
      containerDefinitions:
        fn::toJSON:
        - essential: true
          image: chromadb/chroma:latest
          logConfiguration:
            logDriver: awslogs
            options:
              awslogs-group: ${langchain-log-group.name}
              awslogs-region: eu-central-1
              awslogs-stream-prefix: chroma
          name: ${pulumi-project}-${pulumi-stack}-chroma
          portMappings:
          - containerPort: 8000
            hostPort: 8000
            name: chroma
            protocol: tcp
          environment:
          - name: CHROMA_SERVER_AUTH_TOKEN_TRANSPORT_HEADER
            value: "AUTHORIZATION"
          - name: CHROMA_SERVER_AUTH_CREDENTIALS_PROVIDER
            value: "chromadb.auth.token.TokenConfigServerAuthCredentialsProvider"
          - name: CHROMA_SERVER_AUTH_PROVIDER
            value: "chromadb.auth.token.TokenAuthServerProvider"
          secrets:
          - name: CHROMA_SERVER_AUTH_CREDENTIALS
            valueFrom: ${langchain-chroma-token-parameter.arn}
        - command:
          - "/bin/sh"
          - "-c"
          - "flowise start"
          essential: true
          image: flowiseai/flowise:1.6.4
          logConfiguration:
            logDriver: awslogs
            options:
              awslogs-group: ${langchain-log-group.name}
              awslogs-region: eu-central-1
              awslogs-stream-prefix: flowise
          name: ${pulumi-project}-${pulumi-stack}-service
          portMappings:
          - containerPort: 3000
            hostPort: 3000
            name: flowise
            protocol: tcp
          environment:
          - name: DATABASE_TYPE
            value: postgres
          - name: DATABASE_NAME
            value: ${langchain-db-instance.dbName}
          - name: DATABASE_USER
            value: ${langchain-db-instance.username}
          - name: DATABASE_PORT
            value:
              fn::toJSON: ${langchain-db-instance.port}
          - name: DATABASE_HOST
            value: ${langchain-db-instance.address}
          - name: FLOWISE_USERNAME
            value: "admin"
          - name: DATABASE_SSL
            value: "true"
          - name: NODE_TLS_REJECT_UNAUTHORIZED
            value: "0"
          secrets:
          - name: DATABASE_PASSWORD
            valueFrom: ${langchain-db-password-parameter.arn}
          - name: FLOWISE_PASSWORD
            valueFrom: ${langchain-flowise-parameter.arn}
      cpu: 1024
      executionRoleArn: ${langchain-execution-role.arn}
      family: ${pulumi-project}-${pulumi-stack}
      memory: 8192
      networkMode: awsvpc
      requiresCompatibilities:
      - FARGATE
      taskRoleArn: ${langchain-task-role.arn}
    type: aws:ecs:TaskDefinition

  langchain-task-role:
    properties:
      assumeRolePolicy:
        fn::toJSON:
          Statement:
          - Action: sts:AssumeRole
            Effect: Allow
            Principal:
              Service: ecs-tasks.amazonaws.com
          Version: '2012-10-17'
      inlinePolicies:
      - name: ExecuteCommand
        policy:
          fn::toJSON:
            Statement:
            - Action:
              - ssmmessages:CreateControlChannel
              - ssmmessages:OpenControlChannel
              - ssmmessages:CreateDataChannel
              - ssmmessages:OpenDataChannel
              Effect: Allow
              Resource: "*"
            - Action:
              - logs:CreateLogStream
              - logs:DescribeLogGroups
              - logs:DescribeLogStreams
              - logs:PutLogEvents
              Effect: Allow
              Resource: "*"
            Version: '2012-10-17'
      - name: DenyIAM
        policy:
          fn::toJSON:
            Statement:
            - Action: iam:*
              Effect: Deny
              Resource: "*"
            Version: '2012-10-17'
    type: aws:iam:Role

variables:
  accountId: ${current.accountId}
  current:
    fn::invoke:
      arguments: {}
      function: aws:getCallerIdentity
  pulumi-project: ${pulumi.project}
  pulumi-stack: ${pulumi.stack}

outputs:
  url: http://${langchain-load-balancer.dnsName}
```

Run `pulumi up` to deploy the infrastructure.

```shell
pulumi up
```

### Step 5 - Build your AI workflow in Flowise

After deploying the infrastructure, you can access the Flowise UI by navigating to the URL provided in the output of the
Pulumi stack.

You can import the demo workflow `workflow.json` from the repository to get started, You may need to adjust your OpenAPI
key and the ChromaDB URL plus `CHROMA_SERVER_AUTH_CREDENTIALS` to match the values you set in the Pulumi stack.

### Step 6 - Clean Up

To clean up the resources, run `pulumi destroy`.

```shell
pulumi destroy
```

You will be prompted to confirm the deletion. Type `yes` and press `Enter`.

After the resources are deleted, you can remove the stack by running `pulumi stack rm`.

```shell
pulumi stack rm dev

```

