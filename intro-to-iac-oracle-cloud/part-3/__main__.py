import pulumi
import pulumi_oci as oci

# config
config = pulumi.Config()
compartment_ocid = config.require_secret('compartmentOcid')
kubernetes_version = "v1.23.4"

# artifacts/registry
registry = oci.artifacts.ContainerRepository(
    "container-repo",
    display_name="laura-container-repo",
    compartment_id=compartment_ocid,
    is_public=True
)

# networking
vcn = oci.core.Vcn(
    "vcn",
    cidr_blocks=['10.0.0.0/16'],
    compartment_id=compartment_ocid,
)

nat_gateway = oci.core.NatGateway(
    "nat_gateway",
    compartment_id=compartment_ocid,
    vcn_id=vcn.id
)

internet_gateway = oci.core.InternetGateway(
    "oke_internet_gateway",
    compartment_id=compartment_ocid,
    vcn_id=vcn.id
)

service_gateway = oci.core.ServiceGateway(
    "service_gateway",
    compartment_id=compartment_ocid,
    services=[oci.core.ServiceGatewayServiceArgs(
        service_id=oci.core.get_services().services[1].id,
    )],
    vcn_id=vcn.id
)

svc_lb_seclist = oci.core.SecurityList(
    "svc_lb_security_list",
    compartment_id=compartment_ocid,
    vcn_id=vcn.id
)

