import * as pulumi from "@pulumi/pulumi";
import { KbindProvider } from "./kbind-provider";

// Config (pulumi config set <key> <value>), all optional:
//   installBackend   true|false  demo step 3 switch, default true
//   exportApi        true|false  demo step 4 switch, default true
//   externalAddress  http://<lb-hostname>, set by 02-provider/set-external-address.sh (phase two)
//   chartPath        local chart directory, set by 02-provider/pull-chart.sh (OCI fallback)
//   loadBalancerType nlb (default) | clb
const config = new pulumi.Config();

const provider = new KbindProvider("kbind", {
    clusterName: `${pulumi.getProject()}-${pulumi.getStack()}`,
    installBackend: config.getBoolean("installBackend"),
    exportApi: config.getBoolean("exportApi"),
    externalAddress: config.get("externalAddress"),
    chartPath: config.get("chartPath"),
    loadBalancerType: config.get("loadBalancerType"),
});

export const clusterName = provider.clusterName;
export const kubeconfig = provider.kubeconfig; // secret
export const backendHost = provider.backendHost;
export const backendUrl = provider.backendUrl; // read by the consumer stacks through ESC
