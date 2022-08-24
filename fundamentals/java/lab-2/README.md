# Lab 2: Resources, Resource Providers, and Language Hosts

Let's talk about resources, resource providers, and language hosts. Learn more on the [Learn pathway](https://www.pulumi.com/learn/pulumi-fundamentals/create-docker-images/) if you're walking through this workshop alone!

## Verify your application

The application we'll be running on our infrastructure is in the [pulumi/tutorial-pulumi-fundamentals repo](https://github.com/pulumi/tutorial-pulumi-fundamentals) in the `app/` directory. Examine the Dockerfiles in each directory.

<details>
<summary><b>Question:</b> What's the Dockerfile in the `backend` directory doing?</summary>

<br/>
<b>Answer:</b> This Dockerfile copies the REST backend into the Docker filesystem, installs the dependencies, and builds the image. Note that port 3000 must be open on your host machine.
</details>
<br/>

## Build your Docker Image with Pulumi

We'll be using Gradle, and we need the right providers. Let’s modify our `build.gradle` file in the `app/` directory:

```groovy
plugins {
    id 'application'
}

repositories {
    maven { // The google mirror is less flaky than mavenCentral()
        url("https://maven-central.storage-download.googleapis.com/maven2/")
    }
    mavenCentral()
    mavenLocal()
}

var pulumiJavaSdkVersion = System.getenv("PULUMI_JAVA_SDK_VERSION") ?: "0.1.0"
var pulumiDockerSdkVersion = System.getenv("PULUMI_DOCKER_PROVIDER_SDK_VERSION") ?: "3.2.0"

dependencies {
    implementation "com.pulumi:pulumi:$pulumiJavaSdkVersion"
    implementation "com.pulumi:docker:$pulumiDockerSdkVersion"
}

application {
    mainClass = project.hasProperty("mainClass")
            ? project.getProperty("mainClass")
            : 'my_first_app.App'
}
```


Our main program file is `App.java`. Add the following code:

```java
package my_first_app;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.docker.RemoteImage;
import com.pulumi.docker.RemoteImageArgs;

import java.util.List;

public class App {
    public static void main(String[] args) {
        Pulumi.run(App::stack);
    }

    private static void stack(Context ctx) {

        final var stackName = ctx.stackName();

        final String backendImageName = "backend";
        var backendImage = new RemoteImage(
                backendImageName,
                RemoteImageArgs.builder()
                        .name(String.format("pulumi/tutorial-pulumi-fundamentals-%s:latest",backendImageName))
                        .build()
        );
    }
}
```

Now, run the following command:

```bash
pulumi up
```

<details>
<summary><b>Question:</b> Explore the output. What do you think it means?</summary>

<br/>
<b>Answer:</b> Pulumi builds a Docker image for you with a preview.
</details>

If you're following along live, now we'll talk about _inputs_ and _outputs_. If you're reading this later and need a review, check out the [relevant part of the Learn pathway](https://www.pulumi.com/learn/pulumi-fundamentals/create-docker-images/)!

Now that we've provisioned our first piece of infrastructure, let's add the other pieces of our application.

## Add the frontend client and MongoDB

Our application includes a frontend client and MongoDB. Let's add them to the program:

```java
final String frontendImageName = "frontend";
var frontendImage = new RemoteImage(
        frontendImageName,
        RemoteImageArgs.builder()
                .name(String.format("pulumi/tutorial-pulumi-fundamentals-%s:latest",frontendImageName))
                .build()
);

var mongoImage = new RemoteImage(
        "mongoImage",
        RemoteImageArgs.builder()
                .name("pulumi/tutorial-pulumi-fundamentals-database-local:latest")
                .build()
);
```

We build the frontend client and the populated MongoDB database image the same way we built the backend.

Compare your program now to this complete program before we move forward:

```java
package my_first_app;

import com.pulumi.Context;
import com.pulumi.Pulumi;
import com.pulumi.docker.RemoteImage;
import com.pulumi.docker.RemoteImageArgs;

import java.util.List;

public class App {
    public static void main(String[] args) {
        Pulumi.run(App::stack);
    }

    private static void stack(Context ctx) {

        final var stackName = ctx.stackName();

        final String backendImageName = "backend";
        var backendImage = new RemoteImage(
                backendImageName,
                RemoteImageArgs.builder()
                        .name(String.format("pulumi/tutorial-pulumi-fundamentals-%s:latest",backendImageName))
                        .build()
        );

        final String frontendImageName = "frontend";
        var frontendImage = new RemoteImage(
                frontendImageName,
                RemoteImageArgs.builder()
                        .name(String.format("pulumi/tutorial-pulumi-fundamentals-%s:latest",frontendImageName))
                        .build()
        );

        var mongoImage = new RemoteImage(
                "mongoImage",
                RemoteImageArgs.builder()
                        .name("pulumi/tutorial-pulumi-fundamentals-database-local:latest")
                        .build()
        );
    }
}
```

If your code looks the same, great! Otherwise, update yours to match this code.

Now, run `pulumi up` to build all of the images that we'll need.

<details>
<summary><b>Question:</b> Do you think you need to run this command in stages?</summary>

<br/>
<b>Answer:</b> Nope! You can write the entire program and then run it. We're only doing a step-by-step process here to make learning easier.
</details>

Let's head to [lab 3](../lab-3/).
