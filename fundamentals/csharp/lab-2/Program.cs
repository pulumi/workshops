using System.Collections.Generic;
using Pulumi;
using Docker = Pulumi.Docker;

return await Deployment.RunAsync(() => 
{
    var backendImageName = "backend";

    var frontendImageName = "frontend";

    var backendImage = new Docker.RemoteImage("backend-image", new()
    {
        Name = "pulumi/tutorial-pulumi-fundamentals-backend:latest",
    });

    var frontendImage = new Docker.RemoteImage("frontend-image", new()
    {
        Name = "pulumi/tutorial-pulumi-fundamentals-frontend:latest",
    });

    var mongoImage = new Docker.RemoteImage("mongo-image", new()
    {
        Name = "pulumi/tutorial-pulumi-fundamentals-database-local:latest",
    });

});

