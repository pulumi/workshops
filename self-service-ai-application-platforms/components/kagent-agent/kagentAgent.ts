import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

export class KAgentAgentComponent extends pulumi.ComponentResource {
    constructor(name: string, args: KAgentAgentComponentArgs, opts?: pulumi.ResourceOptions) {
        super("component-agent:index:KAgentAgentComponent", name, {}, opts);

        if (args.modelConfig.create) {
            new k8s.apiextensions.CustomResource("qwen3-coder-30b-a3b-instruct", {
                apiVersion: "kagent.dev/v1alpha2",
                kind: "ModelConfig",
                metadata: {
                    name: args.modelConfig.name,
                    namespace: args.modelConfig.namespace || "kagent",
                },
                spec: {
                    apiKeySecret: args.modelConfig.apiKeySecret,
                    apiKeySecretKey: args.modelConfig.apiKeySecretKey,
                    model: args.modelConfig.model,
                    provider: args.modelConfig.provider,
                    openAI: args.modelConfig.openAI,
                },
            }, {parent: this});
        }

        let agentSpecTools: any[] = [];

        for (const tool of args.tools || []) {
            agentSpecTools.push({
                mcpServer: {
                    apiGroup: "kagent.dev",
                    kind: "RemoteMCPServer",
                    name: tool?.name,
                    toolNames: tool.toolNames || [],
                },
                type: "McpServer",
            });
        }

        let a2aSkillTools: any[] = [];
        for (const skill of args.a2aSkills || []) {
            a2aSkillTools.push({
                id: skill.id,
                name: skill.name,
                description: skill.description,
                inputModes: skill.inputModes,
                outputModes: skill.outputModes,
                tags: skill.tags,
                examples: skill.examples,
            });
        }

        const agent = new k8s.apiextensions.CustomResource("my-first-k8s-agent", {
            apiVersion: "kagent.dev/v1alpha2",
            kind: "Agent",
            metadata: {
                name: args.agentName,
                namespace: args.namespaceName || "kagent",
            },
            spec: {
                description: args.description,
                type: args.agentType || "Declarative",
                declarative: {
                    modelConfig: args.modelConfig.name,
                    systemMessage: args.systemMessage,
                    tools: agentSpecTools,
                    a2aConfig: {
                        skills: a2aSkillTools,
                    }
                },
            },
        }, {parent: this});


    }
}

export interface OpenAIConfig {
    /**
     * (Optional) The base URL for the OpenAI API. Defaults to "https://api.openai.com/v1".
     */
    baseUrl?: pulumi.Input<string>;
}

export interface ModelConfig {
    /**
     * The name of the model configuration.
     */
    name: pulumi.Input<string>;

    /**
     * Whether to create the model configuration in the cluster or refer to an existing one.
     */
    create: pulumi.Input<boolean>;

    /**
     * (Optional) The namespace where the model configuration will be created.
     */
    namespace?: pulumi.Input<string>;

    /**
     * (Optional) The provider of the model (e.g., OpenAI, HuggingFace).
     */
    provider?: pulumi.Input<string>;

    /**
     * (Optional) The model identifier (e.g., model name or path).
     */
    model?: pulumi.Input<string>;

    /**
     * (Optional) The name of the Kubernetes secret containing the API key.
     */
    apiKeySecret?: pulumi.Input<string>;

    /**
     * (Optional) The key within the secret that holds the API key.
     */
    apiKeySecretKey?: pulumi.Input<string>;

    /**
     * (Optional) Additional configuration specific to the provider.
     */
    openAI?: OpenAIConfig;
}

export interface MCPServerTool {
    /**
     * The name of the MCP server resource.
     */
    name: pulumi.Input<string>;

    /**
     * (Optional) The tool names to be used from the MCP server.
     */
    toolNames?: pulumi.Input<pulumi.Input<string>[]>;
}

export interface A2ASkill {
    /**
     * The unique identifier for the skill.
     */
    id: pulumi.Input<string>;
    /**
     * The name of the skill.
     */
    name: pulumi.Input<string>;
    /**
     * A brief description of the skill's functionality.
     */
    description: pulumi.Input<string>;
    /**
     * The input modes supported by the skill (e.g., text, image).
     */
    inputModes: pulumi.Input<pulumi.Input<string>[]>;
    /**
     * The output modes supported by the skill (e.g., text, image).
     */
    outputModes: pulumi.Input<pulumi.Input<string>[]>;
    /**
     * Tags associated with the skill for categorization and searchability.
     */
    tags: pulumi.Input<pulumi.Input<string>[]>;
    /**
     * Example inputs or prompts that demonstrate the skill's capabilities.
     */
    examples: pulumi.Input<pulumi.Input<string>[]>;
}

export interface KAgentAgentComponentArgs {
    /**
     * The name of the KAgent agent.
     */
    agentName: pulumi.Input<string>;

    /**
     * (Optional) The namespace in which to deploy the KAgent agent. If not provided, defaults to "kagent".
     */
    namespaceName?: pulumi.Input<string>;

    /**
     * The model configuration to use for the KAgent agent.
     */
    modelConfig: ModelConfig;

    /**
     * A brief description of the agent's purpose and capabilities.
     */
    description: pulumi.Input<string>;

    /**
     * The system message to initialize the agent's behavior and context.
     */
    systemMessage: pulumi.Input<string>;

    /**
     * AgentType represents the agent type to be used by the kagent agent. If not provided, defaults to "Declarative".
     */
    agentType?: pulumi.Input<string>

    /**
     * (Optional) The tools to be used by the KAgent agent from the MCP server. If not provided, defaults to an empty array.
     */
    tools?: MCPServerTool[];

    /**
     * (Optional) The A2A skills to be used by the KAgent agent. If not provided, defaults to an empty array.
     */
    a2aSkills?: A2ASkill[];
}
