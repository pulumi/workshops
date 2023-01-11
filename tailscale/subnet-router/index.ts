import * as pulumi from "@pulumi/pulumi";
import * as tailscale from "@pulumi/tailscale";
import * as aws from "@pulumi/aws";

const vpcStack = new pulumi.StackReference(`${pulumi.getOrganization()}/tailscale-workshop-vpc/dev`);

const tailnetKey = new tailscale.TailnetKey("tailnet-key", {
  ephemeral: true,
  preauthorized: true,
  reusable: true,
});

const ssmParam = new aws.ssm.Parameter("tailnet-key-ssm-param", {
  type: "SecureString",
  value: tailnetKey.key,
});

const sg = new aws.ec2.SecurityGroup("instance-sg", {
  description: "Allow all egress, inbound ICMP only.",
  vpcId: vpcStack.getOutputValue("vpcId"),
  egress: [{
    description: "Allow all egress",
    cidrBlocks: ["0.0.0.0/0"],
    fromPort: 0,
    toPort: 0,
    protocol: "-1",
  }],
  ingress: [{
    description: "Allow ICMP ingress",
    cidrBlocks: ["0.0.0.0/0"],
    fromPort: 0,
    toPort: 0,
    protocol: "icmp",
  }]
});

const role = new aws.iam.Role("instance-role", {
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

const policyJson = ssmParam.arn.apply(arn => JSON.stringify({
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ssm:GetParameters"],
      "Resource": [arn]
    },
    {
      "Effect": "Allow",
      "Action": ["ssm:DescribeParameters"],
      "Resource": ["*"],
    }
  ]
}));

const readSsmPolicy = new aws.iam.Policy("read-tailnet-ssm-param", {
  description: "Allows the Tailscale SSM param to be read.",
  policy: policyJson,
});

new aws.iam.RolePolicyAttachment("read-tailnet-attachment", {
  policyArn: readSsmPolicy.arn,
  role: role.name,
});

// Uncomment to debug via SSM:
// new aws.iam.RolePolicyAttachment("instance-role-policy-attachment", {
//   role: role.name,
//   policyArn: "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore",
// });

const instanceProfile = new aws.iam.InstanceProfile("instance-profile", {
  role: role.name,
});

const userdata = pulumi.interpolate`
#!/bin/bash

echo "set some kernel values"
sudo sysctl -w net.ipv4.ip_forward=1

echo "install jq"
sudo yum install -y jq

echo "Installing tailscale"
sudo yum install yum-utils -y
sudo yum-config-manager --add-repo https://pkgs.tailscale.com/stable/amazon-linux/2/tailscale.repo
sudo yum install tailscale -y
sudo systemctl enable --now tailscaled
sleep 10
sudo tailscale up --advertise-tags=tag:bastion --advertise-routes="${vpcStack.getOutputValue("vpcCidr")}" --authkey=$(aws ssm get-parameter --name ${ssmParam.name} --region ${aws.config.region} --with-decryption | jq .Parameter.Value -r) --host-routes
`;

const amazonLinux2 = aws.ec2.getAmiOutput({
  mostRecent: true,
  owners: ["amazon"],
  filters: [
    { name: "name", values: ["amzn2-ami-hvm-*-x86_64-gp2"] },
    { name: "owner-alias", values: ["amazon"] },
  ]
});


const routerInstance = new aws.ec2.Instance("tailscale-subnet-router", {
  ami: amazonLinux2.id,
  instanceType: aws.ec2.InstanceTypes.T3_Micro,
  vpcSecurityGroupIds: [sg.id],
  subnetId: vpcStack.getOutput("privateSubnet1"),
  userData: userdata,
  userDataReplaceOnChange: true,
  tags: {
    Name: "tailscale-subnet-router",
  },
  iamInstanceProfile: instanceProfile.name,
});

export const routerInstancePrivateIp = routerInstance.privateIp;