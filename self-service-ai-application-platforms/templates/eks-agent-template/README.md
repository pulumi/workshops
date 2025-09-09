# EKS AI Agent Golden Path

A **golden path** template that gets your AI agent applications from code to production on AWS in minutes, not weeks.

## What You Get

This golden path provides everything your AI team needs to deploy production-ready intelligent agent applications on Kubernetes:

✅ **Production-ready EKS cluster** with managed node groups optimized for AI workloads  
✅ **Scalable infrastructure** - Auto-scaling from 3-6 nodes based on agent demand  
✅ **AI agent platform** - OpenAI integration, conversation management, intelligent routing  
✅ **High-performance compute** - m5.4xlarge instances for CPU-intensive AI processing  
✅ **One-command deployment** - `pulumi up` handles everything  
✅ **No Kubernetes expertise required** - Complex EKS setup abstracted away  

## For AI Development Teams: What to Expect

### Your Experience

**Day 1: Getting Started**
- Clone this repo, configure your OpenAI token, run `pulumi up`
- Production EKS cluster with AI agents is live on AWS in 10-15 minutes
- Pre-deployed agent infrastructure ready for your intelligent applications

**Day 2-N: Development Workflow**
- Deploy your AI agents using standard Kubernetes manifests
- Scale agent workloads automatically based on conversation demand
- Integrate with OpenAI APIs for natural language processing
- Focus on agent logic and user experience, not infrastructure

**Production AI Agent Operations**
- Auto-scaling agent pods based on CPU utilization and request volume
- Load balancing across multiple agent instances
- Built-in support for stateful conversations and session management
- Integrated monitoring for agent performance and response times

### What's Handled For You

You **don't** need to learn or configure:
- EKS cluster setup and managed node groups
- Auto-scaling policies and load balancing
- Kubernetes networking and security groups
- OpenAI API integration and secret management
- Container orchestration and service discovery
- IAM roles and permissions for agent services

You **do** focus on:
- Building intelligent agent conversation flows
- Implementing business logic and decision trees
- Integrating with external APIs and data sources
- Monitoring agent performance and user satisfaction

## Quick Start (10 minutes)

1. **Clone and configure:**
   ```bash
   git clone <this-repo>
   cd eks-agent-template
   ```

2. **Set your configuration:**
   ```bash
   # Required: Set your cluster name
   pulumi config set clusterName my-agent-cluster
   
   # Required: Set your OpenAI API token
   pulumi config set --secret open-ai-token sk-your_openai_token_here
   
   # Optional: Configure cluster sizing
   pulumi config set minClusterSize 3         # Default: 3
   pulumi config set maxClusterSize 6         # Default: 6
   pulumi config set desiredClusterSize 3     # Default: 3
   pulumi config set eksNodeInstanceType "m5.4xlarge"  # Default: m5.4xlarge
   pulumi config set vpcNetworkCidr "10.0.0.0/16"     # Default: 10.0.0.0/16
   ```

3. **Deploy to AWS:**
   ```bash
   pulumi up
   # ✅ Creates EKS cluster with managed node groups
   # ✅ Configures auto-scaling and load balancing
   # ✅ Sets up OpenAI integration
   # ✅ Deploys agent platform services
   # ✅ Provides cluster access credentials
   ```

4. **Access your cluster:**
   ```bash
   # Configure kubectl
   aws eks update-kubeconfig --name $(pulumi stack output clusterName) --region $(pulumi config get aws:region)
   
   # Verify nodes are ready
   kubectl get nodes
   
   # Check deployed agent services
   kubectl get pods -n agent-platform
   ```

## Your AI Agent Applications

The golden path includes pre-configured agent platform services you can build upon:

### OpenAI Chat Agent
```yaml
# Example: Deploy a customer service agent
apiVersion: apps/v1
kind: Deployment
metadata:
  name: customer-service-agent
  namespace: agent-platform
spec:
  replicas: 2
  selector:
    matchLabels:
      app: customer-service-agent
  template:
    spec:
      containers:
      - name: agent
        image: your-registry/customer-service-agent:latest
        ports:
        - containerPort: 8080
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: openai-secret
              key: api-key
        - name: AGENT_ROLE
          value: "customer-service"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

### Agent Service with Load Balancing
```yaml
# Service for external access to your agents
apiVersion: v1
kind: Service
metadata:
  name: agent-service
  namespace: agent-platform
