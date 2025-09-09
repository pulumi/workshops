# AI Model Template Golden Path

A **golden path** template that gets your AI models from selection to production deployment in minutes, not weeks.

## What You Get

This golden path provides everything your AI/ML team needs to deploy production-ready AI models on your self-service platform:

✅ **Pre-configured model deployment** - Industry-standard AI model orchestration  
✅ **Qwen model integration** - Ready-to-use Qwen/Qwen3-Coder-30B-A3B-Instruct model  
✅ **Auto-scaling infrastructure** - Intelligent resource allocation based on demand  
✅ **Built-in monitoring** - Model performance tracking and health checks  
✅ **One-command deployment** - `pulumi up` handles everything  
✅ **No MLOps expertise required** - Abstract away complex model serving infrastructure  

## For AI/ML Teams: What to Expect

### Your Experience

**Day 1: Getting Started**
- Clone this template, configure model parameters, run `pulumi up`
- Your AI model is live and serving inference requests in 5-10 minutes
- Pre-configured Qwen coding model ready for immediate use

**Day 2-N: Development Workflow**
- Swap models by updating configuration
- Adjust scaling and performance parameters
- Monitor model usage and performance metrics
- Focus on model selection and tuning, not infrastructure

**Production Model Operations**
- Automatic scaling based on inference load
- Built-in health checks and failover
- Cost optimization through intelligent resource management
- Integration with existing AI application workflows

### What's Handled For You

You **don't** need to learn or configure:
- Model serving infrastructure (containers, load balancers)
- Auto-scaling policies and resource management
- Model registry and artifact management
- Health monitoring and alerting setup
- GPU/CPU resource optimization
- Model versioning and rollback strategies

You **do** focus on:
- Selecting the right models for your use case
- Configuring model parameters and scaling
- Testing model performance and accuracy
- Monitoring model usage and costs

## Quick Start (5 minutes)

1. **Clone and customize:**
   ```bash
   git clone <this-repo>
   cd model-template
   ```

2. **Configure your model:**
   Edit the `Pulumi.yaml` file to specify your model:
   ```yaml
   resources:
     yourModel:
       type: ai-model:AIModelComponent
       properties:
         modelName: "Qwen/Qwen3-Coder-30B-A3B-Instruct"
         size: medium
         monitoringEnabled: true
         # Additional configuration options available
   ```

3. **Deploy to production:**
   ```bash
   pulumi up
   # ✅ Creates AI model serving infrastructure
   # ✅ Downloads and configures the specified model
   # ✅ Sets up auto-scaling and monitoring
   # ✅ Provides model inference endpoint
   ```

4. **Test your model:**
   ```bash
   # Get model endpoint
   pulumi stack output modelEndpoint
   
   # Test inference
   curl -X POST "https://your-model-endpoint/v1/chat/completions" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer your-api-key" \
     -d '{
       "model": "Qwen3-Coder-30B-A3B-Instruct",
       "messages": [{"role": "user", "content": "Write a Python function to sort a list"}],
       "temperature": 0.7
     }'
   ```

## Your Model Configuration

The template includes a complete Qwen coding model setup you can customize:

### Model Specification
```yaml
# Core model configuration
modelName: "Qwen/Qwen3-Coder-30B-A3B-Instruct"
size: small  # Options: small, medium, large, xlarge
monitoringEnabled: true

# The AI Model Component handles:
# - Model artifact download and caching
# - Container image building and optimization  
# - Inference server configuration
# - Resource allocation and scaling
```

### Size Configuration Options
```yaml
# Small: Cost-optimized for light workloads
size: small
# - CPU-based inference
# - 2-4 vCPU, 8-16GB RAM
# - Good for: Prototyping, low-volume inference

# Medium: Balanced performance and cost
size: medium  
# - GPU acceleration available
# - 4-8 vCPU, 16-32GB RAM, optional GPU
# - Good for: Production workloads, medium traffic

# Large: High performance
size: large
# - Dedicated GPU resources
# - 8-16 vCPU, 32-64GB RAM, GPU required
# - Good for: High-throughput inference, complex models

# XLarge: Maximum performance
size: xlarge
# - Multiple GPU allocation
# - 16+ vCPU, 64+ GB RAM, multiple GPUs
# - Good for: Massive models, highest throughput needs
```

## Development Workflow

### Model Selection and Testing
```yaml
# Try different models by changing the modelName
resources:
  codeModel:
    type: ai-model:AIModelComponent
    properties:
      modelName: "Qwen/Qwen3-Coder-30B-A3B-Instruct"
      size: medium
      
  chatModel:
    type: ai-model:AIModelComponent  
    properties:
      modelName: "Qwen/Qwen2.5-7B-Instruct"
      size: small
```