api_endpoint_seclist = oci.core.SecurityList(
    "api_endpoint_security_list",
    compartment_id=compartment_ocid,
    egress_security_rules=[
        oci.core.SecurityListEgressSecurityRuleArgs(
            description="Path discovery",
            destination="10.0.10.0/24",
            destination_type="CIDR_BLOCK",
            icmp_options=oci.core.SecurityListEgressSecurityRuleIcmpOptionsArgs(
                code=4,
                type=3,
            ),
            protocol="1",
        ),
        oci.core.SecurityListEgressSecurityRuleArgs(
            description="Allow Kubernetes Control Plane to communicate with OKE",
            destination="all-iad-services-in-oracle-services-network",
            destination_type="SERVICE_CIDR_BLOCK",
            protocol="6",
            tcp_options=oci.core.SecurityListEgressSecurityRuleTcpOptionsArgs(
                max=443,
                min=443,
            ),
        ),
        oci.core.SecurityListEgressSecurityRuleArgs(
            description="All traffic to worker nodes",
            destination="10.0.10.0/24",
            destination_type="CIDR_BLOCK",
            protocol="6",
        ),
    ],
    ingress_security_rules=[
        oci.core.SecurityListIngressSecurityRuleArgs(
            description="Kubernetes worker to control plane communication",
            protocol="6",
            source="10.0.10.0/24",
            source_type="CIDR_BLOCK",
            tcp_options=oci.core.SecurityListIngressSecurityRuleTcpOptionsArgs(
                max=12250,
                min=12250,
            ),
        ),
        oci.core.SecurityListIngressSecurityRuleArgs(
            description="Kubernetes worker to Kubernetes API endpoint communication",
            protocol="6",
            source="10.0.10.0/24",
            source_type="CIDR_BLOCK",
            tcp_options=oci.core.SecurityListIngressSecurityRuleTcpOptionsArgs(
                max=6443,
                min=6443,
            ),
        ),
        oci.core.SecurityListIngressSecurityRuleArgs(
            description="External access to Kubernetes API endpoint",
            protocol="6",
            source="0.0.0.0/0",
            source_type="CIDR_BLOCK",
            tcp_options=oci.core.SecurityListIngressSecurityRuleTcpOptionsArgs(
                max=6443,
                min=6443,
            ),
        ),
        oci.core.SecurityListIngressSecurityRuleArgs(
            description="Path discovery",
            icmp_options=oci.core.SecurityListIngressSecurityRuleIcmpOptionsArgs(
                code=4,
                type=3,
            ),
            protocol="1",
            source="10.0.10.0/24",
            source_type="CIDR_BLOCK",
        ),
    ],
    vcn_id=vcn.id
)
node_seclist = oci.core.SecurityList(
    "node_security_list",
    compartment_id=compartment_ocid,
    egress_security_rules=[
        oci.core.SecurityListEgressSecurityRuleArgs(
            description="Kubernetes worker to control plane communication",
            destination="10.0.0.0/28",
            destination_type="CIDR_BLOCK",
            protocol="6",
            tcp_options=oci.core.SecurityListEgressSecurityRuleTcpOptionsArgs(
                max=12250,
                min=12250,
            ),
        ),
        oci.core.SecurityListEgressSecurityRuleArgs(
            description="Worker Nodes access to Internet",
            destination="0.0.0.0/0",
            destination_type="CIDR_BLOCK",
            protocol="all",
        ),
        oci.core.SecurityListEgressSecurityRuleArgs(
            description="Access to Kubernetes API Endpoint",
            destination="10.0.0.0/28",
            destination_type="CIDR_BLOCK",
            protocol="6",
            tcp_options=oci.core.SecurityListEgressSecurityRuleTcpOptionsArgs(
                max=6443,
                min=6443,
            ),
        ),
        oci.core.SecurityListEgressSecurityRuleArgs(
            description="Path discovery",
            destination="10.0.0.0/28",
            destination_type="CIDR_BLOCK",
            icmp_options=oci.core.SecurityListEgressSecurityRuleIcmpOptionsArgs(
                code=4,
                type=3,
            ),
            protocol="1",
        ),
        oci.core.SecurityListEgressSecurityRuleArgs(
            description="ICMP Access from Kubernetes Control Plane",
            destination="0.0.0.0/0",
            destination_type="CIDR_BLOCK",
            icmp_options=oci.core.SecurityListEgressSecurityRuleIcmpOptionsArgs(
                code=4,
                type=3,
            ),
            protocol="1",
        ),
        oci.core.SecurityListEgressSecurityRuleArgs(
            description="Allow nodes to communicate with OKE to ensure correct start-up and continued functioning",
            destination=oci.core.get_services().services[1].cidr_block,
            destination_type="SERVICE_CIDR_BLOCK",
            protocol="6",
            tcp_options=oci.core.SecurityListEgressSecurityRuleTcpOptionsArgs(
                max=443,
                min=443,
            ),
        ),
        oci.core.SecurityListEgressSecurityRuleArgs(
            description="Allow pods on one worker node to communicate with pods on other worker nodes",
            destination="10.0.10.0/24",
            destination_type="CIDR_BLOCK",
            protocol="all",
        ),
    ],
    ingress_security_rules=[
        oci.core.SecurityListIngressSecurityRuleArgs(
            description="Path discovery",
            icmp_options=oci.core.SecurityListIngressSecurityRuleIcmpOptionsArgs(
                code=4,
                type=3,
            ),
            protocol="1",
            source="10.0.0.0/28",
            source_type="CIDR_BLOCK",
        ),
        oci.core.SecurityListIngressSecurityRuleArgs(
            description="Inbound SSH traffic to worker nodes",
            protocol="6",
            source="0.0.0.0/0",
            source_type="CIDR_BLOCK",
            tcp_options=oci.core.SecurityListIngressSecurityRuleTcpOptionsArgs(
                max=22,
                min=22,
            ),
        ),
        oci.core.SecurityListIngressSecurityRuleArgs(
            description="Allow pods on one worker node to communicate with pods on other worker nodes",
            protocol="all",
            source="10.0.10.0/24",
            source_type="CIDR_BLOCK",
        ),
        oci.core.SecurityListIngressSecurityRuleArgs(
            description="TCP access from Kubernetes Control Plane",
            protocol="6",
            source="10.0.0.0/28",
            source_type="CIDR_BLOCK",
        ),
    ],
    vcn_id=vcn.id
)

node_route_table = oci.core.RouteTable(
    "oke_node_route_table",
    compartment_id=compartment_ocid,
    route_rules=[
        oci.core.RouteTableRouteRuleArgs(
            description="traffic to OCI services",
            destination="all-iad-services-in-oracle-services-network",
            destination_type="SERVICE_CIDR_BLOCK",
            network_entity_id=service_gateway.id,
        ),
        oci.core.RouteTableRouteRuleArgs(
            description="traffic to the internet",
            destination="0.0.0.0/0",
            destination_type="CIDR_BLOCK",
            network_entity_id=nat_gateway.id,
        ),
    ],
    vcn_id=vcn.id
)

