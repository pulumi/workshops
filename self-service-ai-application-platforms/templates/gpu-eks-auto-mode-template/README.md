# GPU EKS Auto Mode Golden Path

A **golden path** template that gets your GPU-accelerated AI workloads from code to production on AWS in minutes, not weeks.

## What You Get

This golden path provides everything your AI/ML team needs to deploy production-ready GPU workloads on Kubernetes:

✅ **EKS Auto Mode cluster** with GPU node groups ready for AI workloads  
✅ **GPU-optimized infrastructure** - Automatic GPU instance provisioning and scaling  
✅ **AI-ready environment** - NVIDIA drivers, CUDA support, model serving capabilities  
✅ **Production ML workflows** - Hugging Face integration, OpenAI chat completions  
✅ **One-command deployment** - `pulumi up` handles everything  
✅ **No Kubernetes expertise required** - Complex EKS Auto Mode setup abstracted away  

## For AI/ML Teams: What to Expect

### Your Experience

**Day 1: Getting Started**
- Clone this repo, configure your AI tokens, run `pulumi up`
- GPU-enabled Kubernetes cluster is live on AWS in 10-15 minutes
- Pre-deployed AI workloads ready for your models

**Day 2-N: Development Workflow**
- Deploy your AI models using standard Kubernetes manifests
- Scale GPU workloads automatically based on demand
- Access Hugging Face models and OpenAI APIs seamlessly
- Focus on model development, not infrastructure

**Production AI Operations**
- Auto-scaling GPU nodes based on workload demand
- Cost optimization through EKS Auto Mode's intelligent scheduling
- Built-in support for popular AI/ML frameworks
- Integrated monitoring and logging for model performance

### What's Handled For You

You **don't** need to learn or configure:
- EKS cluster setup with Auto Mode
- GPU node group configuration and scaling
- NVIDIA GPU drivers and CUDA installation
- Kubernetes networking and security groups
- Container runtime optimization for GPU workloads
- IAM roles and permissions for AI services

You **do** focus on:
- Training and deploying your AI models
- Configuring model serving endpoints
- Monitoring model performance and accuracy
- Scaling workloads based on inference demand

## Quick Start (10 minutes)

1. **Clone and configure:**
   ```bash
   git clone <this-repo>
   cd gpu-eks-auto-mode-template
   ```

2. **Set your configuration:**
   ```bash
   # Required: Set your cluster name
   pulumi config set clusterName my-ai-cluster
   
   # Required: Set your AI API tokens
   pulumi config set --secret huggingface-token hf_your_token_here
   pulumi config set --secret open-ai-token sk-your_openai_token_here
   
   # Optional: Configure GPU preferences
   pulumi config set gpuInstanceGeneration "5"  # Default: "4" (G4dn)
   pulumi config set gpuInstanceArch "amd64"    # Default: amd64
   ```

3. **Deploy to AWS:**
   ```bash
   pulumi up
   # ✅ Creates EKS Auto Mode cluster
   # ✅ Provisions GPU-enabled node groups
   # ✅ Installs NVIDIA GPU drivers
   # ✅ Deploys Hugging Face and OpenAI integrations
   # ✅ Provides cluster access credentials
   ```

4. **Access your cluster:**
   ```bash
   # Configure kubectl
   aws eks update-kubeconfig --name $(pulumi stack output clusterName) --region $(pulumi config get aws:region)
   
   # Verify GPU nodes are ready
   kubectl get nodes -l node.kubernetes.io/instance-type --show-labels
   
   # Check deployed AI workloads
   kubectl get pods -n ai-workloads
   ```

## Your AI Workloads

The golden path includes pre-configured AI integrations you can use immediately:

### Hugging Face Model Serving
```yaml
# Example: Deploy a text generation model
apiVersion: apps/v1
kind: Deployment
metadata:
  name: text-generation-model
spec:
  replicas: 1
  selector:
    matchLabels:
      app: text-generation
  template:
    spec:
      containers:
      - name: model-server
        image: huggingface/transformers-pytorch-gpu:latest
        resources:
          limits:
            nvidia.com/gpu: 1
        env:
        - name: HUGGINGFACE_TOKEN
          valueFrom:
            secretKeyRef:
              name: huggingface-secret
              key: token
```

### OpenAI Chat Completions
```yaml
# Example: OpenAI proxy service
apiVersion: v1
kind: Service
metadata:
  name: openai-chat-service
spec:
  selector:
    app: openai-chat
  ports:
  - port: 8080
    targetPort: 8080
---
# Deployment with OpenAI integration pre-configured
```

## Development Workflow

### Local Model Development
```bash
# Test models locally first
pip install transformers torch

# Example: Load and test a Hugging Face model
python -c "
from transformers import pipeline
generator = pipeline('text-generation', model='gpt2')
result = generator('The future of AI is', max_length=50)
print(result)
"
```

### Deploy to GPU Cluster
```bash
# Create your model deployment
kubectl apply -f your-model-deployment.yaml

# Scale based on demand
kubectl scale deployment your-model --replicas=3

# Monitor GPU utilization
kubectl top nodes
```

### Monitor AI Workloads
```bash
# Check pod status and GPU allocation
kubectl get pods -o wide

# View logs from model servers
kubectl logs -f deployment/your-model-deployment

# Monitor cluster resources
kubectl describe nodes
```

## What's Under the Hood (You Don't Need to Know This)

The golden path creates sophisticated AWS infrastructure:

**EKS Auto Mode Features:**
- Automatic compute provisioning based on workload requirements
- Cost-optimized scheduling across Spot and On-Demand instances
- Built-in cluster autoscaling and node lifecycle management
- Integrated AWS services (ALB, EBS CSI, VPC CNI)

**GPU Infrastructure:**
- GPU-enabled managed node groups (G4dn, G5, G6 families)
- NVIDIA GPU driver installation via DaemonSet
- CUDA runtime configuration
- GPU resource allocation and scheduling

**AI/ML Integrations:**
```typescript
// Hugging Face integration with secret management
const huggingfaceSecret = new k8s.core.v1.Secret("huggingface-secret", {
    metadata: { namespace: "ai-workloads" },
    data: {
        token: config.requireSecret("huggingface-token")
    }
});

// OpenAI service configuration
const openaiService = new k8s.core.v1.ConfigMap("openai-config", {
    data: {
        apiKey: config.requireSecret("open-ai-token")
    }
});
```

## Customizing Your AI Infrastructure

### GPU Instance Types
```bash
# Use latest generation GPUs (G5 instances)
pulumi config set gpuInstanceGeneration "5"

# Use ARM-based GPU instances for cost optimization
pulumi config set gpuInstanceArch "arm64"

# Deploy changes
pulumi up
```

### Add Custom AI Workloads
```yaml
# your-ai-model.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: your-custom-model
  namespace: ai-workloads
spec:
  template:
    spec:
      containers:
      - name: model-container
        image: your-registry/your-model:latest
        resources:
          limits:
            nvidia.com/gpu: 1
            memory: "8Gi"
          requests:
            memory: "4Gi"
```

### Scale GPU Resources
The cluster automatically provisions GPU nodes based on pending workloads:
```bash
# Deploy GPU-intensive workload
kubectl apply -f high-gpu-workload.yaml

# EKS Auto Mode automatically:
# ✅ Detects GPU resource requirements
# ✅ Provisions appropriate GPU instances
# ✅ Schedules workloads on new nodes
# ✅ Terminates idle nodes to save costs
```

## Common AI/ML Patterns

### Model Training Workflows
```yaml
# Example: Training job with GPU
apiVersion: batch/v1
kind: Job
metadata:
  name: model-training
spec:
  template:
    spec:
      containers:
      - name: trainer
        image: pytorch/pytorch:latest
        command: ["python", "train_model.py"]
        resources:
          limits:
            nvidia.com/gpu: 2
      restartPolicy: Never
```

