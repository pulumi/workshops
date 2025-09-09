# KAgent Template Golden Path

A **golden path** template that gets your conversational AI agents from concept to production in minutes, not weeks.

## What You Get

This golden path provides everything your development team needs to deploy production-ready conversational AI agents:

✅ **Pre-configured KAgent framework** - Industry-standard agent orchestration platform  
✅ **Agent personality templates** - Ready-to-use agent behaviors and conversation styles  
✅ **A2A Skills integration** - Advanced agent-to-agent communication capabilities  
✅ **Declarative configuration** - Simple YAML-based agent definition  
✅ **One-command deployment** - `pulumi up` handles everything  
✅ **No complex setup required** - Abstract away agent platform complexity  

## For Development Teams: What to Expect

### Your Experience

**Day 1: Getting Started**
- Clone this template, customize the agent personality, run `pulumi up`
- Your conversational AI agent is live and ready for interactions in 5 minutes
- Pre-configured pirate personality agent as a working example

**Day 2-N: Development Workflow**
- Modify agent personality and conversation patterns
- Add custom skills and capabilities
- Deploy agent updates instantly
- Focus on agent behavior, not infrastructure

**Production Agent Operations**
- Scalable agent deployment across multiple environments
- Built-in monitoring and conversation logging
- Integration with existing AI model infrastructure
- Agent-to-agent communication for complex workflows

### What's Handled For You

You **don't** need to learn or configure:
- KAgent platform installation and setup
- Agent lifecycle management
- Model configuration and integration
- Conversation state management
- Agent deployment orchestration
- Monitoring and observability setup

You **do** focus on:
- Defining agent personality and behavior
- Creating conversation flows and responses
- Building domain-specific skills
- Testing agent interactions and performance

## Quick Start (5 minutes)

1. **Clone and customize:**
   ```bash
   git clone <this-repo>
   cd kagent-template
   ```

2. **Customize your agent:**
   Edit the `Pulumi.yaml` file to define your agent:
   ```yaml
   resources:
     yourAgent:
       type: kagent-agent:KAgentAgentComponent
       properties:
         agentName: customer-support-agent
         description: A helpful customer support agent.
         systemMessage: You are a professional customer support agent. You are helpful, polite, and knowledgeable about our products.
         a2aSkills:
         - id: handle-complaints
           name: Handle Customer Complaints
           description: Professionally handle customer complaints and escalate when needed.
           examples:
           - "I understand your frustration. Let me help resolve this issue."
           - "I'll escalate this to our technical team right away."
   ```

3. **Deploy to production:**
   ```bash
   pulumi up
   # ✅ Creates KAgent agent resource
   # ✅ Configures agent personality and skills
   # ✅ Deploys agent to platform
   # ✅ Provides agent endpoint URL
   ```

4. **Test your agent:**
   ```bash
   # Get agent details
   pulumi stack output agentInfo
   
   # Test via API or web interface
   curl -X POST "https://your-agent-endpoint/chat" \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello, I need help with my order"}'
   ```

## Your Agent Configuration

The template includes a complete pirate personality agent you can customize:

### Agent Personality Definition
```yaml
# Agent core configuration
agentName: pirate-agent
description: An agent that speaks like a pirate.
systemMessage: You are a pirate. You speak like a pirate. You love treasure and adventure.

# Model configuration (uses shared model config)
modelConfig:
  create: false
  name: default-model-config
```

### Agent Skills (A2A Capabilities)
```yaml
# Agent-to-Agent skills for complex interactions
a2aSkills:
- id: speak-like-a-pirate
  name: Speak Like a Pirate
  tags:
  - pirate
  description: Speak like a pirate.
  inputModes:
  - text
  outputModes:
  - text
  examples:
  - "Ahoy, how be ye?"
  - "I be doin' well, matey!"
  - "Where be the treasure?"
  - "Let's set sail for adventure!"
```

## Development Workflow

