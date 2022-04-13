# Functions with Go

## Install Dependencies

```shell
go get ./...
```

## Solutions

### 2. Provide a function for creating networks

<details><summary>Click to show</summary><p>

```go
func createNetwork(ctx *pulumi.Context, name string, args *civo.NetworkArgs) (*civo.Network, error) {
    return civo.NewNetwork(ctx, name, args)
}
```

</p></details>

### 2. Use your function to create a network

<details><summary>Click to show</summary><p>

```go
_, err := createNetwork(ctx, "one-functions", &civo.NetworkArgs{
    Label: pulumi.String("pulumi-workshop"),
})
if err != nil {
    return err
}
```

</p></details>

### 4. Adapt your function to receive a list of firewall ports to open and ensure that the firewall is created

<details><summary>Click to show</summary><p>

First, we provide our own types for passing around. This is how you achieve a good developer experience, by tailoring these to reflect what your down stream consumers care about and nothing else.

```go
type NetworkArgs struct {
    Label         string
    FirewallRules []*FirewallRuleArgs
}

type FirewallRuleArgs struct {
    Label    string
    Cidrs    []string
    Protocol string
    Port     string
}
```

Next, we enrich our function. We only really need to pass back the network, as the consumers don't actually need to work directly with the firewall or its rules. So keep the API simple and let Pulumi manage the rest.

```go
func createNetwork(ctx *pulumi.Context, name string, args *NetworkArgs) (*civo.Network, error) {
    network, err := civo.NewNetwork(ctx, name, &civo.NetworkArgs{
        Label: pulumi.String(args.Label),
    })

    if err != nil {
        return nil, err
    }

    firewall, err := civo.NewFirewall(ctx, name, &civo.FirewallArgs{
        NetworkId: network.ID(),
    })

    if err != nil {
        return network, err
    }

    for _, v := range args.FirewallRules {
        _, err := civo.NewFirewallRule(ctx, fmt.Sprintf("%s-%s", name, v.Label), &civo.FirewallRuleArgs{
            FirewallId: firewall.ID(),
            Label:      pulumi.String(v.Label),
            Cidrs:      pulumi.ToStringArray(v.Cidrs),
            Protocol:   pulumi.String(v.Protocol),
            StartPort:  pulumi.String(v.Port),
        })

        if err != nil {
            return network, err
        }
    }

    return network, nil
}
```

Our consumers then get an API to work with like so:

```go
func main() {
    pulumi.Run(func(ctx *pulumi.Context) error {
        _, err := createNetwork(ctx, "one-functions", &NetworkArgs{
            Label: "pulumi-workshop",
            FirewallRules: []*FirewallRuleArgs{
                {
                    Label:    "https",
                    Cidrs:    []string{"0.0.0.0/0"},
                    Protocol: "tcp",
                    Port:     "443",
                },
            },
        })
        if err != nil {
            return err
        }

        return nil
    })
}
```

</p></details>
