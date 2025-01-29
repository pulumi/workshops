import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const current = aws.getRegionOutput({});
const name = "convert-tf";
const azs = [
    current.apply(current => `${current.name}a`),
    current.apply(current => `${current.name}b`),
    current.apply(current => `${current.name}c`),
];

const publicSubnetCidrs = [
    "10.0.1.0/24",
    "10.0.2.0/24",
    "10.0.3.0/24",
];

const privateSubnetCidrs = [
    "10.0.4.0/24",
    "10.0.5.0/24",
    "10.0.6.0/24",
];

const main = new aws.ec2.Vpc("main", {
    cidrBlock: "10.0.0.0/16",
    tags: {
        Name: name,
    },
});

const igw = new aws.ec2.InternetGateway("igw", {
    vpcId: main.id,
    tags: {
        Name: "convert-tf",
    },
});

const publicSubnets: aws.ec2.Subnet[] = [];
const publicRouteTables: aws.ec2.RouteTable[] = [];
const publicRouteTableAssociations: aws.ec2.RouteTableAssociation[] = [];
const publicIgwRoute: aws.ec2.Route[] = [];

for (const range = { value: 0 }; range.value < publicSubnetCidrs.length; range.value++) {
    publicSubnets.push(new aws.ec2.Subnet(`public_subnets-${range.value}`, {
        vpcId: main.id,
        availabilityZone: azs[range.value],
        cidrBlock: publicSubnetCidrs[range.value],
        tags: {
            Name: `convert-tf-public-${range.value + 1}`,
        },
    }));

    publicRouteTables.push(new aws.ec2.RouteTable(`public_route_tables-${range.value}`, {
        vpcId: main.id,
        tags: {
            Name: `convert-tf-public-${range.value + 1}`,
        },
    }));

    publicRouteTableAssociations.push(new aws.ec2.RouteTableAssociation(`public_route_table_associations-${range.value}`, {
        subnetId: publicSubnets.map(__item => __item.id)[range.value],
        routeTableId: publicRouteTables[0].id,
    }));

    publicIgwRoute.push(new aws.ec2.Route(`public_igw_route-${range.value}`, {
        routeTableId: publicRouteTables[range.value].id,
        destinationCidrBlock: "0.0.0.0/0",
        gatewayId: igw.id,
    }));
}

const eip = new aws.ec2.Eip("eip", {
    tags: {
        Name: name,
    }
});

const natgw = new aws.ec2.NatGateway("natgw", {
    subnetId: publicSubnets[0].id,
    allocationId: eip.allocationId,
    tags: {
        Name: name,
    },
});

const privateSubnets: aws.ec2.Subnet[] = [];
const privateRouteTables: aws.ec2.RouteTable[] = [];
const privateRouteTableAssociations: aws.ec2.RouteTableAssociation[] = [];
const privateNatgwRoutes: aws.ec2.Route[] = [];

for (const range = { value: 0 }; range.value < privateSubnetCidrs.length; range.value++) {
    privateSubnets.push(new aws.ec2.Subnet(`private_subnets-${range.value}`, {
        vpcId: main.id,
        availabilityZone: azs[range.value],
        cidrBlock: privateSubnetCidrs[range.value],
        tags: {
            Name: `convert-tf-private-${range.value + 1}`,
        },
    }));

    privateRouteTables.push(new aws.ec2.RouteTable(`private_route_tables-${range.value}`, {
        vpcId: main.id,
        tags: {
            Name: "convert-tf-private",
        },
    }));

    privateRouteTableAssociations.push(new aws.ec2.RouteTableAssociation(`private_route_table_associations-${range.value}`, {
        subnetId: privateSubnets.map(__item => __item.id)[range.value],
        routeTableId: privateRouteTables[range.value].id,
    }));

    privateNatgwRoutes.push(new aws.ec2.Route(`private_natgw_routes-${range.value}`, {
        routeTableId: privateRouteTables[range.value].id,
        destinationCidrBlock: "0.0.0.0/0",
        natGatewayId: natgw.id,
    }));
}

export const vpcId = main.id;
export const privateSubnetIds = privateSubnets.map(__item => __item.id);
export const publicSubnetIds = publicSubnets.map(__item => __item.id);
