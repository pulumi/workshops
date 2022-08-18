# Pulumi and Kubernetes

Pulumi doesn't just work for AWS - it also works great with Kubernetes! In this
step, we're going to deploy a simple application to a Kubernetes cluster using
Pulumi.

Before getting started, we must install a few prerequisite tools used to interact
with a Kubernetes cluster:

1. **kubectl**. To install kubectl, follow the directions most appropriate for
your platform on this site: https://kubernetes.io/docs/tasks/tools/install-kubectl/. 

    Once installed, run `kubectl --help`. You should see something like this:

    ```
    kubectl controls the Kubernetes cluster manager. 

    Find more information at: https://kubernetes.io/docs/reference/kubectl/overview/

    Basic Commands (Beginner):
    create         Create a resource from a file or from stdin.
    expose         Take a replication controller, service, deployment or pod and expose it as a new Kubernetes Service
    run            Run a particular image on the cluster
    set            Set specific features on objects
    run-container  Run a particular image on the cluster. This command is deprecated, use "run" instead

    Basic Commands (Intermediate):
    get            Display one or many resources
    explain        Documentation of resources
    edit           Edit a resource on the server
    delete         Delete resources by filenames, stdin, resources and names, or by resources and label selector

    Deploy Commands:
    rollout        Manage the rollout of a resource
    rolling-update Perform a rolling update of the given ReplicationController
    scale          Set a new size for a Deployment, ReplicaSet, Replication Controller, or Job
    autoscale      Auto-scale a Deployment, ReplicaSet, or ReplicationController

    Cluster Management Commands:
    certificate    Modify certificate resources.
    cluster-info   Display cluster info
    top            Display Resource (CPU/Memory/Storage) usage.
    cordon         Mark node as unschedulable
    uncordon       Mark node as schedulable
    drain          Drain node in preparation for maintenance
    taint          Update the taints on one or more nodes

    Troubleshooting and Debugging Commands:
    describe       Show details of a specific resource or group of resources
    logs           Print the logs for a container in a pod
    attach         Attach to a running container
    exec           Execute a command in a container
    port-forward   Forward one or more local ports to a pod
    proxy          Run a proxy to the Kubernetes API server
    cp             Copy files and directories to and from containers.
    auth           Inspect authorization

    Advanced Commands:
    apply          Apply a configuration to a resource by filename or stdin
    patch          Update field(s) of a resource using strategic merge patch
    replace        Replace a resource by filename or stdin
    convert        Convert config files between different API versions

    Settings Commands:
    label          Update the labels on a resource
    annotate       Update the annotations on a resource
    completion     Output shell completion code for the specified shell (bash or zsh)

    Other Commands:
    api-versions   Print the supported API versions on the server, in the form of "group/version"
    config         Modify kubeconfig files
    help           Help about any command
    plugin         Runs a command-line plugin
    version        Print the client and server version information

    Usage:
    kubectl [flags] [options]

    Use "kubectl <command> --help" for more information about a given command.
    Use "kubectl options" for a list of global command-line options (applies to all commands).
    ```

1. **aws-iam-authenticator**. We will be working with clusters managed by Amazon EKS,
so we must use `aws-iam-authenticator` to authenticate ourselves with our cluster. Follow the instructions on this site: https://docs.aws.amazon.com/eks/latest/userguide/install-aws-iam-authenticator.html.

    Once installed, run `aws-iam-authenticator --help`. You sould see something like this:

    ```
    A tool to authenticate to Kubernetes using AWS IAM credentials

    Usage:
    aws-iam-authenticator [command]

    Available Commands:
    help        Help about any command
    init        Pre-generate certificate, private key, and kubeconfig files for the server.
    server      Run a webhook validation server suitable that validates tokens using AWS IAM
    token       Authenticate using AWS IAM and get token for Kubernetes
    verify      Verify a token for debugging purpose
    version     Version will output the current build information

    Flags:
    -i, --cluster-id ID       Specify the cluster ID, a unique-per-cluster identifier for your aws-iam-authenticator installation.
    -c, --config filename     Load configuration from filename
    -h, --help                help for aws-iam-authenticator
    -l, --log-format string   Specify log format to use when logging to stderr [text or json] (default "text")

    Use "aws-iam-authenticator [command] --help" for more information about a command.
    ```

1. Download our `kubeconfig` and set it as your KUBECONFIG. When authenticated with our AWS credentials:
    ```
    aws s3 cp s3://qcon-kubernetes-64f7e9e/kubeconfig kubeconfig
    export KUBECONFIG=$(pwd)/kubeconfig
    ```

