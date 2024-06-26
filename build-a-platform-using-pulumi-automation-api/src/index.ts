import express from "express"
import * as dotevnv from "dotenv"
import cors from "cors"
import helmet from "helmet"
import {fullyQualifiedStackName, RemoteWorkspace} from "@pulumi/pulumi/automation";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

dotevnv.config()

if (!process.env.PORT) {
    console.log(`No port value specified...`)
}

const PORT = parseInt(process.env.PORT as string, 10)

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())
app.use(helmet())

// Define the payload interface
interface ServicePayload {
    name: string;
    org: string;
    project: string;
    stack: string;
    region: string;
}

// Define a helper function to set up the Pulumi program
async function setUpPulumiProgram(payload: ServicePayload) {
    const org = payload.org;
    const project = payload.project;
    const stackName = fullyQualifiedStackName(org, project, payload.stack);
    const awsRegion = payload.region;

    // Using the Pulumi Automation API to create or select a stack in the remote workspace
    // and set the stack's configuration and secrets. This will use Pulumi Deployments to
    // deploy the stack to the specified AWS region.
    return await RemoteWorkspace.createOrSelectStack({
        stackName,
        url: "https://github.com/pulumi/examples.git",
        branch: "refs/heads/master",
        projectPath: project,
    }, {
        envVars: {
            AWS_REGION: awsRegion,
            AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ?? "",
            AWS_SECRET_ACCESS_KEY: {secret: process.env.AWS_SECRET_ACCESS_KEY ?? ""},
            AWS_SESSION_TOKEN: {secret: process.env.AWS_SESSION_TOKEN ?? ""},
        },
    });
}

// Define the API endpoint for creating a new stack in the remote workspace.
app.post('/', async (req, res) => {
    const payload: ServicePayload = req.body;

    if (!payload.name || !payload.org || !payload.project || !payload.stack || !payload.region) {
        res.status(400).send('Name, org, project, stack and region are required');
        return;
    }
    // Create a new stack in the remote workspace and set the stack's configuration and secrets.
    const stack = await setUpPulumiProgram(payload);

    // Deploy the stack to the specified AWS region. We'll print the stack's outputs to the console.
    const upRes = await stack.up({onOutput: console.log});
    res.status(200).send(`url: ${upRes.outputs.websiteUrl.value}`);
});

// Define the API endpoint for destroying a stack in the remote workspace.
app.delete('/', async (req, res) => {
    const {name, org, project, stack, region} = req.query;

    if (!name || !org || !project || !stack || !region) {
        res.status(400).send('Name, org, project, stack, and region are required');
        return;
    }

    const payload: ServicePayload = {
        name: name as string,
        org: org as string,
        project: project as string,
        stack: stack as string,
        region: region as string
    }

    // Define the stack and set the stack's configuration and secrets.
    const prog = await setUpPulumiProgram(payload);
    // Destroy the stack in the remote workspace. We'll print the stack's outputs to the console.
    await prog.destroy({onOutput: console.log});
    res.status(200).send('Stack destroyed');
});

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'My Organization Service API',
            description: 'API for creating and destroying a specific piece of infrastructure',
            version: '1.0.0'
        },
        servers: [
            {
                url: 'http://localhost:8080/',
                description: 'Development server'
            }
        ],
        paths: {
            '/': {
                post: {
                    summary: 'Create Infrastructure',
                    operationId: 'createInfrastructure',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ServicePayload'
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Infrastructure successfully created',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            url: {
                                                type: 'string',
                                                description: 'URL of the created infrastructure'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '400': {
                            description: 'Bad request if the input payload is incorrect'
                        },
                        '500': {
                            description: 'Internal server error'
                        }
                    }
                },
                delete: {
                    summary: 'Destroy Infrastructure',
                    operationId: 'destroyInfrastructure',
                    parameters: [
                        {
                            in: 'query',
                            name: 'name',
                            schema: {
                                type: 'string'
                            },
                            required: true,
                            description: 'Name of the service'
                        },
                        {
                            in: 'query',
                            name: 'org',
                            schema: {
                                type: 'string'
                            },
                            required: true,
                            description: 'Organization in Pulumi'
                        },
                        {
                            in: 'query',
                            name: 'project',
                            schema: {
                                type: 'string'
                            },
                            required: true,
                            description: 'Project name in Pulumi'
                        },
                        {
                            in: 'query',
                            name: 'stack',
                            schema: {
                                type: 'string'
                            },
                            required: true,
                            description: 'Stack name in Pulumi'
                        },
                        {
                            in: 'query',
                            name: 'region',
                            schema: {
                                type: 'string'
                            },
                            required: true,
                            description: 'AWS region where the service will be deployed'
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'Infrastructure successfully destroyed',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            message: {
                                                type: 'string',
                                                description: 'Confirmation message of the destruction'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '400': {
                            description: 'Bad request if the required parameters are missing'
                        },
                        '500': {
                            description: 'Internal server error'
                        }
                    }
                }
            }
        },
        components: {
            schemas: {
                ServicePayload: {
                    type: 'object',
                    required: [
                        'name',
                        'org',
                        'project',
                        'stack',
                        'region'
                    ],
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Name of the service'
                        },
                        org: {
                            type: 'string',
                            description: 'Organization in Pulumi'
                        },
                        project: {
                            type: 'string',
                            description: 'Project name in Pulumi'
                        },
                        stack: {
                            type: 'string',
                            description: 'Stack name in Pulumi'
                        },
                        region: {
                            type: 'string',
                            description: 'AWS region where the service will be deployed'
                        }
                    }
                }
            }
        }
    },
    apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs)
);


app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})
