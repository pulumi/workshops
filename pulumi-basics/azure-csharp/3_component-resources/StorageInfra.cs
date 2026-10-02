////
// Component Resource Shell
// (commented out to avoid compilation errors until ready to use)
////

// using System;
// using System.Collections.Generic;
// using System.Linq;
// using System.Threading.Tasks;
// using Pulumi;
// using Pulumi.AzureNative.Storage;
// using Pulumi.AzureNative.Storage.Inputs;

// class MyStorageInfraArgs
// {
//     public Input<string> Parameter1 { get; set; } = null!;
// }

// class MyStorageInfra: Pulumi.ComponentResource
// {
//     public Output<string> Output1;
//     public Output<string> Output2;
//     public Output<string> Output3;
//     public Output<string> Output4;

//     public MyStorageInfra(string name, MyStorageInfraArgs args, ComponentResourceOptions? opts = null)
//         : base("custom:x:StorageInfra", name, opts)
//     {
//         /////
//         // Declare the children resources (i.e. storageAccount) be sure to include a resource option of "Parent = this".
//         /////

//         this.Output = OutputValue

//     }
// }