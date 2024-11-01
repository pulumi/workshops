# AI Chat Application Demo

AI Chat application that uses OpenAI + Pinecone. Monitored by New Relic. Deployed by Pulumi on AWS.

> [!IMPORTANT]
> We have built this demo so that it uses the free tiers of all the services, but if you leave the infrastructure running without deleting it at the end, some cost may be associated.
>
> You should ensure that you follow the instructions at the bottom of this README (the section named [Tidying Up](#tidying-up)) and double check that you have no data or infrastructure left when you're done.

## Pre-requisites

- New Relic license key, API key and Admin API key
- Pinecone API Key
- Open AI API Key

## Store app secrets in ESC

This should be done whether you're running this in AWS or running it locally as we can use the ESC CLI to write out the configuration in a `dotenv` format.

### Keys you will need

- New Relic License Key
- New Relic Admin API Key
- New Relic Api Key
- OpenAPI Key
- Pinecone API Key
- Pulumi Access Token

### Storing your keys in ESC

For this I'm using two environments. One to store the secrets (`ai-demo-secrets`) and one to inherit that and actually specify the required Environment Variables and Pulumi config (`ai-demo`). It feels a bit neater, but you can have everything in one environment if you like.

#### ai-demo-secrets:

```bash
pulumi env init demos/ai-chat-demo-secrets --non-interactive
pulumi env set demos/ai-chat-demo-secrets values.NewRelicLicenseKey abcd1234 --secret
pulumi env set demos/ai-chat-demo-secrets values.NewRelicAdminApiKey abcd1234 --secret
pulumi env set demos/ai-chat-demo-secrets values.NewRelicApiKey abcd1234 --secret
pulumi env set demos/ai-chat-demo-secrets values.OpenAIKey abcd1234 --secret
pulumi env set demos/ai-chat-demo-secrets values.PineconeApiKey abdc1234 --secret
```

#### ai-demo:

We're going to do this a little differently as we need to add an import to our `demos/ai-chat-demo-secrets` environment.

Run the following to create the environment:

```bash
pulumi env init demos/ai-chat-demo --non-interactive
```

Then run the following to open the environment in an editor locally:

```bash
pulumi env edit demos/ai-chat-demo
```

At the top of this file you need to add the following:

```yaml
imports:
  - demos/ai-chat-demo-secrets
```

> [!NOTE]
> You need to select an OpenAI model to use in the app. You can find a list of the models available (and their price) in the [OpenAI Platform documentaion](https://platform.openai.com/docs/models#models-overview).
>
> This demo has been tested and works with the following models:
>
> - gpt-3.5-turbo
> - gpt-4-turbo
> - gpt-4o

```bash
pulumi env set demos/ai-chat-demo values.model "gpt-3.5-turbo"
pulumi env set demos/ai-chat-demo environmentVariables.OPENAI_API_KEY \${OpenApiKey}
pulumi env set demos/ai-chat-demo environmentVariables.PINECONE_API_KEY \${PineconeApiKey}
pulumi env set demos/ai-chat-demo environmentVariables.NEW_RELIC_LICENSE_KEY \${NewRelicLicenseKey}
pulumi env set demos/ai-chat-demo environmentVariables.NEW_RELIC_MONITORING_ENABLED true
pulumi env set demos/ai-chat-demo environmentVariables.NEW_RELIC_AI_MONITORING_ENABLED true
pulumi env set demos/ai-chat-demo environmentVariables.NEW_RELIC_SPAN_EVENTS_MAX_SAMPLES_STORED 10000
pulumi env set demos/ai-chat-demo environmentVariables.NEW_RELIC_CUSTOM_INSIGHTS_MAX_SAMPLES_STORED 100000
pulumi env set demos/ai-chat-demo environmentVariables.MODEL_TO_USE \${model}
```

## Run Locally via Docker

Additional requirements:

- Docker
- A Pinecone index named `games` in the `default` namespace that needs to use the `text-embedding-ada-002` model.
- Update the `dashboard.json` accountIds array to include YOUR New Relic account id. You can do a find-replace on `123456` in the `dashboard.json` file.
- Import the `dashboard.json` to your New Relic account.

> [!CAUTION]
> The following `pulumi env` command will write out the values from your ESC environment to a `.env` file.
>
> If you publish this, it will mean that the keys for your Pinecone, OpenAI, New Relic and Pulumi Cloud may be publicly visible.
>
> The `.gitignore` in this repository includes various differently named versions of the `.env` file but you should be extra careful so as not to make these keys public.

```bash
pulumi env open demos/ai-chat-demos --format dotenv > .env
cd app
docker compose up -d
```

## Deploy to AWS with Pulumi

Additional requirements:

- [Pulumi Cloud account](https://app.pulumi.com/)
- [Pulumi CLI](https://www.pulumi.com/docs/install/) installed
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) installed
- An AWS Account that you have access to

And then either your AWS credentials set up so that Pulumi can access your AWS Account (see the [Pulumi Getting started docs](https://www.pulumi.com/docs/iac/get-started/aws/begin/#configure-pulumi-to-access-your-aws-account) to see how to do this)

OR (recommended)

Configure AWS OIDC with Pulumi ESC (see the [Pulumi ESC AWS OIDC Integration guide](https://www.pulumi.com/docs/esc/integrations/dynamic-login-credentials/aws-login/) for more information)

If you didn't have a Pulumi Cloud account before, you need to get an access token and add it to your environments:

```bash
pulumi env set demos/ai-chat-demo-secrets values.PulumiAccessToken abcd1234 --secret
pulumi env set demos/ai-chat-demo environmentVariables.PULUMI_TEAM_TOKEN_EC2_ESC \${PulumiAccessToken}
```

### Deploy everything 🚀

```bash
# Change to the infra folder
cd infra
# Start up a venv and install deps
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Additional AWS configurations
# https://www.pulumi.com/registry/packages/aws-native/installation-configuration/
# the option shown here uses your ~/.aws/credentials profile name
# aws sso --profile work
pulumi config set aws:profile {AWS Profile name} # 🚨🚨🚨 replace with YOUR profile name
pulumi config set aws:region {AWS Region} # Choose a region to deploy to
# option to enable auth via EC2 Instance Metadata
pulumi config set aws:skipMetadataApiCheck false
# Add environment stack config file
pulumi config env add demos/ai-demo

# Deploy
pulumi up
```

This will create the following:

- VPC in the region of your choice with these networking resources:
  - Internet gateway
  - Route Table
  - Public subnet
  - Route table association for the subnet
- Security group to allow traffic to the EC2 instance
- EC2 instance
- A New Relic dashboard using the `dashboard.json` file that is in this folder
- A Pinecone Index to store data in

The EC2 instance will also have user data run on it to download and install the Pulumi CLI, Docker engine and docker compose. It will then clone this repo and using docker compose, run `docker compose up` against the `docker-compose.yml` file in the `app` folder.

It will also register the public IP address of the EC2 instance as a [stack output](https://www.pulumi.com/docs/iac/concepts/stacks/#outputs). You can use this IP address to go to the web page and run the app (you may want to give it a minute as the user data script might still be running).

You can then visit the New Relic portal and view the dashboard that was created.

### Tidying up

Once you've finished, don't forget to tear down your infrastructure:

```bash
pulumi destroy
```

## Acknowledgements

This repo stems from existing work by @harrykimpel and @desteves.

- [Node Chat Service](https://github.com/harrykimpel/node-chat-service)
- [Chat Front-End](https://github.com/harrykimpel/python-flask-openai/tree/main/chat-frontend)
