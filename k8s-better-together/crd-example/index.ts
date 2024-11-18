import * as crds from "./crds";

new crds.stable.v1.CronTab("my-crontab", {
  metadata: {
    name: "my-new-cron-object",
  },
  spec: {
    cronSpec: "* * * * */5",
    image: "my-awesome-cron-image",
  }
});
