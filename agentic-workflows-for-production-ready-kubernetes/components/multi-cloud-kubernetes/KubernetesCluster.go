package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"

	"github.com/pulumi/pulumi-aws/sdk/v7/go/aws"
	awsx "github.com/pulumi/pulumi-awsx/sdk/v3/go/awsx/ec2"
	"github.com/pulumi/pulumi-azure-native-sdk/containerservice/v3"
	"github.com/pulumi/pulumi-azure-native-sdk/resources/v3"
	azurenative "github.com/pulumi/pulumi-azure-native-sdk/v3"
	"github.com/pulumi/pulumi-eks/sdk/v4/go/eks"
	"github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes"
	corev1 "github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/core/v1"
	"github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/helm/v3"
	metav1 "github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/meta/v1"
	rbacv1 "github.com/pulumi/pulumi-kubernetes/sdk/v4/go/kubernetes/rbac/v1"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

// Provider constants
const (
	ProviderAWS   = "aws"
	ProviderAzure = "azure"
)

// ClusterRole constants for hub-and-spoke architecture
const (
	RoleHub   = "hub"   // Hub cluster with ArgoCD installed
	RoleSpoke = "spoke" // Spoke cluster with service accounts and secrets for ArgoCD management
)

// KubernetesClusterArgs represents the input arguments for creating a KubernetesCluster component
type KubernetesClusterArgs struct {
	// Kubeconfig of the hub cluster (required for spoke clusters to register with ArgoCD)
	HubKubeconfig pulumi.StringPtrInput `pulumi:"hubKubeconfig,optional"`

	// Hub cluster endpoint (optional)
	HubEndpoint pulumi.StringInput `pulumi:"hubEndpoint,optional"`

	// Cloud provider: use ProviderAWS or ProviderAzure constants
	Provider string `pulumi:"provider"`

	// Cluster name
	ClusterName pulumi.StringInput `pulumi:"clusterName,optional"`

	// Kubernetes version
	Version pulumi.StringInput `pulumi:"version,optional"`

	// Cluster role: use RoleHub or RoleSpoke constants
	// Hub clusters will have ArgoCD installed
	// Spoke clusters will have service accounts and secrets for ArgoCD management
	Role string `pulumi:"role,optional"`

	// Region for deployment
	Region pulumi.StringInput `pulumi:"region,optional"`

	// Tags to apply to resources
	Tags map[string]pulumi.StringInput `pulumi:"tags,optional"`

	// AWS Provider (optional, will be created if not provided)
	//AwsProvider pulumi.ProviderResource `pulumi:"awsProvider,optional"`

	// Azure Native Provider (optional, will be created if not provided)
	//AzureProvider pulumi.ProviderResource `pulumi:"azureProvider,optional"`
}

// KubernetesCluster is a multi-cloud Kubernetes cluster component resource
type KubernetesCluster struct {
	pulumi.ResourceState

	// Kubeconfig output for accessing the cluster
	Kubeconfig pulumi.StringPtrOutput `pulumi:"kubeconfig"`

	// Cluster endpoint
	Endpoint pulumi.StringOutput `pulumi:"endpoint"`

	// Cluster name
	ClusterName pulumi.StringOutput `pulumi:"clusterName"`

	// Provider used
	Provider pulumi.StringInput `pulumi:"provider"`
}

