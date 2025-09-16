import * as pattern2 from "./sdks/minecraft-server";

const minecraftServer = new pattern2.MinecraftServer("minecraft-server", {
    publicKeyPath: "/Users/dirien/Tools/repos/stackit-minecraft/minecraft/ssh/minecraft.pub"
});

export const serverIP = minecraftServer.serverIP;
