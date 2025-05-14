import * as modminecraft from "@pulumi/modminecraft";

const server = new modminecraft.Module("minecraft-server", {
    name: "minecraft-server",
    public_key_path: "/Users/dirien/Tools/repos/stackit-minecraft/minecraft/ssh/minecraft.pub"
})

export const serverIP = server.minecraft_instance_public_ip
