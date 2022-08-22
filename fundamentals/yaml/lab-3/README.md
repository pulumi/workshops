# Lab 3: Putting it all together

Let's set up the application next.

## Configure the application

Add the following configuration variables to your Pulumi program. These statements go between the description and the resources.

```yaml
configuration:
  frontendPort:
    type: Integer
  backendPort:
    type: Integer
  mongoPort:
    type: Integer
variables:
  backendImageName: backend
  frontendImageName: frontend
```

Your Pulumi program should now match this code:

```yaml
name: fundamentals
runtime: yaml
description: a yaml test
configuration:
  frontendPort:
    type: Integer
  backendPort:
    type: Integer
  mongoPort:
    type: Integer
variables:
  backendImageName: backend
  frontendImageName: frontend
resources:
  backend-image:
    type: docker:index:RemoteImage
    properties:
      name: pulumi/tutorial-pulumi-fundamentals-backend:latest
  frontend-image:
    type: docker:index:RemoteImage
    properties:
      name: pulumi/tutorial-pulumi-fundamentals-frontend:latest
  mongo-image:
    type: docker:index:RemoteImage
    properties:
      name: pulumi/tutorial-pulumi-fundamentals-database-local:latest
```

Try and run your `pulumi up` again at this point.

<details>
<summary><b>Question:</b> What happened?</summary>

<br/>
<b>Answer:</b> We specified that the config options are <i>required</i>. Remember how we can use the same program to define multiple stacks? We need to set the various values for this specific stack before running an up.
</details>

<br/>
Use the `pulumi config set` command to set ports:

```bash
pulumi config set frontend_port 3001
pulumi config set backend_port 3000
pulumi config set mongo_port 27017
```

**Action:** Explore the new `Pulumi.dev.yaml` file.

Now, try and rerun your Pulumi program.

Let's add container resources.

## Create a Container resource

