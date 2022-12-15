# AWS Advanced Networking

This repo contains a Pulumi program that creates a hub-and-spoke network architecture on AWS in Python for a workshop delivered on 2022-12-13.

Presentation notes:

- Start with all resources spun up because AWS Firewall and TGW take too long to provision in a live workshop.
- To demonstrate moving parts, un/comment the calls between `create_direct_nat_routes` (which will route traffic directly from the TGW in the hub to the NAT gateways) and `create_firewall_routes` (which will route traffic through the firewall before going out through the NAT gateways.
- To demonstrate traffic going through the NAT gateway (centralized egress), start an SSM session on an instance in the spoke and execute `curl icanhazip.com`. The result will match the NAT Gateway's EIP (which is an output of this stack).
- To demonstrate traffic going through the firewall (which has rules configured to only allow HTTPS to `*.amazon.com` destinations), start an SSM session on a host in one of the spokes and execute `curl https://amazon.com`. You should see a `301` response with corresponding markup.

    **NOTE:** At the time of writing, this behavior is flaky and it's not clear why. You may need to `Ctrl-C` several times after executing `curl` in order to see the output. However, we can prove that the firewall is filtering out non-Amazon traffic because `curl https://google.com` will never return a response, no matter how many times we hit `Ctrl-C`.
- If additional content is needed to fill out the session, provision an additional spoke VPC (resources are commented out at the bottom of `__main__.py`).
