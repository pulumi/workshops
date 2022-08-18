# Lab 02 - Create & Run a Docker Container

In this lab, we'll create our first Pulumi resource. We'll run a Docker container we build locally using infrastructure as code.

## Step 1 - Verify your Application

We have a preconfigured python webserver application in our repo. Take a look at `app/typescript/index.ts`

```typescript
import express = require('express');
import morgan = require('morgan');

const app: express.Application = express();
const listenPort = process.env["LISTEN_PORT"];

// defines a logger for output
app.use(morgan('combined'))

app.get('/', function(req, res) {
    res.send("Hello world!");
});

app.listen(listenPort, function() {
    console.log('Starting app on port' + listenPort);
})
```

This file creates a webserver with TypeScript, using the [morgan](https://www.npmjs.com/package/morgan) and [express](https://www.npmjs.com/package/express) packages.

Next, let's take a look at our `Dockerfile`

```
FROM node:12-buster-slim

WORKDIR /app

COPY *.json /app/
COPY index.ts /app/

RUN npm install && npm run env -- tsc index.ts
# use dumb-init so docker containers respect signals
RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_amd64 && chmod +x /usr/local/bin/dumb-init

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]
CMD [ "node", "index.js" ]
```

This `Dockerfile` takes care of running the `TypeScript` compile inside our Docker container, and then running our new webserver.

## Step 2 - Build your Docker Image with Pulumi

Back inside your pulumi program, let's build your Docker image. Inside your `index.ts` add the following:


```typescript                                                                                                                                                               
import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

const stack = pulumi.getStack();

const imageName = "my-first-app"

const image = new docker.Image('local-image', {
    build: '../app/typescript',
    imageName: `${imageName}:${stack}`,
    skipPush: true,
})
```

Make sure you install the `@pulumi/docker` provider:

```
npm install @pulumi/docker
```

You should see some output showing the npm package and the provider being installed

Run `pulumi up` and it should build your docker image

If you run `docker images` you should see your built container.

Now that we've provisioned our first piece of infrastructure, let's look at how we can use configuration in our Pulumi programs.

# Next Steps

* [Use configuration](../lab-03/README.md)
