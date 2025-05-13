package talos

import (
	"fmt"
	"github.com/pulumi/pulumi-digitalocean/sdk/v4/go/digitalocean"
	"github.com/pulumi/pulumi-tls/sdk/v5/go/tls"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
	"github.com/pulumiverse/pulumi-talos/sdk/go/talos/client"
	"github.com/pulumiverse/pulumi-talos/sdk/go/talos/cluster"
	"github.com/pulumiverse/pulumi-talos/sdk/go/talos/machine"
	"strconv"
)

type TalosClusterArgs struct {
	ClusterName       pulumi.StringInput `pulumi:"clusterName"`
	Version           pulumi.StringInput `pulumi:"version"`
	Region            pulumi.StringInput `pulumi:"region"`
	CountControlPlane int                `pulumi:"countControlPlane"`
	CountWorker       int                `pulumi:"countWorker"`
	Size              pulumi.StringInput `pulumi:"size"`
}

type TalosCluster struct {
	pulumi.ResourceState
	TalosClusterArgs
	Kubeconfig pulumi.StringOutput `pulumi:"kubeconfig"`
}

func NewTalosCluster(ctx *pulumi.Context, name string, talosClusterArgs TalosClusterArgs, opts ...pulumi.ResourceOption) (*TalosCluster, error) {
	myComponent := &TalosCluster{}
	err := ctx.RegisterComponentResource("pkg:index:TalosCluster", name, myComponent, opts...)
	if err != nil {
		return nil, err
	}

	talosCustomImage, err := digitalocean.NewCustomImage(ctx, "talosCustomImage", &digitalocean.CustomImageArgs{
		Distribution: pulumi.String("Unknown OS"),
		Name:         pulumi.Sprintf("talos-linux-%s", talosClusterArgs.Version),
		Regions:      pulumi.StringArray{talosClusterArgs.Region},
		Url:          pulumi.Sprintf("https://factory.talos.dev/image/376567988ad370138ad8b2698212367b8edcb69b5fd68c80be1f2ec7d603b4ba/%s/digital-ocean-amd64.raw.gz", talosClusterArgs.Version),
	})
	if err != nil {
		return nil, err
	}

	fakeSSHKey, err := tls.NewPrivateKey(ctx, "fakeSSHKey", &tls.PrivateKeyArgs{
		Algorithm: pulumi.String("RSA"),
		RsaBits:   pulumi.Int(4096),
	})
	if err != nil {
		return nil, err
	}

	doSSHKey, err := digitalocean.NewSshKey(ctx, "doSSHKey", &digitalocean.SshKeyArgs{
		PublicKey: fakeSSHKey.PublicKeyOpenssh,
	})
	if err != nil {
		return nil, err
	}

	controlPlaneDropletsIDs := make(pulumi.IntArray, talosClusterArgs.CountControlPlane)
	controlPlaneDropletsIP4s := make(pulumi.StringArray, talosClusterArgs.CountControlPlane)

	for i := 0; i < talosClusterArgs.CountControlPlane; i++ {
		controlPlane, err := digitalocean.NewDroplet(ctx, fmt.Sprintf("controlPlane-%d", i), &digitalocean.DropletArgs{
			Image:   talosCustomImage.ID(),
			Region:  talosClusterArgs.Region,
			Size:    talosClusterArgs.Size,
			SshKeys: pulumi.StringArray{doSSHKey.ID()},
		})
		if err != nil {
			return nil, err
		}
		controlPlaneDropletsIDs[i] = controlPlane.ID().ApplyT(func(id string) int {
			i, _ := strconv.Atoi(id)
			return i
		}).(pulumi.IntOutput)
		controlPlaneDropletsIP4s[i] = controlPlane.Ipv4Address.ApplyT(func(ip string) string { return ip }).(pulumi.StringOutput)
	}

	ctx.Export("controlPlaneDropletsIDsOutput", controlPlaneDropletsIDs)
	ctx.Export("controlPlaneDropletsIP4sOutput", controlPlaneDropletsIP4s)

	workerDropletsIP4s := make(pulumi.StringArray, talosClusterArgs.CountWorker)

	for i := 0; i < talosClusterArgs.CountWorker; i++ {
		worker, err := digitalocean.NewDroplet(ctx, fmt.Sprintf("worker-%d", i), &digitalocean.DropletArgs{
			Image:   talosCustomImage.ID(),
			Region:  talosClusterArgs.Region,
			Size:    talosClusterArgs.Size,
			SshKeys: pulumi.StringArray{doSSHKey.ID()},
		})
		if err != nil {
			return nil, err
		}
		workerDropletsIP4s[i] = worker.Ipv4Address.ApplyT(func(ip string) string { return ip }).(pulumi.StringOutput)
	}

	lb, err := digitalocean.NewLoadBalancer(ctx, "lb", &digitalocean.LoadBalancerArgs{
		Region: talosClusterArgs.Region,
		ForwardingRules: digitalocean.LoadBalancerForwardingRuleArray{
			&digitalocean.LoadBalancerForwardingRuleArgs{
				EntryPort:      pulumi.Int(6443),
				EntryProtocol:  pulumi.String("tcp"),
				TargetPort:     pulumi.Int(6443),
				TargetProtocol: pulumi.String("tcp"),
			},
		},
		Healthcheck: &digitalocean.LoadBalancerHealthcheckArgs{
			Port:     pulumi.Int(50000),
			Protocol: pulumi.String("tcp"),
		},
		DropletIds: controlPlaneDropletsIDs,
	})
	if err != nil {
		return nil, err
	}

	machineSecrets, err := machine.NewSecrets(ctx, "machineSecrets", &machine.SecretsArgs{})
	if err != nil {
		return nil, err
	}

	_ = client.GetConfigurationOutput(ctx, client.GetConfigurationOutputArgs{
		ClusterName: pulumi.String("example-cluster"),
		ClientConfiguration: machineSecrets.ClientConfiguration.ApplyT(func(clientConfig client.GetConfigurationClientConfiguration) client.GetConfigurationClientConfiguration {
			return clientConfig
		}).(client.GetConfigurationClientConfigurationOutput),
		Endpoints: controlPlaneDropletsIP4s,
	})

	machineConfigCP := machine.GetConfigurationOutput(ctx, machine.GetConfigurationOutputArgs{
		ClusterName:     pulumi.String("example-cluster"),
		ClusterEndpoint: pulumi.Sprintf("https://%s:6443", lb.Ip),
		MachineType:     pulumi.String("controlplane"),
		MachineSecrets:  machineSecrets.MachineSecrets,
	})

	for i := 0; i < talosClusterArgs.CountControlPlane; i++ {
		_, err := machine.NewConfigurationApply(ctx, fmt.Sprintf("cpConfigApply-%d", i), &machine.ConfigurationApplyArgs{
			ClientConfiguration:       machineSecrets.ClientConfiguration,
			MachineConfigurationInput: machineConfigCP.MachineConfiguration(),
			Node:                      controlPlaneDropletsIP4s[i],
		})
		if err != nil {
			return nil, err
		}
	}

	machineConfigWorker := machine.GetConfigurationOutput(ctx, machine.GetConfigurationOutputArgs{
		ClusterName:     pulumi.String("example-cluster"),
		ClusterEndpoint: pulumi.Sprintf("https://%s:6443", lb.Ip),
		MachineType:     pulumi.String("worker"),
		MachineSecrets:  machineSecrets.MachineSecrets,
	})

	for i := 0; i < talosClusterArgs.CountWorker; i++ {
		_, err := machine.NewConfigurationApply(ctx, fmt.Sprintf("workerConfigApply-%d", i), &machine.ConfigurationApplyArgs{
			ClientConfiguration:       machineSecrets.ClientConfiguration,
			MachineConfigurationInput: machineConfigWorker.MachineConfiguration(),
			Node:                      workerDropletsIP4s[i],
		})
		if err != nil {
			return nil, err
		}
	}

	_, err = machine.NewBootstrap(ctx, "bootstrap", &machine.BootstrapArgs{
		ClientConfiguration: machineSecrets.ClientConfiguration,
		Node:                controlPlaneDropletsIP4s[0],
	})
	if err != nil {
		return nil, err
	}

	clusterKubeconfig, err := cluster.NewKubeconfig(ctx, "talosKubeconfig", &cluster.KubeconfigArgs{
		ClientConfiguration: machineSecrets.ClientConfiguration.ApplyT(func(clientConfig machine.ClientConfiguration) cluster.KubeconfigClientConfiguration {
			return cluster.KubeconfigClientConfiguration{
				CaCertificate:     clientConfig.CaCertificate,
				ClientCertificate: clientConfig.ClientCertificate,
				ClientKey:         clientConfig.ClientKey,
			}
		}).(cluster.KubeconfigClientConfigurationOutput),
		Node: controlPlaneDropletsIP4s[0],
	})
	if err != nil {
		return nil, err
	}

	err = ctx.RegisterResourceOutputs(myComponent, pulumi.Map{
		"kubeconfig": clusterKubeconfig.KubeconfigRaw,
	})
	myComponent.Kubeconfig = clusterKubeconfig.KubeconfigRaw
	if err != nil {
		return nil, err
	}
	return myComponent, nil
}
