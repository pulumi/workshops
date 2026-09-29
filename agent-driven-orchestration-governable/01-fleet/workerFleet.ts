import * as pulumi from "@pulumi/pulumi";
import * as random from "@pulumi/random";

export interface WorkerFleetArgs {
    /** How many worker replicas the fleet should run this apply. */
    replicaCount: number;
    /** Changing this value forces configVersion to rotate. */
    rotateTrigger: string;
    /**
     * Workshop simplification of an external approval source: the value the
     * require-approval-flag policy rule inspects. A real system would carry
     * this from a change-management or ChatOps approval, not from config the
     * same script that requests the change also sets. It is attached to the
     * marker resource's `keepers` below because Pulumi Policies validate
     * resources (validateResource/validateStack), not raw stack config
     * values directly — there is no documented mechanism for a policy to
     * read `pulumi.Config`. See 02-policy/AGENTS.md.
     */
    approved: boolean;
    /** Name of the action being attempted, recorded on the marker for audit context. */
    action: string;
}

/**
 * A worker fleet, standing in for a real cloud resource so the workshop
 * needs no cloud credentials and no cost. Every resource here comes from the
 * `random` provider, which Pulumi treats like any other provider (state,
 * diffs, policy evaluation) without touching a real cloud. Scaling the fleet
 * is a plain resource-count change: `pulumi preview` shows it as additions
 * or deletions, the same way a real autoscaling group would.
 */
export class WorkerFleet extends pulumi.ComponentResource {
    public readonly replicaCount: number;
    public readonly configVersion: pulumi.Output<string>;
    public readonly workerIds: pulumi.Output<string>[];
    public readonly approved: boolean;

    constructor(name: string, args: WorkerFleetArgs, opts?: pulumi.ComponentResourceOptions) {
        super("workshop:agent-fleet:WorkerFleet", name, {}, opts);

        // The marker resource: one per apply, carrying the approval flag and
        // the requested action so require-approval-flag has something
        // concrete to inspect. It has no other purpose.
        const marker = new random.RandomId(
            `${name}-change-marker`,
            {
                byteLength: 4,
                keepers: {
                    approved: String(args.approved),
                    action: args.action,
                    replicaCount: String(args.replicaCount),
                },
            },
            { parent: this },
        );

        // One identity resource per active replica. Recreated whenever
        // replicaCount changes; that is the "scale" the orchestrator drives.
        const workerIds: pulumi.Output<string>[] = [];
        for (let i = 0; i < args.replicaCount; i++) {
            const worker = new random.RandomId(`${name}-worker-${i}`, { byteLength: 4 }, { parent: this });
            workerIds.push(pulumi.interpolate`worker-${i}:${worker.id}`);
        }
        this.workerIds = workerIds;

        const configVersion = new random.RandomString(
            `${name}-config-version`,
            {
                length: 10,
                special: false,
                keepers: { rotate: args.rotateTrigger },
            },
            { parent: this },
        );

        this.replicaCount = args.replicaCount;
        this.configVersion = configVersion.result;
        this.approved = args.approved;

        this.registerOutputs({
            replicaCount: this.replicaCount,
            configVersion: this.configVersion,
            approved: this.approved,
            marker: marker.id,
        });
    }
}