spec:
  selector:
    app: customer-service-agent
  ports:
  - port: 80
    targetPort: 8080
  type: LoadBalancer
```

## Development Workflow

### Local Agent Development
```bash
# Test your agent locally first
npm install openai express

# Example: Simple agent server
node -e "
const express = require('express');
const { OpenAI } = require('openai');

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());

app.post('/chat', async (req, res) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: req.body.messages
  });
  res.json(response.choices[0].message);
});

app.listen(8080, () => console('Agent running on port 8080'));
"
```

### Deploy to EKS Cluster
```bash
# Build and push your agent container
docker build -t your-registry/your-agent:latest .
docker push your-registry/your-agent:latest

# Deploy to cluster
kubectl apply -f your-agent-deployment.yaml

# Scale based on demand
kubectl scale deployment your-agent --replicas=5

# Monitor agent performance
kubectl top pods -n agent-platform
```

### Monitor AI Agents
```bash
# Check agent pod status
kubectl get pods -n agent-platform -o wide

# View agent logs and conversations
kubectl logs -f deployment/customer-service-agent

# Monitor OpenAI API usage
kubectl port-forward service/monitoring-service 3000:3000
```

## What's Under the Hood (You Don't Need to Know This)

The golden path creates sophisticated AWS infrastructure:

**EKS Infrastructure:**
- Managed EKS cluster with API endpoint access
- Auto-scaling node groups (3-6 nodes by default)
- VPC with public and private subnets
- Security groups with minimal required access
- IAM roles with least-privilege permissions

**Agent Platform Services:**
```typescript
// OpenAI integration with secret management
const openaiSecret = new k8s.core.v1.Secret("openai-secret", {
    metadata: { 
        name: "openai-secret",
        namespace: "agent-platform" 
    },
    data: {
        "api-key": config.requireSecret("open-ai-token")
    }
});

// Agent platform namespace
const agentNamespace = new k8s.core.v1.Namespace("agent-platform", {
    metadata: { name: "agent-platform" }
});
```

**Compute Optimization:**
- m5.4xlarge instances (16 vCPU, 64GB RAM) for AI processing
- CPU-optimized for natural language processing workloads
- Memory-efficient for conversation state management
- Network-optimized for OpenAI API calls

## Customizing Your Agent Platform

### Instance Types and Scaling
```bash
# Use compute-optimized instances for heavy AI workloads
pulumi config set eksNodeInstanceType "c5.4xlarge"

# Increase cluster size for high-traffic agents
pulumi config set maxClusterSize 10

# Deploy changes
pulumi up
```

### Add Custom Agent Types
```yaml
# support-agent.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: support-agent
  namespace: agent-platform
spec:
  template:
    spec:
      containers:
      - name: agent
        image: your-registry/support-agent:latest
        env:
        - name: AGENT_SPECIALTY
          value: "technical-support"
        - name: KNOWLEDGE_BASE_URL
          value: "https://your-kb.com/api"
---
# Auto-scaling for support agents
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: support-agent-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: support-agent
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Network Configuration
```bash
# Use custom VPC CIDR for network isolation
pulumi config set vpcNetworkCidr "172.16.0.0/16"

# Deploy with updated networking
pulumi up
```

## Common AI Agent Patterns

### Multi-Agent Conversations
```yaml
# Agent orchestrator for routing conversations
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agent-orchestrator
spec:
  template:
    spec:
      containers:
      - name: orchestrator
        image: your-registry/agent-orchestrator:latest
        env:
        - name: ROUTING_STRATEGY
          value: "intent-based"
        - name: FALLBACK_AGENT
          value: "general-assistant"
```

### Stateful Conversation Management
```yaml
# Redis for conversation state
apiVersion: apps/v1
kind: Deployment
metadata:
  name: conversation-state
spec:
  template:
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        volumeMounts:
        - name: redis-storage
          mountPath: /data
      volumes:
      - name: redis-storage
        persistentVolumeClaim:
          claimName: redis-pvc
```

### Agent Analytics and Monitoring
```bash
# Deploy monitoring stack for agents
kubectl apply -f monitoring/prometheus-agent-metrics.yaml
kubectl apply -f monitoring/grafana-agent-dashboards.yaml

# View agent performance dashboard
kubectl port-forward service/grafana 3000:3000
```