// NewKubernetesCluster creates a new multi-cloud Kubernetes cluster component resource
func NewKubernetesCluster(ctx *pulumi.Context, name string, args *KubernetesClusterArgs, opts ...pulumi.ResourceOption) (*KubernetesCluster, error) {
	if args == nil {
		args = &KubernetesClusterArgs{}
	}

	// Create the component resource
	component := &KubernetesCluster{}
	err := ctx.RegisterComponentResource("multicloud:index:KubernetesCluster", name, component, opts...)
	if err != nil {
		return nil, err
	}

	// Set default values
	provider := args.Provider
	clusterName := args.ClusterName
	if clusterName == nil {
		clusterName = pulumi.String(name)
	}

	version := args.Version
	if version == nil {
		version = pulumi.String("1.28")
	}

	role := args.Role
	if role == "" {
		role = RoleSpoke // Default to spoke cluster
	}

	region := args.Region
	if region == nil {
		region = pulumi.String("us-east-1")
	}

	// Parent option for child resources
	parentOpt := pulumi.Parent(component)

	// Create provider-specific resources

	switch provider {
	case ProviderAWS:
		// Build provider and parent options
		awsOpts := []pulumi.ResourceOption{parentOpt}

		awsProvider, err := aws.NewProvider(ctx, "aws-provider", &aws.ProviderArgs{
			Region:               pulumi.String("us-east-1"),
			SkipMetadataApiCheck: pulumi.Bool(false),
			DefaultTags: &aws.ProviderDefaultTagsArgs{
				Tags: pulumi.StringMap{
					"ManagedBy":   pulumi.String("Pulumi"),
					"Project":     pulumi.String("multi-cloud-kubernetes"),
					"Environment": pulumi.String("dev"),
				},
			},
		})
		if err != nil {
			return nil, err
		}

		if awsProvider != nil {
			awsOpts = append(awsOpts, pulumi.Provider(awsProvider))
		}

		// Get the cluster name as a string for tag keys
		clusterNameStr := clusterName.ToStringOutput().ApplyT(func(s string) string {
			return s
		}).(pulumi.StringOutput)

		// Create VPC for EKS cluster with proper subnet configuration
		subnetStrategy := awsx.SubnetAllocationStrategyAuto
		eksVpc, err := awsx.NewVpc(ctx, fmt.Sprintf("%s-vpc", name), &awsx.VpcArgs{
			EnableDnsHostnames: pulumi.BoolPtr(true),
			CidrBlock:          pulumi.StringRef("10.0.0.0/16"),
			SubnetSpecs: []awsx.SubnetSpecArgs{
				{
					Type: awsx.SubnetTypePublic,
					Tags: clusterNameStr.ApplyT(func(name string) map[string]string {
						return map[string]string{
							fmt.Sprintf("kubernetes.io/cluster/%s", name): "shared",
							"kubernetes.io/role/elb":                      "1",
						}
					}).(pulumi.StringMapInput),
				},
				{
					Type: awsx.SubnetTypePrivate,
					Tags: clusterNameStr.ApplyT(func(name string) map[string]string {
						return map[string]string{
							fmt.Sprintf("kubernetes.io/cluster/%s", name): "shared",
							"kubernetes.io/role/internal-elb":             "1",
						}
					}).(pulumi.StringMapInput),
				},
			},
			SubnetStrategy: &subnetStrategy,
		}, awsOpts...)
		if err != nil {
			return nil, err
		}

		// Create EKS cluster with auto mode using high-level API
		authMode := eks.AuthenticationModeApi
		cluster, err := eks.NewCluster(ctx, fmt.Sprintf("%s-cluster", name), &eks.ClusterArgs{
			Name:               clusterName,
			AuthenticationMode: &authMode,
			VpcId:              eksVpc.VpcId,
			PublicSubnetIds:    eksVpc.PublicSubnetIds,
			PrivateSubnetIds:   eksVpc.PrivateSubnetIds,
			AutoMode: &eks.AutoModeOptionsArgs{
				Enabled: true,
			},
			CorednsAddonOptions: &eks.CoreDnsAddonOptionsArgs{
				Enabled: pulumi.BoolRef(false),
			},
		}, awsOpts...)
		if err != nil {
			return nil, err
		}

		// Set component outputs for AWS
		component.Kubeconfig = cluster.KubeconfigJson.ToStringPtrOutput()
		component.Endpoint = cluster.EksCluster.Endpoint().ToStringOutput()
		component.ClusterName = clusterName.ToStringOutput()

	case ProviderAzure:
		// Build provider and parent options
		azureOpts := []pulumi.ResourceOption{parentOpt}
		azureProvider, err := azurenative.NewProvider(ctx, "azure-provider", &azurenative.ProviderArgs{
			Location: pulumi.String("eastus"),
		})
		if azureProvider != nil {
			azureOpts = append(azureOpts, pulumi.Provider(azureProvider))
		}

		rg, err := resources.NewResourceGroup(ctx, fmt.Sprintf("%s-rg", name), &resources.ResourceGroupArgs{
			Location:          region,
			ResourceGroupName: pulumi.String(fmt.Sprintf("rg-%s", clusterName)),
		}, azureOpts...)
		if err != nil {
			return nil, err
		}

		// Create AKS Automatic cluster
		cluster, err := resources.NewResource(ctx, fmt.Sprintf("%s-aks-cluster", name), &resources.ResourceArgs{
			ResourceGroupName:         rg.Name,
			ApiVersion:                pulumi.String("2025-09-01"),
			ResourceType:              pulumi.String("managedClusters"),
			ResourceProviderNamespace: pulumi.String("Microsoft.ContainerService"),
			ParentResourcePath:        pulumi.String(""),
			Location:                  region,
			Identity: &resources.IdentityArgs{
				Type: resources.ResourceIdentityTypeSystemAssigned,
			},
			Sku: &resources.SkuArgs{
				Name: pulumi.String("Base"),
				Tier: pulumi.String("Standard"),
			},
			Properties: pulumi.Map{
				"dnsPrefix": pulumi.String(fmt.Sprintf("aks-%s", clusterName)),
				"networkProfile": pulumi.Map{
					"networkDataplane":  pulumi.String("cilium"),
					"networkPlugin":     pulumi.String("azure"),
					"networkPluginMode": pulumi.String("overlay"),
				},
				"agentPoolProfiles": pulumi.Array{
					pulumi.Map{
						"name":   pulumi.String("systempool"),
						"mode":   pulumi.String("System"),
						"vmSize": pulumi.String("Standard_D2s_v3"),
						"count":  pulumi.Int(3),
						"osType": pulumi.String("Linux"),
					},
				},
				"kubernetesVersion": version,
			},
		}, azureOpts...)
		if err != nil {
			return nil, err
		}

		// Set component outputs for Azure
		// Fetch kubeconfig for AKS cluster
		azureKubeconfig := pulumi.All(cluster.Name, rg.Name, azureProvider).ApplyT(func(args []interface{}) (*string, error) {
			aksClusterName := args[0].(string)
			resourceGroupName := args[1].(string)
			provider := args[2].(pulumi.ProviderResource)

			userCreds, err := containerservice.ListManagedClusterUserCredentials(ctx,
				&containerservice.ListManagedClusterUserCredentialsArgs{
					ResourceGroupName: resourceGroupName,
					ResourceName:      aksClusterName,
				}, pulumi.Provider(provider))
			if err != nil {
				return nil, err
			}

			decoded, err := base64.StdEncoding.DecodeString(userCreds.Kubeconfigs[0].Value)
			if err != nil {
				return nil, err
			}
			return pulumi.StringRef(string(decoded)), nil
		}).(pulumi.StringPtrOutput)

		component.Kubeconfig = azureKubeconfig

		test := containerservice.LookupManagedClusterOutput(ctx, containerservice.LookupManagedClusterOutputArgs{
			ResourceGroupName: rg.Name,
			ResourceName:      cluster.Name,
		}, pulumi.Provider(azureProvider))

		component.Endpoint = pulumi.Sprintf("https://%s:4443", test.Fqdn())
		component.ClusterName = clusterName.ToStringOutput()

	default:
		ctx.Log.Warn(fmt.Sprintf("Unsupported provider %s for cluster %s", provider, name), nil)
	}

	// Set provider output
	component.Provider = pulumi.String(provider)

	// Initialize Kubernetes provider with the cluster's kubeconfig
	// This is common for both hub and spoke clusters
	k8sProvider, err := kubernetes.NewProvider(ctx, fmt.Sprintf("%s-k8s-provider", name), &kubernetes.ProviderArgs{
		Kubeconfig: component.Kubeconfig,
	}, pulumi.Parent(component))
	if err != nil {
		return nil, err
	}

	// Hub and Spoke specific configuration
	// Differentiate between hub (with ArgoCD) and spoke (with service accounts for ArgoCD management)

	switch role {
	case RoleHub:
		// Install ArgoCD on hub cluster
		// This will be the management cluster that controls spoke clusters
		argoCD, err := helm.NewRelease(ctx, fmt.Sprintf("%s-argocd", name), &helm.ReleaseArgs{
			Name:            pulumi.String("argo-cd"),
			Chart:           pulumi.String("oci://ghcr.io/argoproj/argo-helm/argo-cd"),
			CreateNamespace: pulumi.Bool(true),
			Namespace:       pulumi.String("argocd"),
			Values: pulumi.Map{
				"dex": pulumi.Map{
					"enabled": pulumi.Bool(false),
				},
				"configs": pulumi.Map{
					"secret": pulumi.Map{
						"argocdServerAdminPassword": pulumi.String("$2a$10$5vm8wXaSdbuff0m9l21JdevzXBzJFPCi8sy6OOnpZMAG.fOXL7jvO"),
					},
				},
				"notifications": pulumi.Map{
					"enabled": pulumi.Bool(false),
				},
			},
		}, pulumi.Provider(k8sProvider), pulumi.Parent(component), pulumi.IgnoreChanges([]string{"checksum", "version", "values"}))
		if err != nil {
			return nil, err
		}

		// Install argocd-apps chart
		_, err = helm.NewRelease(ctx, fmt.Sprintf("%s-argocd-apps", name), &helm.ReleaseArgs{
			Name:            pulumi.String("argocd-apps"),
			Chart:           pulumi.String("oci://ghcr.io/argoproj/argo-helm/argocd-apps"),
			Namespace:       argoCD.Status.Namespace(),
			CreateNamespace: pulumi.Bool(false),
			ValueYamlFiles: pulumi.AssetOrArchiveArray{
				pulumi.NewRemoteAsset("https://raw.githubusercontent.com/pulumi/workshops/refs/heads/main/agentic-workflows-for-production-ready-kubernetes/gitops/hub/argocd/argocd-initial-objects.yaml"),
			},
		}, pulumi.Provider(k8sProvider), pulumi.Parent(component), pulumi.DependsOn([]pulumi.Resource{argoCD}), pulumi.IgnoreChanges([]string{"checksum"}))
		if err != nil {
			return nil, err
		}
		ctx.Log.Info(fmt.Sprintf("Hub cluster %s created with ArgoCD installed", name), nil)

	case RoleSpoke:
		// This allows the hub cluster's ArgoCD to deploy applications here
		ctx.Log.Info(fmt.Sprintf("Spoke cluster %s created - Service account setup needed", name), nil)

		// Create ArgoCD Service Account
		argoCDServiceAccount, err := corev1.NewServiceAccount(ctx, fmt.Sprintf("%s-argocd-sa", name), &corev1.ServiceAccountArgs{
			Metadata: &metav1.ObjectMetaArgs{
				Name:      pulumi.String("argocd-manager"),
				Namespace: pulumi.String("kube-system"),
			},
		}, pulumi.Provider(k8sProvider), pulumi.Parent(component))
		if err != nil {
			return nil, err
		}

		// Create ArgoCD Secret for service account token
		argoCDSecret, err := corev1.NewSecret(ctx, fmt.Sprintf("%s-argocd-secret", name), &corev1.SecretArgs{
			Metadata: &metav1.ObjectMetaArgs{
				Name:      pulumi.String("argocd-secret"),
				Namespace: pulumi.String("kube-system"),
				Annotations: pulumi.StringMap{
					"kubernetes.io/service-account.name": argoCDServiceAccount.Metadata.Name().Elem(),
				},
			},
			Type: pulumi.String("kubernetes.io/service-account-token"),
		}, pulumi.Provider(k8sProvider), pulumi.Parent(component))
		if err != nil {
			return nil, err
		}

		// Create ClusterRole for ArgoCD
		argoCDClusterRole, err := rbacv1.NewClusterRole(ctx, fmt.Sprintf("%s-argocd-role", name), &rbacv1.ClusterRoleArgs{
			Metadata: &metav1.ObjectMetaArgs{
				Name: pulumi.String("argocd-manager-role"),
			},
			Rules: rbacv1.PolicyRuleArray{
				&rbacv1.PolicyRuleArgs{
					ApiGroups: pulumi.StringArray{
						pulumi.String("*"),
					},
					Resources: pulumi.StringArray{
						pulumi.String("*"),
					},
					Verbs: pulumi.StringArray{
						pulumi.String("*"),
					},
				},
			},
		}, pulumi.Provider(k8sProvider), pulumi.Parent(component))
		if err != nil {
			return nil, err
		}

		// Create ClusterRoleBinding for ArgoCD
		_, err = rbacv1.NewClusterRoleBinding(ctx, fmt.Sprintf("%s-argocd-rolebinding", name), &rbacv1.ClusterRoleBindingArgs{
			Metadata: &metav1.ObjectMetaArgs{
				Name: pulumi.String("argocd-manager-role-binding"),
			},
			RoleRef: &rbacv1.RoleRefArgs{
				ApiGroup: pulumi.String("rbac.authorization.k8s.io"),
				Kind:     pulumi.String("ClusterRole"),
				Name:     argoCDClusterRole.Metadata.Name().Elem(),
			},
			Subjects: rbacv1.SubjectArray{
				&rbacv1.SubjectArgs{
					Kind:      pulumi.String("ServiceAccount"),
					Name:      pulumi.String("argocd-manager"),
					Namespace: pulumi.String("kube-system"),
				},
			},
		}, pulumi.Provider(k8sProvider), pulumi.Parent(component))
		if err != nil {
			return nil, err
		}

		k8sHubProvider, err := kubernetes.NewProvider(ctx, fmt.Sprintf("%s-hub-k8s-provider", name), &kubernetes.ProviderArgs{
			Kubeconfig: args.HubKubeconfig,
		}, pulumi.Parent(component))
		if err != nil {
			return nil, err
		}

		_, err = corev1.NewSecret(ctx, fmt.Sprintf("%s-kubeconfig-secret", name), &corev1.SecretArgs{
			Metadata: &metav1.ObjectMetaArgs{
				Name:      pulumi.String(fmt.Sprintf("%s-do2", clusterName)),
				Namespace: pulumi.String("argocd"),
				Labels: pulumi.StringMap{
					"argocd.argoproj.io/secret-type": pulumi.String("cluster"),
					"clusterType":                    pulumi.String("eks"),
				},
			},
			StringData: pulumi.StringMap{
				"name":             clusterName,
				"server":           component.Endpoint,
				"clusterResources": pulumi.String("true"),
				"config": pulumi.All(
					argoCDSecret.Data.MapIndex(pulumi.String("token")),
					argoCDSecret.Data.MapIndex(pulumi.String("ca.crt")),
				).ApplyT(func(args []interface{}) (string, error) {
					tokenBase64 := args[0].(string)
					caCrt := args[1].(string)

					tokenBytes, err := base64.StdEncoding.DecodeString(tokenBase64)
					if err != nil {
						return "", err
					}
					token := string(tokenBytes)

					configMap := map[string]interface{}{
						"bearerToken": token,
						"tlsClientConfig": map[string]interface{}{
							"caData":   caCrt,
							"insecure": false,
						},
					}

					configJSON, err := json.Marshal(configMap)
					if err != nil {
						return "", err
					}
					return string(configJSON), nil
				}).(pulumi.StringOutput),
			},
		}, pulumi.Provider(k8sHubProvider), pulumi.Parent(component))
		if err != nil {
			return nil, err
		}

	default:
		ctx.Log.Warn(fmt.Sprintf("Unknown role %s for cluster %s", role, name), nil)
	}

	err = ctx.RegisterResourceOutputs(component, pulumi.Map{
		"kubeconfig":  component.Kubeconfig,
		"endpoint":    component.Endpoint,
		"clusterName": component.ClusterName,
		"provider":    component.Provider,
	})
	if err != nil {
		return nil, err
	}

	return component, nil
}
