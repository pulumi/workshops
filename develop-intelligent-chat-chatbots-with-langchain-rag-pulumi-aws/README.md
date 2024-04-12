# How to Develop Intelligent Q&A Chatbots with RAG, LangChain, and ChromaDB using Pulumi and AWS.

This repository contains the code for the blog post "How to Develop Intelligent Q&A Chatbots with RAG, LangChain, and
ChromaDB using Pulumi and AWS".

## Introduction

## Prerequisites

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
