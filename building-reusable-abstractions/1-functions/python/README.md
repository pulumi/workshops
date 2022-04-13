# Functions with TypeScript

## Install Dependencies

```shell
source ./venv/bin/activate
pip install -r requirements.txt
```

## Solutions

### 2. Provide a function for creating networks

<details><summary>Click to show</summary><p>

```python
class NetworkArgs:
    def __init__(self, label: str):
        self.label = label

def create_network(name: str, args: NetworkArgs) -> civo.Network:
    return civo.Network(name, label=args.label)
```

</p></details>

### 2. Use your function to create a network

<details><summary>Click to show</summary><p>

```python
create_network(name="one-functions", args=NetworkArgs(label="pulumi-workshop"))
```

</p></details>

### 4. Adapt your function to receive a list of firewall ports to open and ensure that the firewall is created

<details><summary>Click to show</summary><p>

First, we provide our own types for passing around. This is how you achieve a good developer experience, by tailoring these to reflect what your down stream consumers care about and nothing else.

```python
# You'll need to add this to the top of your Python code too:
# from typing import List

class FirewallRuleArgs:
  def __init__(self, label: str, cidrs: List[str], protocol: str, port: str):
    self.label = label
    self.cidrs = cidrs
    self.protocol = protocol
    self.port = port

class NetworkArgs:
    def __init__(self, label: str, firewall_rules: List[FirewallRuleArgs]):
        self.label = label
        self.firewall_rules = firewall_rules
```

Next, we enrich our function. We only really need to pass back the network, as the consumers don't actually need to work directly with the firewall or its rules. So keep the API simple and let Pulumi manage the rest.

```python
def create_network(name: str, args: NetworkArgs) -> civo.Network:
    network = civo.Network(name, label=args.label)

    firewall = civo.Firewall(name, network_id=network.id)

    firewall_rules = list(map(lambda rule: civo.FirewallRule(f'{name}-{rule.label}', firewall_id=firewall.id, protocol=rule.protocol, start_port=rule.port, cidrs=rule.cidrs, label=rule.label, action="allow", direction="ingress"), args.firewall_rules))

    return network
```

Our consumers then get an API to work with like so:

```python
create_network(name="one-functions", args=NetworkArgs(label="pulumi-workshop", firewall_rules=[FirewallRuleArgs(label="https", cidrs=["0.0.0.0/0"], port="443", protocol="tcp")]))
```

</p></details>
