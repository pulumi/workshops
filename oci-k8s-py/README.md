# oci-k8s-py

This codebase contains a Pulumi program to spin up an Oracle Cloud Infrastructure (OCI) virtual cloud network (VCN), deploy an Oracle Kubernetes Engine (OKE) cluster into the network, and then deploy the Wordpress Helm chart onto the cluster.

## Usage with ESC

This example works particularly well with Pulumi ESC. You can [create a Pulumi ESC environment](https://www.pulumi.com/docs/esc/get-started/create-environment?utm_source=GitHub&utm_medium=referral&utm_campaign=workshops) similar to the following:

```yaml
values:
  oci:
    userOcid: ocid1.user.oc1..aaaaaaaaova5mbqnigfcitfgzzaer5bch6nx3kfjokzpr7lmlol6aksvwo4q
    tenancyOcid: ocid1.tenancy.oc1..aaaaaaaaymp6s54butpavvjb6fcwq3pzrrqbb33v7sh6qvzdqkimnbuqasla
    region: us-ashburn-1
    fingerprint: a9:a6:d8:6a:15:b5:77:4a:f0:1a:cd:b5:c9:33:d5:a4
    privateKey:
      fn::secret: |
        # PEM private key content goes here
  environmentVariables:
    OCI_CLI_USER: ${oci.userOcid}
    OCI_CLI_TENANCY: ${oci.tenancyOcid}
    OCI_CLI_REGION: ${oci.region}
    OCI_CLI_FINGERPRINT: ${oci.fingerprint}
    OCI_CLI_KEY_CONTENT: ${oci.privateKey}
  pulumiConfig:
    oci:tenancyOcid: ${oci.tenancyOcid}
    oci:userOcid: ${oci.userOcid}
    oci:privateKey: ${oci.privateKey}
    oci:fingerprint: ${oci.fingerprint}
    oci:region: ${oci.region}
    compartmentOcid: ocid1.compartment.oc1..aaaaaaaa67ivd7tzduvd7gowajsrru4kfduaquqqa2f4obs3sc4ex4wf7qza
```

Be sure to also add the following to your Pulumi stack config (e.g. `Pulumi.dev.yaml`):

```yaml
environment:
  - oci # or whatever you named the above environment
```

Note the dual usage of both `environmentVariables` and `pulumiConfig`. `pulumiConfig` is used to pass credentials and config to this Pulumi IaC program. We use `environmentVariables` to enable running commands like `kubectl` that work against the OCI cluster because the OCI cluster authenticates against our OCI identity.

For details on how to get the values for the environment above, see [Required Keys and OCIDs](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/apisigningkey.htm#Required_Keys_and_OCIDs) in the OCI documentation.
