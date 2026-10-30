import * as pulumi from "@pulumi/pulumi";
import * as random from "@pulumi/random";

const config = new pulumi.Config();
export const environment = config.require("environment");
const pet = new random.RandomPet("name", {
    prefix: environment,
    length: 2,
});
export const name = pet.id;