We need a new resource: a [`Network`](https://www.pulumi.com/registry/packages/docker/api-docs/network/). Add the following code at the bottom of your program:

```yaml
network:
    type: docker:index:Network
    properties:
      name: services-${pulumi.stack}
```

Define a new [`Container`](https://www.pulumi.com/registry/packages/docker/api-docs/container/) resource in your Pulumi program below the `Network` resource:

```yaml
backend-container:
    type: docker:index:Container
    properties:
      name: backend-${pulumi.stack}
      image: ${backend-image.repoDigest}
      ports:
        - internal: ${backendPort}
          external: ${backendPort}
      envs:
        [
          "DATABASE_HOST=${mongoHost}",
          "DATABASE_NAME=${database}",
          "NODE_ENV=${nodeEnvironment}"
        ]
      networksAdvanced:
        - name: ${network.name}
          aliases: ["backend-${pulumi.stack}"]
    options:
      dependsOn:
        - ${mongo-container}
```

<details>
<summary><b>Question:</b> How do we define an order of operations here so Pulumi knows to create dependent things after the independent things?</summary>

<br/>
<b>Answer:</b> We don't need to! Pulumi is a declarative IaC system, which means we just tell it what we want, and it figures out how to get everything done in order. Because we're referencing the <code>repoDigest</code> value from the <code>RemoteImage</code> resource in the creation of the <code>Container</code> resource, Pulumi knows that <code>RemoteImage</code> needs to be created first. In short, it can track the dependencies.
</details>
<br/>

We need some more environment variables:

```bash
pulumi config set mongoHost mongodb://mongo:27017
pulumi config set database cart
pulumi config set nodeEnvironment development
pulumi config set protocol http://
```

Add them to the top of our program with the rest of the configuration variables:

```yaml
mongoHost:
    type: String
  database:
    type: String
  nodeEnvironment:
    type: String
  protocol:
    type: String
```

Create `Container` resources for the frontend and mongo containers. Put the `mongo-container` declaration just above the `backend-container` one, and the `frontend-container` declaration at the end of the file. Here's the code for the mongo container:

```yaml
mongo-container:
    type: docker:index:Container
    properties:
      name: mongo-${pulumi.stack}
      image: ${mongo-image.repoDigest}
      ports:
        - internal: ${mongoPort}
          external: ${mongoPort}
      networksAdvanced:
        - name: ${network.name}
          aliases: ["mongo"]
```

And the code for the frontend container:

```yaml
frontend-container:
    type: docker:index:Container
    properties:
      name: frontend-${pulumi.stack}
      image: ${frontend-image.repoDigest}
      ports:
        - internal: ${frontendPort}
          external: ${frontendPort}
      envs:
        [
          "LISTEN_PORT=${frontendPort}",
          "HTTP_PROXY=backend-${pulumi.stack}:${backendPort}",
          "PROXY_PROTOCOL=http://"
        ]
      networksAdvanced:
        - name: ${network.name}
          aliases: ["frontend-${pulumi.stack}"]
```

Let's explore the whole program next.

## Put it all together

Now that we know how to create a container we can complete our program.

```yaml
name: fundamentals
runtime: yaml
description: a yaml test
configuration:
  frontendPort:
    type: Number
  backendPort:
    type: Number
  mongoPort:
    type: Number
  mongoHost:
    type: String
  database:
    type: String
  nodeEnvironment:
    type: String
  protocol:
    type: String
variables:
  backendImageName: backend
  frontendImageName: frontend
resources:
  backend-image:
    type: docker:index:RemoteImage
    properties:
      name: pulumi/tutorial-pulumi-fundamentals-backend:latest
  frontend-image:
    type: docker:index:RemoteImage
    properties:
      name: pulumi/tutorial-pulumi-fundamentals-frontend:latest
  mongo-image:
    type: docker:index:RemoteImage
    properties:
      name: pulumi/tutorial-pulumi-fundamentals-database-local:latest
  network:
    type: docker:index:Network
    properties:
      name: services-${pulumi.stack}
  mongo-container:
    type: docker:index:Container
    properties:
      name: mongo-${pulumi.stack}
      image: ${mongo-image.repoDigest}
      ports:
        - internal: ${mongoPort}
          external: ${mongoPort}
      networksAdvanced:
        - name: ${network.name}
          aliases: ["mongo"]
  backend-container:
    type: docker:index:Container
    properties:
      name: backend-${pulumi.stack}
      image: ${backend-image.repoDigest}
      ports:
        - internal: ${backendPort}
          external: ${backendPort}
      envs:
        [
          "DATABASE_HOST=${mongoHost}",
          "DATABASE_NAME=${database}",
          "NODE_ENV=${nodeEnvironment}"
        ]
      networksAdvanced:
        - name: ${network.name}
          aliases: ["backend-${pulumi.stack}"]
    options:
      dependsOn:
        - ${mongo-container}
  frontend-container:
    type: docker:index:Container
    properties:
      name: frontend-${pulumi.stack}
      image: ${frontend-image.repoDigest}
      ports:
        - internal: ${frontendPort}
          external: ${frontendPort}
      envs:
        [
          "LISTEN_PORT=${frontendPort}",
          "HTTP_PROXY=backend-${pulumi.stack}:${backendPort}",
          "PROXY_PROTOCOL=http://"
        ]
      networksAdvanced:
        - name: ${network.name}
          aliases: ["frontend-${pulumi.stack}"]

```

<details>
<summary><b>Question:</b> Why are we using image names to refer to the container?</summary>

<br/>
<b>Answer:</b> With Docker networking, we can use image names to refer to a container. In our example, the React frontend client sends requests to the Express backend client. The URL to the backend is set via the <code>setupProxy.js</code> file in the <code>app/frontend/src</code> directory with the <code>HTTP_PROXY</code> environment variable.
</details>
<br/>

Run `pulumi up`, and open a browser to `http://localhost:3001` to explore our application.

## Update the database

Let's try updating the database.

Open a terminal on your local machine, and run the following command:

```bash
curl --location --request POST 'http://localhost:3000/api/products' \
--header 'Content-Type: application/json' \
--data-raw '{
    "ratings": {
        "reviews": [],
        "total": 63,
        "avg": 5
    },
    "created": 1600979464567,
    "currency": {
        "id": "USD",
        "format": "$"
    },
    "sizes": [
        "M",
        "L"
    ],
    "category": "boba",
    "teaType": 2,
    "status": 1,
    "_id": "5f6d025008a1b6f0e5636bc7",
    "images": [
        {
            "src": "classic_boba.png"
        }
    ],
    "name": "My New Milk Tea",
    "price": 5,
    "description": "none",
    "productCode": "852542-107"
}'
```

You should get back the following response:

```json
{"status":"ok","data":{"product":{"ratings":{"reviews":[],"total":63,"avg":5},"created":1600979464567,"currency":{"id":"USD","format":"$"},"sizes":["M","L"],"category":"boba","teaType":2,"status":1,"_id":"5f6d025008a1b6f0e5636bc7","images":[{"_id":"62608f2a9ad5d90026847b0f","src":"classic_boba.png"}],"name":"My New Milk Tea","price":5,"description":"none","productCode":"852542-107","__v":0}}}
```

Open a browser to `http://localhost:3001`, and our data is now updated.

## Cleaning up

Always clean up with Pulumi when working with a sandbox environment:

```bash
$ pulumi destroy
```

Ensure you select `yes` when prompted to tear down your environment.