1. Run `kubectl get nodes`. You should see something like this:

    ```
    ip-172-31-14-174.eu-west-1.compute.internal   Ready     <none>    4h        v1.11.5
    ip-172-31-31-68.eu-west-1.compute.internal    Ready     <none>    4h        v1.11.5
    ip-172-31-37-16.eu-west-1.compute.internal    Ready     <none>    4h        v1.11.5
    ```

You should now be ready to go on to step 1!

## Step 1

For this step, we are going to deploy a single pod to a Kubernetes cluster.

Before we get started, verify first that you can access your Kubernetes cluster:

```
$ kubectl get nodes
ip-172-31-14-174.eu-west-1.compute.internal   Ready     <none>    4h        v1.11.5
ip-172-31-31-68.eu-west-1.compute.internal    Ready     <none>    4h        v1.11.5
ip-172-31-37-16.eu-west-1.compute.internal    Ready     <none>    4h        v1.11.5
```

If you don't see this, be sure that your `KUBECONFIG` environment variable is set to the provided kubeconfig!

1. Create a new project by running `pulumi new` in an empty directory and selecting the "kubernetes-typescript" option and accept all defaults:

    ```
    Please choose a template: kubernetes-typescript    A minimal Kubernetes TypeScript Pulumi program
    This command will walk you through creating and deploying a new Pulumi project.

    Enter a value or leave blank to accept the (default), and press <ENTER>.
    Press ^C at any time to quit.

    project name: (3step1)
    project description: (A minimal Kubernetes TypeScript Pulumi program)
    Created project '3step1'

    stack name: (dev)
    Created stack 'dev'
    ```

    When prompted, choose not to run the update.

1. Create a namespace by placing this line of code at the top of the file:

    ```typescript
    const namespace = new k8s.core.v1.Namespace("nginx");
    ```

    We will place all of our Kubernetes resources inside of this namespace to avoid colliding with other people using this cluster.

1. Create an NGINX Pod with this code:

    ```typescript
    const nginx = new k8s.core.v1.Pod("nginx", {
        metadata: {
            namespace: namespace.metadata.apply(meta => meta.name),
        },
        spec: {
            containers: [{
                name: "nginx",
                image: "nginx:latest",
                ports: [{ containerPort: 80 }],
            }]
        }
    })
    ```

    We encourage you to type this out instead of copy-pasting from this file. If you are
    familiar with Kubernetes YAML, this will likely look familiar to you; if not, this object describes a Kubernetes Pod object that we will create.

    This pod's namespace comes from the namespace that we just created.

1. Export the namespace name and pod name:

    ```typescript
    export const namespaceName = namespace.metadata.apply(meta => meta.name);
    export const name = nginx.metadata.apply(meta => meta.name);
    ```

    This will allow us to inspect our namespace later.

1. Run `pulumi up`:

    ```
    $ pulumi update
    Previewing update (dev):

        Type                          Name        Plan
    +   pulumi:pulumi:Stack           3step1-dev  create
    +   ├─ kubernetes:core:Namespace  nginx       create
    +   └─ kubernetes:core:Pod        nginx       create

    Resources:
        + 3 to create

    Do you want to perform this update? yes
    Updating (dev):

        Type                          Name        Status
    +   pulumi:pulumi:Stack           3step1-dev  created
    +   ├─ kubernetes:core:Namespace  nginx       created
    +   └─ kubernetes:core:Pod        nginx       created

    Outputs:
        name         : "nginx-xtodm64y"
        namespaceName: "nginx-60hu0rqg"

    Resources:
        + 3 created

    Duration: 8s
    ```

    Notice how you see the Pod object's status change as it progresses through its initialization.

1. Check out the namespace you just created with `kubectl`:

    ```
    $ kubectl get all --namespace $(pulumi stack output namespaceName)
    NAME             READY     STATUS    RESTARTS   AGE
    nginx-xtodm64y   1/1       Running   0          1m
    ```

    Note the use of `pulumi stack output` here - we exported the namespace name
    in the program, and now we can use it from the shell.

1. Destroy the stack:

    ```
    $ pulumi destroy
    Previewing destroy (dev):

        Type                          Name        Plan
    -   pulumi:pulumi:Stack           3step1-dev  delete
    -   ├─ kubernetes:core:Pod        nginx       delete
    -   └─ kubernetes:core:Namespace  nginx       delete

    Resources:
        - 3 to delete

    Do you want to perform this destroy? yes
    Destroying (dev):

        Type                          Name        Status
    -   pulumi:pulumi:Stack           3step1-dev  deleted
    -   ├─ kubernetes:core:Pod        nginx       deleted
    -   └─ kubernetes:core:Namespace  nginx       deleted

    Resources:
        - 3 deleted

    Duration: 23s
    ```
