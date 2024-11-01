# Chat API service

This app's intention is to test certain capabilities for New Relic's AI monitoring features. Its purpose is to privde a demo app that shows tracing and aggregation features along with some aspects on how to achieve comprehensive observability across your stack to maintain peak performance, ensure compliance, promote quality, and reduce costs.

## Prerequisites

This application requires the following license keys and other prerequisites to be set in your terminal/environment.

### OpenAI Platform

This app uses the public OpenAI platform to call their API for access to different LLM models like gpt-3.5-turbo, gpt-4-turbo and gpt-4o.

```shell
- OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
```

### Pinecone

We want to simulate a Retrieval Augmented Generation (RAG) flow which commonly looks up information that the AI either doesn't know or might hallucinate about. We store some names of games and instructions in the Pinecone vector DB.

The below environment variables include the API key and Db configuration parameters for your Pinecone vector DB.

```shell
- PINECONE_API_KEY=<YOUR_PINECONE_API_KEY>
- PINECONE_NAMESPACE=default
- PINECONE_REGION=us-east-1
```

In addition, you need to have an index named  `games` with `text-embedding-ada-002` model.

### New Relic AI monitoring

This application is configured to observe the applications performance like traces, metrics and logs and also leverages New Relic's latest innovation in monitoring your AI interactions such as requests and responses. This capability also allows you to ensure compliance, promote quality, and reduce costs.

```shell
- NEW_RELIC_LICENSE_KEY=<YOUR_NEW_RELIC_LICENSE_KEY>
```
