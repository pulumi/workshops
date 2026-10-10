"""Step 4 standalone: `pulumi preview` shows the five resources of one sandbox."""
import pulumi

from sandbox import sandbox_program

config = pulumi.Config()
sandbox_program(
    task_id=config.require("taskId"),
    boundary_arn=config.require("boundaryArn"),
    owner=config.get("owner") or "demo",
    expires_at=config.get("expiresAt") or "2099-01-01T00:00:00Z",
)()
