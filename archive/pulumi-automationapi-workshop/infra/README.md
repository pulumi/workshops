# Workshop Infrastructure

The workshop requires a Kubernetes cluster to work. This code provisions a Kubernetes cluster in [Digital Ocean](https://www.digitalocean.com/)

To run it, create a virtualenv:

```
python -m venv venv
```

Activate it:

```
source venv/bin/activate
```

Install the dependencies:

```
pip3 install -r requirements.txt
```

Set your digitalocean token:

```
pulumi config set --secret digitalocean:token <SUPER_SECRET_TOKEN>
Please choose a stack, or create a new one: <create a new stack>
Please enter your desired stack name.
To create a stack in an organization, use the format <org-name>/<stack-name> (e.g. `acmecorp/dev`): dev
Created stack 'dev'
```

Finally, run `pulumi up`, which will provision the cluster.