svc_lb_route_table = oci.core.RouteTable(
    "oke_svclb_route_table",
    compartment_id=compartment_ocid,
    route_rules=[oci.core.RouteTableRouteRuleArgs(
        description="traffic to/from internet",
        destination="0.0.0.0/0",
        destination_type="CIDR_BLOCK",
        network_entity_id=internet_gateway.id,
    )],
    vcn_id=vcn.id
)

node_subnet = oci.core.Subnet(
    "node_subnet",
    cidr_block="10.0.10.0/24",
    compartment_id=compartment_ocid,
    route_table_id=node_route_table.id,
    security_list_ids=[node_seclist.id],
    vcn_id=vcn.id
)

lb_subnet = oci.core.Subnet(
    "lb_subnet",
    cidr_block="10.0.20.0/24",
    compartment_id=compartment_ocid,
    route_table_id=svc_lb_route_table.id,
    security_list_ids=[svc_lb_seclist.id],
    vcn_id=vcn.id
)

api_endpoint_subnet = oci.core.Subnet(
    "api_endpoint_subnet",
    cidr_block="10.0.0.0/28",
    compartment_id=compartment_ocid,
    route_table_id=svc_lb_route_table.id,
    security_list_ids=[api_endpoint_seclist.id],
    vcn_id=vcn.id
)

# kubernetes
cluster = oci.containerengine.Cluster(
    "oke-cluster",
    compartment_id=compartment_ocid,
    endpoint_config=oci.containerengine.ClusterEndpointConfigArgs(
        is_public_ip_enabled=True,
        subnet_id=api_endpoint_subnet.id
    ),
    name="pulumi-oke",
    kubernetes_version=kubernetes_version,
    vcn_id=vcn.id,
    options=oci.containerengine.ClusterOptionsArgs(
        kubernetes_network_config=oci.containerengine.ClusterOptionsKubernetesNetworkConfigArgs(
            pods_cidr="10.244.0.0/16",
            services_cidr="10.96.0.0/16",
        ),
        persistent_volume_config=oci.containerengine.ClusterOptionsPersistentVolumeConfigArgs(),
        service_lb_config=oci.containerengine.ClusterOptionsServiceLbConfigArgs(),
        service_lb_subnet_ids=[lb_subnet.id]
    )
)

cluster_kube_config = cluster.id.apply(lambda cid: oci.containerengine.get_cluster_kube_config(cluster_id=cid))
full_content = cluster_kube_config.content.apply(lambda cc: open('generated/kubeconfig', 'w+').write(cc))
    # cluster_kube_config.content.apply(lambda config_content: file.write(config_content))

get_ad_name = oci.identity.get_availability_domain(
    compartment_id=compartment_ocid,
    ad_number=1
)

node_image = oci.core.get_images(
    compartment_id=compartment_ocid,
    operating_system="Oracle Linux",
    operating_system_version="7.9",
    shape="VM.Standard.E4.Flex",
    sort_by="TIMECREATED",
    sort_order="DESC"
)

node_pool = oci.containerengine.NodePool(
    "oke_node_pool_1",
    cluster_id=cluster.id,
    compartment_id=compartment_ocid,
    initial_node_labels=[oci.containerengine.NodePoolInitialNodeLabelArgs(
        key="name",
        value="pool1",
    )],
    kubernetes_version=kubernetes_version,
    name="oke_nodepool_1",
    node_config_details=oci.containerengine.NodePoolNodeConfigDetailsArgs(
        placement_configs=[oci.containerengine.NodePoolNodeConfigDetailsPlacementConfigArgs(
            availability_domain=get_ad_name.__dict__['name'],
            subnet_id=node_subnet.id,
        )],
        size=3
    ),
    node_shape="VM.Standard.E4.Flex",
    node_shape_config=oci.containerengine.NodePoolNodeShapeConfigArgs(
        memory_in_gbs=16,
        ocpus=1
    ),
    node_source_details=oci.containerengine.NodePoolNodeSourceDetailsArgs(
        image_id=node_image.__dict__['images'][0].get('id'),
        source_type="IMAGE"
    )
)

external_endpoints = pulumi.export("endpoint", cluster.endpoints[0]['public_endpoint'])

