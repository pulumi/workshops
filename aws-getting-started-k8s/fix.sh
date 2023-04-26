#!/bin/bash
vpc="vpc-069086e75a5940b21"
region="us-west-2"
aws ec2 describe-internet-gateways --region $region --filters 'Name=attachment.vpc-id,Values='$vpc | grep InternetGatewayId
aws ec2 describe-subnets --region $region --filters 'Name=vpc-id,Values='$vpc | grep SubnetId
aws ec2 describe-route-tables --region $region --filters 'Name=vpc-id,Values='$vpc | grep RouteTableId
aws ec2 describe-network-acls --region $region --filters 'Name=vpc-id,Values='$vpc | grep NetworkAclId
aws ec2 describe-vpc-peering-connections --region $region --filters 'Name=requester-vpc-info.vpc-id,Values='$vpc | grep VpcPeeringConnectionId
aws ec2 describe-vpc-endpoints --region $region --filters 'Name=vpc-id,Values='$vpc | grep VpcEndpointId
aws ec2 describe-nat-gateways --region $region --filter 'Name=vpc-id,Values='$vpc | grep NatGatewayId
aws ec2 describe-security-groups --region $region --filters 'Name=vpc-id,Values='$vpc | grep GroupId
aws ec2 describe-instances --region $region --filters 'Name=vpc-id,Values='$vpc | grep InstanceId
aws ec2 describe-vpn-connections --region $region --filters 'Name=vpc-id,Values='$vpc | grep VpnConnectionId
aws ec2 describe-vpn-gateways --region $region --filters 'Name=attachment.vpc-id,Values='$vpc | grep VpnGatewayId
aws ec2 describe-network-interfaces --region $region --filters 'Name=vpc-id,Values='$vpc | grep NetworkInterfaceId
aws ec2 describe-carrier-gateways --region $region --filters Name=vpc-id,Values=$vpc | grep CarrierGatewayId
aws ec2 describe-local-gateway-route-table-vpc-associations --region $region --filters Name=vpc-id,Values=$vpc | grep LocalGatewayRouteTableVpcAssociationId
