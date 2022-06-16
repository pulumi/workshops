import * as pulumi from "@pulumi/pulumi";
import * as kubernetes from "@pulumi/kubernetes";
import { RandomPassword } from "@pulumi/random";

interface Args {
  provider: kubernetes.Provider;
}

export class PulumiOperator extends pulumi.ComponentResource {
  protected readonly version = "1.4.0";
  protected readonly crdsUrl =
    "https://raw.githubusercontent.com/pulumi/pulumi-kubernetes-operator/v${VERSION}/deploy/crds/pulumi.com_stacks.yaml";

  private provider: kubernetes.Provider;
  private operatorServiceAccount: kubernetes.core.v1.ServiceAccount;
  private operatorRole: kubernetes.rbac.v1.Role;
  private operatorRoleBinding: kubernetes.rbac.v1.RoleBinding;
  private stackSecret: RandomPassword;
  private persistentVolumeClaim: kubernetes.core.v1.PersistentVolumeClaim;
  private operator: kubernetes.apps.v1.Deployment;
  private pulumiKubernetesSecret: kubernetes.core.v1.Secret;
  private stacks: kubernetes.apiextensions.CustomResource[] = [];

  static getComponentName(): string {
    return "pulumi-operator";
  }

  constructor(name: string, args: Args) {
    super("pulumi-operator", name, {}, {});

    this.provider = args.provider;
    const provider = args.provider;

    new kubernetes.yaml.ConfigFile(
      `${name}-crds`,
      { file: this.crdsUrl.replace("${VERSION}", this.version) },
      { provider, parent: this }
    );

    this.operatorServiceAccount = new kubernetes.core.v1.ServiceAccount(
      `${name}-pulumi-operator-service-account`,
      {},
      {
        provider,
        parent: this,
      }
    );

    this.operatorRole = new kubernetes.rbac.v1.Role(
      `${name}-pulumi-operator-role`,
      {
        rules: [
          {
            apiGroups: ["*"],
            resources: ["*"],
            verbs: ["*"],
          },
        ],
      },
      {
        provider,
        parent: this,
      }
    );

    this.operatorRoleBinding = new kubernetes.rbac.v1.RoleBinding(
      `${name}-pulumi-operator-role-binding`,
      {
        subjects: [
          {
            kind: "ServiceAccount",
            name: this.operatorServiceAccount.metadata.name,
          },
        ],
        roleRef: {
          kind: "Role",
          name: this.operatorRole.metadata.name,
          apiGroup: "rbac.authorization.k8s.io",
        },
      },
      {
        provider,
        parent: this,
      }
    );

    const operatorName = `${name}-operator`;

    this.stackSecret = new RandomPassword(`${name}-pulumi-stack-secret`, {
      length: 32,
    });

    this.pulumiKubernetesSecret = new kubernetes.core.v1.Secret(
      `${name}-password`,
      {
        stringData: {
          password: this.stackSecret.result,
        },
      },
      {
        provider,
        parent: this,
      }
    );

    this.persistentVolumeClaim = new kubernetes.core.v1.PersistentVolumeClaim(
      `${name}-operator`,
      {
        spec: {
          accessModes: ["ReadWriteOnce"],
          resources: {
            requests: {
              storage: "10Gi",
            },
          },
        },
      },
      {
        provider,
        parent: this,
      }
    );

    this.operator = new kubernetes.apps.v1.Deployment(
      `${name}-pulumi-kubernetes-operator`,
      {
        spec: {
          replicas: 1,
          strategy: {
            type: "Recreate",
          },
          selector: {
            matchLabels: {
              name: operatorName,
            },
          },

          template: {
            metadata: {
              labels: {
                name: operatorName,
              },
            },
            spec: {
              serviceAccountName: this.operatorServiceAccount.metadata.name,
              volumes: [
                {
                  name: "state",
                  persistentVolumeClaim: {
                    claimName: this.persistentVolumeClaim.metadata.name,
                  },
                },
              ],
              securityContext: {
                fsGroup: 1000,
              },
              containers: [
                {
                  name: "operator",
                  image: "pulumi/pulumi-kubernetes-operator:v1.5.0",
                  args: ["--zap-level=error", "--zap-time-encoding=iso8601"],
                  imagePullPolicy: "Always",
                  volumeMounts: [
                    {
                      name: "state",
                      mountPath: "/state",
                    },
                  ],
                  env: [
                    {
                      name: "WATCH_NAMESPACE",
                      valueFrom: {
                        fieldRef: {
                          fieldPath: "metadata.namespace",
                        },
                      },
                    },
                    {
                      name: "POD_NAME",
                      valueFrom: {
                        fieldRef: {
                          fieldPath: "metadata.name",
                        },
                      },
                    },
                    {
                      name: "OPERATOR_NAME",
                      value: `${name}-operator`,
                    },
                    {
                      name: "GRACEFUL_SHUTDOWN_TIMEOUT_DURATION",
                      value: "5m",
                    },
                    {
                      name: "MAX_CONCURRENT_RECONCILES",
                      value: "1",
                    },
                    {
                      name: "PULUMI_INFER_NAMESPACE",
                      value: "1",
                    },
                  ],
                },
              ],
              // Should be same or larger than GRACEFUL_SHUTDOWN_TIMEOUT_DURATION
              terminationGracePeriodSeconds: 300,
            },
          },
        },
      },
      {
        provider,
        parent: this,
        dependsOn: [this.operatorRoleBinding],
      }
    );
  }

  addRepository(name: string, repository: string, directory: string): void {
    this.stacks.push(
      new kubernetes.apiextensions.CustomResource(
        `${name}-stack`,
        {
          apiVersion: "pulumi.com/v1",
          kind: "Stack",
          spec: {
            stack: name,
            projectRepo: repository,
            branch: "refs/heads/main",
            destroyOnFinalize: true,
            repoDir: directory,
            continueResyncOnCommitMatch: true,
            resyncFrequencySeconds: 60,
            backend: "file:///state",
            envRefs: {
              PULUMI_CONFIG_PASSPHRASE: {
                type: "Secret",
                secret: {
                  name: this.pulumiKubernetesSecret.metadata.name,
                  key: "password",
                },
              },
            },
          },
        },
        {
          provider: this.provider,
          parent: this,
          dependsOn: this.operator,
        }
      )
    );
  }
}
