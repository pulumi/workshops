# AIModelComponent

Abstraction for deploying AI models in Kubernetes using VLLM and LeaderWorkerSet.

A component to abstract the details related to:
- Deploying AI models on Kubernetes using VLLM (Very Large Language Model) serving framework.
- Managing multi-node distributed inference using LeaderWorkerSet custom resources.
- Providing GPU-accelerated model serving with automatic scaling and high availability.

# Inputs

* modelName: The name of the AI model to deploy (e.g., "gpt-4", "bert-base-uncased").
* namespaceName (Optional): The Kubernetes namespace to deploy the AI model into. Defaults to "lws-system".
* size (Optional): The size of the AI model deployment ("small", "medium", "large"). Defaults to "small".
* monitoringEnabled (Optional): Enable Prometheus monitoring for the AI model deployment. Defaults to false.
* notParallel (Optional): If true, the model will not use parallel processing. Defaults to false.

# Outputs

* modelInternalServiceDNS: The internal DNS name for the AI model service within the cluster.

# Usage
## Specify Package in `Pulumi.yaml`

Add the following to your `Pulumi.yaml` file:
Note: If no version is specified, the latest version will be used.

```
packages:
  component-ai-model: https://github.com/your-org/component-ai-model[@v1.0.0]
``` 

## Use SDK in Program

### Python
```python
from your_org_component_ai_model import AIModelComponent, AIModelComponentArgs

ai_model = AIModelComponent("my-ai-model", AIModelComponentArgs(  
    model_name="meta-llama/Llama-2-7b-chat-hf",
    size="small",
    monitoring_enabled=True
))
```

### Typescript
```typescript
import { AIModelComponent } from "@your-org/component-ai-model";

const aiModel = new AIModelComponent("my-ai-model", {
    modelName: "meta-llama/Llama-2-7b-chat-hf",
    size: "small",
    monitoringEnabled: true
});
```

### Dotnet
```csharp
using YourOrg.AIModelComponent;

var aiModel = new AIModelComponent("my-ai-model", new AIModelComponentArgs {
    ModelName = "meta-llama/Llama-2-7b-chat-hf",
    Size = "small",
    MonitoringEnabled = true
});
```

### YAML
```yaml
  aiModelComponent:
    type: component-ai-model:AIModelComponent
    properties:
      modelName: meta-llama/Llama-2-7b-chat-hf
      size: small
      monitoringEnabled: true
``` 

# Size Configurations

The component supports three predefined sizes:

- **small**: 1 replica, 2 workers, 8 GPUs per node
- **medium**: 2 replicas, 4 workers, 8 GPUs per node  
- **large**: 4 replicas, 8 workers, 8 GPUs per node

# Requirements

- Kubernetes cluster with GPU nodes
- LeaderWorkerSet CRD installed
- HuggingFace token secret ("huggingface-token") for model access
- GPU tolerance configured for scheduling