### Local Agent Testing
```yaml
# Create a test agent configuration
testAgent:
  type: kagent-agent:KAgentAgentComponent
  properties:
    agentName: test-agent
    description: A test agent for development.
    systemMessage: You are a test agent. Help users test functionality.
    a2aSkills:
    - id: test-responses
      name: Test Responses
      description: Provide test responses for validation.
      examples:
      - "This is a test response."
      - "Testing functionality works correctly."
```

### Agent Updates
```bash
# Modify agent configuration in Pulumi.yaml
vim Pulumi.yaml

# Deploy updated agent
pulumi up

# The agent automatically updates with new personality/skills
```

### Multi-Agent Deployment
```yaml
# Deploy multiple specialized agents
resources:
  salesAgent:
    type: kagent-agent:KAgentAgentComponent
    properties:
      agentName: sales-agent
      systemMessage: You are a sales representative. You're enthusiastic and knowledgeable about products.
  
  supportAgent:
    type: kagent-agent:KAgentAgentComponent  
    properties:
      agentName: support-agent
      systemMessage: You are technical support. You solve problems methodically and clearly.
```

## What's Under the Hood (You Don't Need to Know This)

The golden path uses the **KAgent Component** framework:

**KAgent Architecture:**
- Agent orchestration platform for conversational AI
- Built-in model integration and management
- Agent-to-agent communication protocols
- Scalable deployment across environments

**Component Integration:**
```yaml
# The template uses the kagent-agent component
packages:
  kagent-agent: https://github.com/pulumi/workshops/self-service-ai-application-platforms/components/kagent-agent@0.4.0

# Component creates all necessary resources:
# - Agent runtime environment
# - Conversation state management
# - Model binding and configuration
# - A2A skill registration
```

**Why This Matters:**
- **Consistency** - All agents follow the same deployment patterns
- **Scalability** - Built on proven agent orchestration platform
- **Maintainability** - Component updates improve all deployed agents
- **Simplicity** - Declarative YAML configuration, no complex code

## Customizing Your Agent

### Agent Personalities
```yaml
# Professional business agent
businessAgent:
  properties:
    agentName: business-advisor
    systemMessage: You are a business advisor. You provide strategic insights and professional guidance.
    a2aSkills:
    - id: strategic-analysis
      name: Strategic Analysis
      description: Analyze business situations and provide recommendations.

# Creative writing agent  
creativeAgent:
  properties:
    agentName: creative-writer
    systemMessage: You are a creative writer. You help with storytelling and creative content.
    a2aSkills:
    - id: story-generation
      name: Story Generation
      description: Generate creative stories and narratives.
```

### Advanced Skills Configuration
```yaml
# Complex skill with multiple modes
advancedSkill:
  a2aSkills:
  - id: multi-modal-analysis
    name: Multi-Modal Analysis
    tags:
    - analysis
    - multi-modal
    description: Analyze content across text, image, and audio inputs.
    inputModes:
    - text
    - image
    - audio
    outputModes:
    - text
    - structured-data
    examples:
    - "I can analyze this image and provide insights."
    - "Based on the audio, I detect sentiment and key topics."
```

### Model Configuration
```yaml
# Custom model configuration
resources:
  customModelAgent:
    type: kagent-agent:KAgentAgentComponent
    properties:
      modelConfig:
        create: true
        name: custom-model-config
        # Model-specific parameters would be defined here
```

## Common Agent Patterns

### Customer Service Agent
```yaml
customerServiceAgent:
  type: kagent-agent:KAgentAgentComponent
  properties:
    agentName: customer-service
    description: Handles customer inquiries and support requests.
    systemMessage: You are a customer service representative. You are helpful, professional, and empathetic.
    a2aSkills:
    - id: order-lookup
      name: Order Lookup
      description: Look up customer orders and provide status updates.
    - id: issue-escalation
      name: Issue Escalation  
      description: Escalate complex issues to appropriate teams.
```

