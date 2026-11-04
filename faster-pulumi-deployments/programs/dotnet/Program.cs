using Pulumi;
using Pulumi.Random;

return await Deployment.RunAsync(() =>
{
    var environment = new Pulumi.Config().Require("environment");
    var pet = new RandomPet("name", new RandomPetArgs
    {
        Prefix = environment,
        Length = 2,
    });
    return new Dictionary<string, object?>
    {
        ["environment"] = environment,
        ["name"] = pet.Id,
    };
});
