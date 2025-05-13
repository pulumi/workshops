package main

import (
	"github.com/pulumi/pulumi-go-provider/infer"
	"talos-go-component/pkg/talos"
)

func main() {
	err := infer.NewProviderBuilder().
		WithName("talos-go-component").
		WithNamespace("ediri").
		WithComponents(
			infer.Component(talos.NewTalosCluster),
		).
		BuildAndRun()

	if err != nil {
		panic(err)
	}
}
