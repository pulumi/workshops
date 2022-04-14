# Functions with TypeScript

## Install Dependencies

```shell
npm install
```

## Solutions

### 1. Create an Empty `Cluster` ComponentResource

<details><summary>Click to show</summary><p>

```go
type Cluster struct {
    pulumi.ResourceState
}

func NewCluster(ctx *pulumi.Context, name string, opts ...pulumi.ResourceOption) (*Cluster, error) {
    component := &Cluster{}

    err := ctx.RegisterComponentResource("workshop:cluster:Cluster", name, component, opts...)
    if err != nil {
        return nil, err
    }

    return cluster, nil
}
```

</p></details>