## Agent Development Best Practices

### Conversation Flow Design
```javascript
// Example: Intent-based agent routing
class AgentRouter {
    async routeMessage(message, context) {
        const intent = await this.classifyIntent(message);
        
        switch(intent) {
            case 'technical-support':
                return await this.techSupportAgent.handle(message, context);
            case 'sales-inquiry':
                return await this.salesAgent.handle(message, context);
            case 'general-question':
                return await this.generalAgent.handle(message, context);
            default:
                return await this.fallbackAgent.handle(message, context);
        }
    }
}
```

### Error Handling and Fallbacks
```javascript
// Example: Graceful degradation
class ResilientAgent {
    async processMessage(message) {
        try {
            return await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: message
            });
        } catch (error) {
            if (error.type === 'rate_limit_error') {
                // Fall back to cached responses or simpler model
                return await this.fallbackResponse(message);
            }
            throw error;
        }
    }
}
```

### Performance Optimization
```yaml
# Resource limits for efficient scaling
resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"
# Readiness and liveness probes
readinessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 10
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30
```

## Monitoring Your AI Agents

### Agent Performance Metrics
```bash
# View agent response times and success rates
kubectl top pods -n agent-platform

# Check OpenAI API usage and costs
kubectl logs deployment/cost-monitoring -n agent-platform

# Monitor conversation quality scores
kubectl port-forward service/analytics-dashboard 8080:8080
```

### Conversation Analytics
```bash
# View conversation logs
kubectl logs -f deployment/your-agent -n agent-platform

# Export conversation data for analysis
kubectl exec -it deployment/analytics-service -- \
  python export_conversations.py --date-range="7d"
```

### Cost Monitoring
- **OpenAI Usage Dashboard**: Track API calls and token consumption
- **AWS Cost Explorer**: Monitor EKS cluster and compute costs
- **Agent Efficiency Metrics**: Measure responses per dollar spent

## FAQ for AI Teams

**Q: What types of AI agents can I deploy?**  
A: Any conversational AI: customer service, sales assistants, technical support, chatbots, and multi-agent systems.

**Q: How do I manage conversation state?**  
A: Use Redis or database storage. The platform provides persistent volumes and StatefulSets for state management.

**Q: Can I use other AI providers besides OpenAI?**  
A: Yes. Modify the secret configuration and agent code to use Anthropic, Cohere, or local models.

**Q: How do I handle high conversation volumes?**  
A: The cluster auto-scales based on CPU usage. Configure HorizontalPodAutoscaler for your agent deployments.

**Q: What about conversation privacy and compliance?**  
A: Implement encryption at rest and in transit. Use Kubernetes secrets for sensitive data and configure appropriate network policies.

**Q: How do I A/B test different agent versions?**  
A: Use Kubernetes canary deployments or service mesh tools like Istio for traffic splitting between agent versions.

## Supported AI Integration Patterns

This golden path supports:
- **OpenAI GPT Models**: GPT-3.5, GPT-4, and fine-tuned models
- **Multi-Agent Systems**: Agent orchestration and conversation routing
- **Conversation Memory**: Stateful agents with context retention
- **External Integrations**: APIs, databases, and knowledge bases
- **Real-time Processing**: WebSocket support for live conversations
- **Batch Processing**: Async agent tasks and background processing

## Support

**Getting Help:**
- **Platform Team**: Your first point of contact for golden path issues
- **AWS EKS Documentation**: https://docs.aws.amazon.com/eks/
- **Pulumi Docs**: https://www.pulumi.com/docs/
- **OpenAI API Docs**: https://platform.openai.com/docs

**Common Issues:**
- **Agent pods pending**: Check node capacity and resource requests
- **OpenAI rate limits**: Implement exponential backoff and request queuing
- **High costs**: Monitor token usage and implement conversation length limits
- **Slow responses**: Optimize prompts and consider agent caching strategies

## Next Steps

1. **Deploy your first agent** using the pre-configured OpenAI integration
2. **Implement conversation flows** for your specific use cases
3. **Set up monitoring** for agent performance and user satisfaction
4. **Configure auto-scaling** based on conversation volume patterns  
5. **Add agent analytics** for continuous improvement and optimization

Your platform team may provide additional golden paths for vector databases, knowledge bases, and advanced AI workflows to complement this agent infrastructure foundation.