### Model Serving with Auto-Scaling
```yaml
# HorizontalPodAutoscaler for model inference
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: model-server-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: model-server
  minReplicas: 1
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Batch Inference Jobs
```bash
# Submit large batch inference job
kubectl create job batch-inference --image=your-model:latest \
  --dry-run=client -o yaml > batch-job.yaml

# Edit to add GPU resources and run
kubectl apply -f batch-job.yaml
```

## Monitoring Your AI Workloads

### GPU Utilization
```bash
# Install NVIDIA GPU monitoring (if not included)
kubectl apply -f https://raw.githubusercontent.com/NVIDIA/k8s-device-plugin/main/nvidia-device-plugin.yml

# Monitor GPU usage
kubectl top nodes
kubectl describe node <gpu-node-name>
```

### Model Performance Metrics
```bash
# View model server logs
kubectl logs -f deployment/your-model-server

# Check inference latency and throughput
kubectl port-forward service/your-model-service 8080:8080
curl http://localhost:8080/metrics  # If Prometheus metrics enabled
```

### Cost Monitoring
- **EKS Auto Mode Dashboard**: View compute costs and utilization
- **AWS Cost Explorer**: Track GPU instance costs over time
- **Cluster Autoscaler Logs**: Monitor scaling decisions and cost optimization

## FAQ for AI/ML Teams

**Q: What GPU instances does this support?**  
A: G4dn (default), G5, and G6 families. Configure with `gpuInstanceGeneration` setting.

**Q: Can I use this for model training?**  
A: Yes. Deploy training jobs with GPU resources. The cluster auto-scales to provide the GPUs you need.

**Q: How do I manage model versions?**  
A: Use standard Kubernetes deployment strategies. The golden path provides the infrastructure; you bring your MLOps practices.

**Q: What about data storage for training?**  
A: EKS Auto Mode includes EBS CSI driver. Add persistent volumes for training data, or integrate with S3 for large datasets.

**Q: Can I use distributed training?**  
A: Yes. Deploy multi-GPU training jobs using frameworks like PyTorch Distributed or Horovod.

**Q: How do I handle model artifacts?**  
A: Integrate with model registries like MLflow, or use S3 for model storage. The cluster provides the compute layer.

## Supported AI/ML Frameworks

This golden path works with:
- **PyTorch**: GPU-accelerated deep learning
- **TensorFlow**: Machine learning with CUDA support  
- **Hugging Face Transformers**: Pre-trained language models
- **NVIDIA Triton**: High-performance model serving
- **Ray**: Distributed ML workloads
- **Kubeflow**: End-to-end ML workflows

## Support

**Getting Help:**
- **Platform Team**: Your first point of contact for golden path issues
- **AWS EKS Documentation**: https://docs.aws.amazon.com/eks/
- **Pulumi Docs**: https://www.pulumi.com/docs/
- **NVIDIA GPU Kubernetes**: https://github.com/NVIDIA/k8s-device-plugin

**Common Issues:**
- **No GPU nodes available**: Check `gpuInstanceGeneration` config and AWS quota limits
- **Pods pending**: Verify GPU resource requests match available node capacity
- **Driver issues**: Check NVIDIA device plugin pods are running
- **Cost concerns**: Monitor Auto Mode recommendations and optimize instance selection

## Next Steps

1. **Deploy your first model** using the pre-configured Hugging Face integration
2. **Set up model serving** endpoints for inference workloads
3. **Configure monitoring** for model performance and GPU utilization
4. **Implement CI/CD** for automated model deployment pipelines
5. **Add data pipelines** for training data preparation and model updates

Your platform team may provide additional golden paths for MLOps pipelines, data storage, and model monitoring to complement this GPU infrastructure foundation.