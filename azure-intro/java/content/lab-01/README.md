# Creating a New Project

Infrastructure in Pulumi is organized into projects. Each project is a single program that, when run, declares the desired infrastructure for Pulumi to manage.

## Step 1 &mdash; Create a Directory

Each Pulumi project lives in its own directory. From the root of this repository, create a new directory and change into it:

```bash
mkdir my-first-azure-app && cd my-first-azure-app
```

## Step 2 &mdash; Initialize Your Project

A Pulumi project is just a directory with some files in it. It's possible for you to create a new one by hand. The `pulumi new` command, however, automates the process:

```bash
pulumi new java -y
```

This command has created all the files we need, initialized a new stack named `dev` (an instance of our project), and installed the needed package dependencies from Maven.

## Step 3 &mdash; Inspect Your New Project

Our project is comprised of multiple files:

* **`src/main/java/myproject/App.java`**: your program's main entry point
* **`pom.xml`**: your project's Maven dependency information
* **`Pulumi.yaml`**: your project's metadata, containing its name and language
* **`target/`**: a directory containing your project's built artifacts

Run `cat src/main/java/myproject/App.java` to see the contents of your project's empty program:

```java
package myproject;

import com.pulumi.Pulumi;
import com.pulumi.core.Output;

public class App {
    public static void main(String[] args) {
        Pulumi.run(ctx -> {
            ctx.export("exampleOutput", Output.of("example"));
        });
    }
}
```

We can remove the following import from our `App.java` as it is not used in this workshop:

```java
import com.pulumi.core.Output;
```

Additionally, we can remove the following line from our Pulumi program as it's not used in this workshop:

```java
ctx.export("exampleOutput", Output.of("example"));
```

Feel free to explore the other files, although we won't be editing any of them by hand, except `pom.xml`.

## Step 4 &mdash; Install the Azure Native provider

In order to interact with Azure, we need to install the Azure Native provider. We can do this by adding the following content to `pom.xml` under `<dependencies>`, after the `<dependency>` for `com.pulumi.pulumi`:

```xml
<dependency>
    <groupId>com.pulumi</groupId>
    <artifactId>azure-native</artifactId>
    <version>(,2.0]</version>
</dependency>
```

> **NOTE:** Be sure to add the `azure-native` dependency _after_ the `pulumi` dependency until <https://github.com/pulumi/pulumi-java/issues/812> is resolved.

Then, to install the provider SDK, run:

```bash
mvn install
```

This installs the Pulumi Azure Native SDK and the Azure Native provider plugin.

## Step 5 &mdash; Set your location

We want all our resources to provision in a specific Azure location. We'll set this globally in our project. Run the following command in your terminal, from within your project:

```bash
pulumi config set azure-native:location westus
```

## Next Steps

* [Create a static website](../lab-02/README.md)
