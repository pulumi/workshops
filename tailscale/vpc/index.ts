import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";
import * as tls from "@pulumi/tls";


const vpc = new awsx.ec2.Vpc("tailscale-workshop", {
  enableDnsHostnames: true,
  natGateways: {
    strategy: "Single",
  }
});

const privateInstanceSg = new aws.ec2.SecurityGroup("private-instance-sg", {
  description: "Allow SSH from anywhere inside the network. Allow HTTPS for SSM (for debugging).",
  vpcId: vpc.vpcId,
  ingress: [{
    description: "Allow SSH from anywhere inside the network.",
    fromPort: 22,
    toPort: 22,
    protocol: "tcp",
    cidrBlocks: [vpc.vpc.cidrBlock],
  }],
  egress: [{
    description: "Allow HTTPS to anywhere.",
    fromPort: 443,
    toPort: 443,
    protocol: "tcp",
    cidrBlocks: ["0.0.0.0/0"],
  }]
});

const amazonLinux2 = aws.ec2.getAmiOutput({
  mostRecent: true,
  owners: ["amazon"],
  filters: [
    { name: "name", values: ["amzn2-ami-hvm-*-x86_64-gp2"] },
    { name: "owner-alias", values: ["amazon"] },
  ]
});

const sshKey = new tls.PrivateKey("ssh-key", {
  algorithm: "RSA",
  rsaBits: 4096
});

const keyPair = new aws.ec2.KeyPair("keypair", {
  publicKey: sshKey.publicKeyOpenssh,
});

const privateInstanceRole = new aws.iam.Role("private-instance-role", {
  assumeRolePolicy: JSON.stringify({
    "Version": "2012-10-17",
    "Statement": {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com",
      },
      "Action": "sts:AssumeRole",
    },
  }),
});

// Uncomment to debug via SSM:
// new aws.iam.RolePolicyAttachment("private-instance-role-policy-attachment", {
//   role: privateInstanceRole.name,
//   policyArn: "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore",
// });

const privateInstanceProfile = new aws.iam.InstanceProfile("private-instance-profile", {
  role: privateInstanceRole.name,
});

const privateInstance = new aws.ec2.Instance("private-instance", {
  ami: amazonLinux2.id,
  instanceType: aws.ec2.InstanceTypes.T3_Micro,
  vpcSecurityGroupIds: [privateInstanceSg.id],
  subnetId: vpc.privateSubnetIds[1],
  keyName: keyPair.keyName,
  iamInstanceProfile: privateInstanceProfile.name,
  tags: {
    Name: "tailscale-workshop-private-instance",
  },
});

export const sshPrivateKey = sshKey.privateKeyOpenssh;
export const privateInstanceIp = privateInstance.privateIp;
export const privateSubnet1 = vpc.privateSubnetIds[0];
export const vpcId = vpc.vpcId;
export const vpcCidr = vpc.vpc.cidrBlock;