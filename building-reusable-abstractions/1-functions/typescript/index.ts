import * as civo from "@pulumi/civo";

new civo.Network("one-functions", {
  label: "pulumi-workshop",
});
