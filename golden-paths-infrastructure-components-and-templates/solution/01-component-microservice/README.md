# MicroserviceComponent

Abstraction for resources needed when using AWS container services. 

A component to abstract the details related to:
- Creating a docker image and pushing it to AWS ECR.
- Deploy to ECS Fargate using the docker image. 

# Inputs

* appPath: Path to local folder containing the app and Dockerfile.
* port: Port to expose via an ALB.
* cpu (Optional): CPU capacity. Defaults to 256 (i.e. 0.25 vCPU).
* memory (Optional): Memory capacity. Defaults to 512 (i.e. 0.5GB).
* containerName (Optional): Name of the container. Defaults to "my-app".

# Outputs

* publicUrl: The DNS name for the loadbalancer fronting the app.

# Usage
## Specify Package in `Pulumi.yaml`

Add the following to your `Pulumi.yaml` file:
Note: If no version is specified, the latest version will be used.

```
packages:
  component-microservice: https://github.com/smithrobs/component-microservice[@v1.0.0]
``` 

## Use SDK in Program

### Python
```
from smithrobs_component_microservice import MicroserviceComponent, MicroserviceComponentArgs

svc = MicroserviceComponent(f"my-svc", MicroserviceComponentArgs(  
  app_path="./app",
  port=8080,
))
```

### Typescript
```
import { MicroserviceComponent } from "@smithrobs/component-microservice";

const svc = new MicroserviceComponent("my-svc", {appPath: "./app", port: 8080})
```

### Dotnet
```
using Smithrobs.MicroserviceComponent;

var svc = new MicroserviceComponent("my-svc", { AppPath: "./app", Port: 8080 });
```

### YAML
```
  microserviceComponent:
    type: component-microservice:MicroserviceComponent
    properties:
      appPath: ./app
      port: 8080
```