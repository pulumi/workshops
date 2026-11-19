import * as pulumi from "@pulumi/pulumi";
import { KbindConsumer } from "./kbind-consumer";

// Config comes from the stack's Pulumi ESC environment (pulumiConfig):
//   kbind-consumer:consumerName  e.g. consumer-a
//   kbind-consumer:providerUrl   the provider stack's backendUrl output
const config = new pulumi.Config();

const consumer = new KbindConsumer("kbind", {
    clusterName: `${pulumi.getProject()}-${pulumi.getStack()}`,
    consumerName: config.require("consumerName"),
    providerUrl: config.require("providerUrl"),
});

export const clusterName = consumer.clusterName;
export const kubeconfig = consumer.kubeconfig; // secret
export const providerUrl = consumer.providerUrl;
export const bindCommands = consumer.bindCommands;
