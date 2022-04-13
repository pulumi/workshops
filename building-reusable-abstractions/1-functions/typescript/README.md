# Functions with TypeScript

## Install Dependencies

```shell
npm install
```

## Solutions

### 2. Provide a function for creating networks

<details><summary>Click to show</summary><p>

```typescript
interface NetworkArgs {
  label: string;
}

const createNetwork = (name: string, args: NetworkArgs) =>
  new civo.Network(name, {
    ...args,
  });
```

</p></details>

### 2. Use your function to create a network

<details><summary>Click to show</summary><p>

```typescript
const network = createNetwork("one-functions", {
  label: "pulumi-workshop",
});
```

</p></details>

### 4. Adapt your function to receive a list of firewall ports to open and ensure that the firewall is created

<details><summary>Click to show</summary><p>

First, we provide our own types for passing around. This is how you achieve a good developer experience, by tailoring these to reflect what your down stream consumers care about and nothing else.

```typescript
interface FirewallRuleArgs {
  label: string;
  cidrs: string[];
  protocol: string;
  port: string;
}

interface NetworkArgs {
  label: string;
  firewallRules: FirewallRuleArgs[];
}
```

Next, we enrich our function. We only really need to pass back the network, as the consumers don't actually need to work directly with the firewall or its rules. So keep the API simple and let Pulumi manage the rest.

```typescript
const createNetwork = (name: string, args: NetworkArgs) => {
  const network = new civo.Network(name, {
    ...args,
  });

  const firewall = new civo.Firewall(name, {
    networkId: network.id,
  });

  const firewallRules = args.firewallRules.map((rule) => {
    return new civo.FirewallRule(`${name}-${rule.label}`, {
      firewallId: firewall.id,
      action: "allow",
      direction: "ingress",
      ...{ ...rule, startPort: rule.port },
    });
  });
};
```

Our consumers then get an API to work with like so:

```typescript
const network = createNetwork("one-functions", {
  label: "pulumi-workshop",
  firewallRules: [
    {
      label: "https",
      cidrs: ["0.0.0.0/0"],
      protocol: "tcp",
      port: "443",
    },
  ],
});
```

</p></details>
