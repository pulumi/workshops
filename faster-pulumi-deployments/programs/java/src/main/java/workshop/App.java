package workshop;

import com.pulumi.Pulumi;
import com.pulumi.core.Output;
import com.pulumi.random.RandomPet;
import com.pulumi.random.RandomPetArgs;

public class App {
    public static void main(String[] args) {
        Pulumi.run(ctx -> {
            var environment = ctx.config().require("environment");
            var pet = new RandomPet("name", RandomPetArgs.builder()
                .prefix(environment)
                .length(2)
                .build());
            ctx.export("environment", Output.of(environment));
            ctx.export("name", pet.id());
        });
    }
}
