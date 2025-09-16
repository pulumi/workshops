import * as pulumi from "@pulumi/pulumi";
import * as modminecraft from "@pulumi/modminecraft";

interface MinecraftServerArgs {
    publicKeyPath: pulumi.Input<string>;
}

export class MinecraftServer extends pulumi.ComponentResource {
    public readonly serverIP: pulumi.Output<string>;

    constructor(name: string, args: MinecraftServerArgs, opts?: pulumi.ResourceOptions) {
        super("minecraft:index:MineCraftServer", name, opts);
        const server = new modminecraft.Module("minecraft-server", {
            name: "minecraft-server",
            public_key_path: args.publicKeyPath
        }, {parent: this});

        this.serverIP = server.minecraft_instance_public_ip as pulumi.Output<string>;
        this.registerOutputs({
            serverIP: server.minecraft_instance_public_ip
        });
    }
}
