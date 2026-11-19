import * as pulumi from "@pulumi/pulumi";
import { Foundation } from "./foundation";
import { RotatingSecret } from "./rotatingSecret";

const config = new pulumi.Config();
// 2 = foundation, 3 = + secret, 4 = + rotation Lambda and schedule.
const demoStep = config.getNumber("demoStep") ?? 4;
// Step 9: `unrotated` adds a second secret that has no rotation, `rotated` one that has.
const extraSecret = config.get("extraSecret") ?? "none";
const escOrg = config.require("escOrg");

const foundation = new Foundation("workshop", {
    escOrg,
    existingOidcProviderArn: config.get("existingOidcProviderArn"),
});

export const oidcProviderArn = foundation.oidcProviderArn;
export const escRoleArn = foundation.escRoleArn;
export const lambdaRoleArn = foundation.lambdaRoleArn;
export const demoUserArn = foundation.demoUserArn;
export const demoUserName = foundation.demoUserName;

if (demoStep >= 3) {
    const appToken = new RotatingSecret("app-token", {
        lambdaRoleArn: foundation.lambdaRoleArn,
        rotate: demoStep >= 4,
    });
    exports.secretArn = appToken.secretArn;
    exports.secretName = appToken.secretName;
}

if (extraSecret === "unrotated" || extraSecret === "rotated") {
    const extra = new RotatingSecret("extra-token", {
        lambdaRoleArn: foundation.lambdaRoleArn,
        rotate: extraSecret === "rotated",
    });
    exports.extraSecretArn = extra.secretArn;
}