### Sales Assistant Agent
```yaml
salesAgent:
  type: kagent-agent:KAgentAgentComponent
  properties:
    agentName: sales-assistant
    description: Helps customers with product information and purchasing decisions.
    systemMessage: You are a sales assistant. You're knowledgeable about products and help customers make informed decisions.
    a2aSkills:
    - id: product-recommendations
      name: Product Recommendations
      description: Recommend products based on customer needs.
    - id: pricing-information
      name: Pricing Information
      description: Provide accurate pricing and availability information.
```

### Technical Support Agent
```yaml
technicalAgent:
  type: kagent-agent:KAgentAgentComponent
  properties:
    agentName: technical-support
    description: Provides technical assistance and troubleshooting.
    systemMessage: You are technical support. You solve technical problems step-by-step and provide clear instructions.
    a2aSkills:
    - id: troubleshooting
      name: Troubleshooting
      description: Guide users through technical problem resolution.
    - id: documentation-lookup
      name: Documentation Lookup
      description: Find and reference relevant technical documentation.
```

## Agent Testing and Validation

### Testing Agent Responses
```bash
# Test agent personality consistency
curl -X POST "https://agent-endpoint/test" \
  -d '{"scenario": "customer_complaint", "test_personality": true}'

# Validate A2A skill functionality
curl -X POST "https://agent-endpoint/skill-test" \
  -d '{"skill_id": "speak-like-a-pirate", "input": "Hello there!"}'
```

### Agent Monitoring
```bash
# View agent conversation logs
pulumi stack output --json | jq '.agentLogs'

# Monitor agent performance metrics
pulumi stack output --json | jq '.agentMetrics'
```

## FAQ for Development Teams

**Q: Can I deploy multiple agents with different personalities?**  
A: Yes. Define multiple agent resources in your `Pulumi.yaml` with different configurations.

**Q: How do I update an agent's personality?**  
A: Modify the `systemMessage` and `a2aSkills` in your configuration and run `pulumi up`.

**Q: Can agents communicate with each other?**  
A: Yes. The A2A (Agent-to-Agent) skills enable sophisticated inter-agent communication.

**Q: How do I integrate with my own AI models?**  
A: Configure the `modelConfig` section to specify custom model endpoints and parameters.

**Q: Can I version control agent configurations?**  
A: Yes. All agent definitions are in YAML files, perfect for git-based workflows.

**Q: How do I handle agent secrets and API keys?**  
A: Use Pulumi's secret management features to securely handle sensitive configuration.

## Supported Agent Capabilities

This template supports:
- **Conversational AI** - Natural language interactions
- **Multi-modal Input** - Text, image, and audio processing
- **Agent Skills** - Modular capabilities and behaviors  
- **A2A Communication** - Agent-to-agent coordination
- **Personality Consistency** - Maintained character across conversations
- **Skill Composition** - Combining multiple agent capabilities

## Support

**Getting Help:**
- **Platform Team** - Your first point of contact for golden path issues
- **KAgent Documentation** - https://github.com/kagent-dev/kagent
- **Pulumi Docs** - https://www.pulumi.com/docs/
- **Component Issues** - https://github.com/pulumi/workshops/self-service-ai-application-platforms

**Common Issues:**
- **Agent not responding** - Check model configuration and endpoint connectivity
- **Personality inconsistency** - Review systemMessage and skill examples
- **Skill registration errors** - Validate A2A skill schema and examples
- **Deployment failures** - Verify component version and resource configuration

## Next Steps

1. **Customize the pirate agent** with your desired personality and skills
2. **Deploy additional agents** for different use cases and domains
3. **Test agent interactions** and refine conversation patterns
4. **Set up monitoring** for agent performance and user satisfaction
5. **Integrate with applications** using the agent API endpoints

Your platform team may provide additional golden paths for model management, conversation analytics, and advanced agent orchestration to complement this agent deployment foundation.