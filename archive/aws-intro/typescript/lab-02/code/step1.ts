import * as aws from "@pulumi/aws";

const ami = aws.getAmi({
    filters: [{ name: "name", values: ["amzn-ami-hvm-*-x86_64-ebs"] }],
    owners: [ "137112412989" ],
    mostRecent: true,
}).then(ami => ami.id);

const sg = new aws.ec2.SecurityGroup("web-secgrp", {
    ingress: [
        { protocol: "icmp", fromPort: 8, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
        { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
    ],
});

const server = new aws.ec2.Instance("web-server", {
    instanceType: "t2.micro",
    securityGroups: [ sg.name ],
    ami: ami,
    userData: "#!/bin/bash\n"+
        "echo 'Hello, World!' > index.html\n" +
        "nohup python -m SimpleHTTPServer 80 &",
    tags: { "Name": "web-server" },
});

export const ip = server.publicIp;
export const hostname = server.publicDns;