### Performance Tuning
```yaml
# Configure model for high-performance scenarios
productionModel:
  type: ai-model:AIModelComponent
  properties:
    modelName: "Qwen/Qwen3-Coder-30B-A3B-Instruct"
    size: large
    monitoringEnabled: true
    # Additional performance parameters
    autoScaling:
      enabled: true
      minReplicas: 2
      maxReplicas: 10
    resources:
      gpuType: "nvidia-a100"
      memoryOptimized: true
```

### Multi-Model Deployment
```yaml
# Deploy multiple models for different use cases
resources:
  codingAssistant:
    type: ai-model:AIModelComponent
    properties:
      modelName: "Qwen/Qwen3-Coder-30B-A3B-Instruct"
      size: medium
      
  generalChat:
    type: ai-model:AIModelComponent
    properties:
      modelName: "Qwen/Qwen2.5-14B-Instruct" 
      size: small
      
  codeReview:
    type: ai-model:AIModelComponent
    properties:
      modelName: "Qwen/CodeQwen1.5-7B-Chat"
      size: medium
```

## What's Under the Hood (You Don't Need to Know This)

The golden path uses the **AI Model Component** framework:

**Model Serving Architecture:**
- Containerized model serving with optimized inference engines
- Auto-scaling based on request volume and latency targets
- Model artifact caching and version management
- GPU/CPU resource allocation and optimization

**Component Integration:**
```yaml
# The template uses the ai-model component
packages:
  ai-model: https://github.com/pulumi/workshops/self-service-ai-application-platforms/components/ai-model@0.3.0

# Component creates comprehensive infrastructure:
# - Model serving containers (TensorRT, vLLM, or similar)
# - Load balancers and auto-scaling groups
# - Monitoring dashboards and alerting
# - Resource quotas and cost controls
```

**Why This Matters:**
- **Consistency** - All models deploy with the same battle-tested patterns
- **Performance** - Optimized inference engines and resource allocation
- **Cost Control** - Intelligent scaling prevents over-provisioning
- **Maintainability** - Platform team manages infrastructure, you manage models

## Customizing Your Model Deployment

### Model Selection
```yaml
# Popular coding models
codingModels:
  qwenCoder:
    modelName: "Qwen/Qwen3-Coder-30B-A3B-Instruct"
  codeLlama:  
    modelName: "codellama/CodeLlama-13b-Instruct-hf"
  starcoder:
    modelName: "bigcode/starcoder2-15b"

# General purpose models  
chatModels:
  qwen25:
    modelName: "Qwen/Qwen2.5-7B-Instruct"
  mistral:
    modelName: "mistralai/Mistral-7B-Instruct-v0.3"
  llama:
    modelName: "meta-llama/Llama-3.1-8B-Instruct"
```

### Environment-Specific Configuration
```yaml
# Development environment - cost optimized
devModel:
  properties:
    modelName: "Qwen/Qwen2.5-7B-Instruct"
    size: small
    monitoringEnabled: false

# Staging environment - production-like
stagingModel:
  properties:
    modelName: "Qwen/Qwen3-Coder-30B-A3B-Instruct"
    size: medium
    monitoringEnabled: true
    
# Production environment - high performance
prodModel:
  properties:
    modelName: "Qwen/Qwen3-Coder-30B-A3B-Instruct"
    size: large
    monitoringEnabled: true
    highAvailability: true
```

### Advanced Configuration
```yaml
# Enterprise-grade model deployment
enterpriseModel:
  type: ai-model:AIModelComponent
  properties:
    modelName: "Qwen/Qwen3-Coder-30B-A3B-Instruct"
    size: xlarge
    monitoringEnabled: true
    features:
      # Security and compliance
      encryption: true
      auditLogging: true
      accessControl: rbac
      
      # Performance optimization
      quantization: int8
      tensorParallelism: true
      pipelineParallelism: true
      
      # Reliability
      multiAZ: true
      backupEnabled: true
      circuitBreaker: true
```

## Common Model Deployment Patterns

### Code Generation Service
```yaml
codeGenerationService:
  type: ai-model:AIModelComponent
  properties:
    modelName: "Qwen/Qwen3-Coder-30B-A3B-Instruct"
    size: large
    monitoringEnabled: true
    specialization: "code-generation"
    optimizations:
      - "fast-inference"
      - "code-completion-optimized"
```

### Chat Assistant
```yaml
chatAssistant:
  type: ai-model:AIModelComponent
  properties:
    modelName: "Qwen/Qwen2.5-14B-Instruct"
    size: medium  
    monitoringEnabled: true
    specialization: "conversational-ai"
    optimizations:
      - "low-latency"
      - "context-retention"
```

