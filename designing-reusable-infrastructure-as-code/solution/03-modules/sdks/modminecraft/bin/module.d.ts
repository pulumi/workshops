import * as pulumi from "@pulumi/pulumi";
export declare class Module extends pulumi.ComponentResource {
    /**
     * Returns true if the given object is an instance of Module.  This is designed to work even
     * when multiple copies of the Pulumi SDK have been loaded into the same process.
     */
    static isInstance(obj: any): obj is Module;
    /**
     * The ID of the Amazon Linux AMI
     */
    readonly ami_id: pulumi.Output<string | undefined>;
    /**
     * The ID of the Minecraft instance
     */
    readonly minecraft_instance_id: pulumi.Output<string | undefined>;
    /**
     * The private IP address of the Minecraft instance
     */
    readonly minecraft_instance_private_ip: pulumi.Output<string | undefined>;
    /**
     * The public IP address of the Minecraft instance
     */
    readonly minecraft_instance_public_ip: pulumi.Output<string | undefined>;
    /**
     * The ID of the security group for the Minecraft instance
     */
    readonly minecraft_security_group_id: pulumi.Output<string | undefined>;
    /**
     * The name of the security group for the Minecraft instance
     */
    readonly minecraft_security_group_name: pulumi.Output<string | undefined>;
    /**
     * Create a Module resource with the given unique name, arguments, and options.
     *
     * @param name The _unique_ name of the resource.
     * @param args The arguments to use to populate this resource's properties.
     * @param opts A bag of options that control this resource's behavior.
     */
    constructor(name: string, args?: ModuleArgs, opts?: pulumi.ComponentResourceOptions);
}
/**
 * The set of arguments for constructing a Module resource.
 */
export interface ModuleArgs {
    /**
     * The EC2 instance type for the Minecraft server
     */
    instance_type?: pulumi.Input<string>;
    /**
     * The maximum amount of memory (in MB) to allocate to the Minecraft server
     */
    java_max_memory?: pulumi.Input<string>;
    /**
     * The base name to use for the Minecraft instance and security group
     */
    name?: pulumi.Input<string>;
    /**
     * The personal IP address to allow SSH access to the Minecraft instance
     */
    personal_ip?: pulumi.Input<string>;
    /**
     * The subnet mask for the personal IP, typically set to '32' for a single IP address
     */
    personal_subnet?: pulumi.Input<string>;
    /**
     * The path to the public key file for SSH access
     */
    public_key_path?: pulumi.Input<string>;
    /**
     * The AWS region where the resources will be created
     */
    region?: pulumi.Input<string>;
    /**
     * The URL from which the Minecraft server.jar file will be downloaded
     */
    server_url?: pulumi.Input<string>;
}
