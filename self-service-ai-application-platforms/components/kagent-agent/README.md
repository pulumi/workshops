# KAgentAgentComponent

Abstraction for deploying AI agents on Kubernetes using the KAgent framework.

A component to abstract the details related to:
- Creating and configuring AI model configurations for agent backends.
- Deploying declarative AI agents to Kubernetes clusters.
- Integrating MCP (Model Context Protocol) servers for enhanced tool capabilities.

# Inputs

* agentName: The name of the KAgent agent to deploy.
* description: A brief description of the agent's purpose and capabilities.
* systemMessage: The system message to initialize the agent's behavior and context.
* modelConfig: Configuration for the AI model (creation settings, provider, API keys).
* namespaceName (Optional): The namespace in which to deploy the agent. Defaults to "kagent".
* agentType (Optional): The agent type to be used. Defaults to "Declarative".
* tools (Optional): Array of MCP server tools for enhanced agent capabilities.

# Outputs

This component creates Kubernetes custom resources but does not expose direct outputs. The agent will be available through the KAgent API once deployed.

# Usage
## Specify Package in `Pulumi.yaml`

Add the following to your `Pulumi.yaml` file:
Note: If no version is specified, the latest version will be used.

```
packages:
  component-kagent-agent: https://github.com/your-org/component-kagent-agent[@v1.0.0]
```

## Use SDK in Program

### Python
```python
from your_org_component_kagent_agent import KAgentAgentComponent, KAgentAgentComponentArgs

agent = KAgentAgentComponent("my-agent", KAgentAgentComponentArgs(
  agent_name="pirate-agent",
  description="An agent that speaks like a pirate.",
  system_message="You are a pirate. You speak like a pirate. You love treasure and adventure.",
  model_config={
    "create": False,
    "name": "default-model-config"
  }
))
```

### Typescript
```typescript
import { KAgentAgentComponent } from "@your-org/component-kagent-agent";

const agent = new KAgentAgentComponent("my-agent", {
  agentName: "pirate-agent",
  description: "An agent that speaks like a pirate.",
  systemMessage: "You are a pirate. You speak like a pirate. You love treasure and adventure.",
  modelConfig: {
    create: false,
    name: "default-model-config"
  }
});
```

### Dotnet
```csharp
using YourOrg.KAgentAgentComponent;

var agent = new KAgentAgentComponent("my-agent", new KAgentAgentComponentArgs {
  AgentName = "pirate-agent",
  Description = "An agent that speaks like a pirate.",
  SystemMessage = "You are a pirate. You speak like a pirate. You love treasure and adventure.",
  ModelConfig = new ModelConfig {
    Create = false,
    Name = "default-model-config"
  }
});
```

### YAML
```yaml
kagentAgent:
  type: component-kagent-agent:KAgentAgentComponent
  properties:
    agentName: pirate-agent
    description: An agent that speaks like a pirate.
    systemMessage: You are a pirate. You speak like a pirate. You love treasure and adventure.
    modelConfig:
      create: false
      name: default-model-config
```