### Batch Processing Model
```yaml
batchProcessor:
  type: ai-model:AIModelComponent
  properties:
    modelName: "Qwen/Qwen3-Coder-30B-A3B-Instruct"
    size: xlarge
    monitoringEnabled: true
    deploymentMode: "batch"
    scaling:
      strategy: "queue-based"
      maxConcurrency: 50
```

## Model Performance and Monitoring

### Built-in Metrics
```bash
# View model performance metrics
pulumi stack output --json | jq '.modelMetrics'

# Check scaling events and resource usage
pulumi stack output --json | jq '.scalingEvents'

# Monitor inference latency and throughput
pulumi stack output --json | jq '.performanceMetrics'
```

### Custom Monitoring
```yaml
# Enable advanced monitoring features
monitoredModel:
  type: ai-model:AIModelComponent
  properties:
    modelName: "Qwen/Qwen3-Coder-30B-A3B-Instruct"
    size: medium
    monitoringEnabled: true
    monitoring:
      metrics:
        - "inference-latency"
        - "token-throughput"
        - "gpu-utilization"
        - "memory-usage"
        - "error-rate"
      alerts:
        - condition: "latency > 5s"
          action: "scale-up"
        - condition: "error-rate > 5%"
          action: "health-check"
```

### Cost Optimization
```yaml
# Cost-optimized model configuration
costOptimizedModel:
  type: ai-model:AIModelComponent
  properties:
    modelName: "Qwen/Qwen2.5-7B-Instruct"  # Smaller, efficient model
    size: small
    scaling:
      scaleToZero: true        # Scale down to 0 when idle
      maxIdleTime: "10m"       # Scale down after 10 minutes
      spotInstances: true      # Use spot instances for cost savings
```

## Testing and Validation

### Model Accuracy Testing
```bash
# Test model responses for accuracy
curl -X POST "https://model-endpoint/validate" \
  -d '{"test_suite": "coding_tasks", "sample_size": 100}'

# Run benchmark tests
curl -X POST "https://model-endpoint/benchmark" \
  -d '{"benchmark": "humaneval", "temperature": 0.1}'
```

### Performance Testing  
```bash
# Load testing
curl -X POST "https://model-endpoint/load-test" \
  -d '{"concurrent_users": 50, "duration": "5m"}'

# Latency testing
curl -X POST "https://model-endpoint/latency-test" \
  -d '{"request_type": "code_completion", "iterations": 1000}'
```

## FAQ for AI/ML Teams

**Q: What models are supported?**  
A: Any Hugging Face model, custom ONNX models, and popular open-source models. The component handles format conversion automatically.

**Q: How do I switch between models?**  
A: Update the `modelName` in your configuration and run `pulumi up`. The component handles the transition seamlessly.

**Q: Can I use custom models?**  
A: Yes. Specify your model registry URL or local path in the `modelName` field.

**Q: How does auto-scaling work?**  
A: The component monitors request volume, latency, and resource usage to automatically scale replicas up or down.

**Q: What about GPU requirements?**  
A: Specify size `large` or `xlarge` for GPU allocation. The component automatically provisions appropriate GPU instances.

**Q: How do I handle model updates?**  
A: Update the model version in configuration. The component performs blue-green deployments to ensure zero downtime.

## Supported Model Types

This template supports:
- **Language Models** - GPT, Llama, Qwen, Mistral families
- **Code Models** - CodeLlama, StarCoder, CodeQwen specialized models  
- **Chat Models** - Instruction-tuned conversational models
- **Custom Models** - Your own fine-tuned or proprietary models
- **Multi-modal Models** - Vision-language models (coming soon)
- **Embedding Models** - Vector embedding generation models

## Support

**Getting Help:**
- **Platform Team** - Your first point of contact for golden path issues
- **AI Model Documentation** - https://huggingface.co/docs
- **Pulumi Docs** - https://www.pulumi.com/docs/
- **Component Issues** - https://github.com/pulumi/workshops/self-service-ai-application-platforms

**Common Issues:**
- **Model not loading** - Check model name spelling and availability
- **Out of memory errors** - Reduce model size or increase resource allocation
- **Slow inference** - Consider GPU instances or model quantization
- **High costs** - Enable auto-scaling and consider smaller models for development

## Next Steps

1. **Deploy the Qwen model** using the default configuration
2. **Test inference performance** with your specific use cases
3. **Experiment with different models** for various AI tasks
4. **Set up monitoring dashboards** for production observability
5. **Integrate model endpoints** with your AI applications

Your platform team may provide additional golden paths for model fine-tuning, vector databases, and multi-model orchestration to complement this model serving foundation.