import * as pulumi from "@pulumi/pulumi";
import * as random from "@pulumi/random";

export interface RandomComponentArgs {
    length?: pulumi.Input<number>;
}

export class RandomComponent extends pulumi.ComponentResource {
    public readonly password: pulumi.Output<string>;

    constructor(name: string, args: RandomComponentArgs, opts?: pulumi.ComponentResourceOptions) {
        super("create-component:index:RandomComponent", name, args, opts);
        const password = new random.RandomPassword(`${name}-password`, {
            length: args.length || 16,
        }, { parent: this });

        this.password = password.result;
    }
}