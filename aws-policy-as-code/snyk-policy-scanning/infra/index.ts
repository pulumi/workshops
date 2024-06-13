import * as docker from "@pulumi/docker";

new docker.Image("alpine", {
  imageName: "docker.io/joshkodroff/snyk-policy-alpine",
  buildOnPreview: true,
  build: {
    dockerfile: "Dockerfile",
    platform: "linux/amd64",
  },
  skipPush: true,
});