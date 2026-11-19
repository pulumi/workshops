import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

// Step 2: a service to watch.
//
// The image is a public echo server. It answers 200 on any path, and it answers
// with the status code you ask for when the request carries
// `?x-set-response-status-code=500`. That query parameter is the failure switch
// used in step 9 (06-break/send-requests.sh). Cloud Run runs it with no code
// of ours in the demo.
const config = new pulumi.Config();
const serviceName = config.get("serviceName") ?? "hello-api";
const region = new pulumi.Config("gcp").require("region");

const service = new gcp.cloudrunv2.Service("service", {
    name: serviceName,
    location: region,
    ingress: "INGRESS_TRAFFIC_ALL",
    // Public demo endpoint: no IAM check on the serving URL.
    invokerIamDisabled: true,
    // Lets `pulumi destroy` remove the service in step 10.
    deletionProtection: false,
    template: {
        scaling: { maxInstanceCount: 2 },
        containers: [{
            image: "docker.io/mendhak/http-https-echo:42",
            ports: { containerPort: 8080 },
        }],
    },
});

export const url = service.uri;
export const name = service.name;
