import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as auto from "@pulumi/pulumi/automation";
import { fleetClusterProgram } from "./program";

// Steps 5, 6, 8 and 9: the rollout engine. One inline program (program.ts),
// one stack per cluster, driven through the Automation API.
//
//   node bin/rollout.js wave 1                  create canary-1
//   node bin/rollout.js wave 2                  create rest-1 and rest-2 in parallel
//   node bin/rollout.js reconcile --version 1.36   refresh, set the version, preview
//   node bin/rollout.js destroy                 rest-1 and rest-2, then canary-1
//
// Flags: --preview-only (never run `up` or `destroy`), --offline (no Pulumi
// Cloud: skips the ESC environments and sets config directly; for a local
// backend, see README.md). PULUMI_ORG names the organization of the stacks.

interface Cluster { name: string; group: string; wave: number; }

const exec = promisify(execFile);
const clusters: Cluster[] = JSON.parse(readFileSync(join(__dirname, "..", "clusters.json"), "utf8"));
const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const option = (name: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const previewOnly = flag("preview-only");
const offline = flag("offline");
const org = process.env.PULUMI_ORG;

const say = (cluster: string, line: string) => console.log(`[${cluster}] ${line}`);
const onOutput = (cluster: string) => (text: string) =>
    text.split("\n").filter(l => l.trim().length > 0).forEach(l => say(cluster, l));

async function selectStack(cluster: Cluster): Promise<auto.Stack> {
    const stackName = org ? `${org}/${cluster.name}` : cluster.name;
    const stack = await auto.LocalWorkspace.createOrSelectStack({
        stackName,
        projectName: "fleet-cluster",
        program: fleetClusterProgram,
    });
    if (offline) {
        await stack.setConfig("azure-native:location", { value: "westeurope" });
        await stack.setConfig("fleet-cluster:vmSize", { value: "Standard_D2ds_v5" });
        await stack.setConfig("fleet-cluster:group", { value: cluster.group });
        await stack.setConfig("fleet-cluster:kubernetesVersion", { value: option("version") ?? "1.35" });
    } else {
        // Credentials, region, group and version come from the ESC environment fleet/<cluster>.
        await stack.addEnvironments(`fleet/${cluster.name}`);
    }
    return stack;
}

function printOutputs(cluster: string, outputs: auto.OutputMap) {
    for (const [key, output] of Object.entries(outputs)) {
        say(cluster, `output ${key} = ${output.secret ? "[secret]" : output.value}`);
    }
}

async function deploy(cluster: Cluster) {
    const stack = await selectStack(cluster);
    const preview = await stack.preview({ onOutput: onOutput(cluster.name) });
    say(cluster.name, `preview: ${JSON.stringify(preview.changeSummary)}`);
    if (previewOnly) {
        return;
    }
    const up = await stack.up({ onOutput: onOutput(cluster.name) });
    say(cluster.name, `up: ${up.summary.result}`);
    printOutputs(cluster.name, await stack.outputs());
}

async function wave(number: number) {
    const members = clusters.filter(c => c.wave === number);
    if (members.length === 0) {
        throw new Error(`no clusters in wave ${number}`);
    }
    // One cluster runs alone; several run in parallel.
    await Promise.all(members.map(deploy));
}

async function reconcile(version: string) {
    await Promise.all(clusters.map(async cluster => {
        const stack = await selectStack(cluster);
        const refresh = await stack.refresh({ onOutput: onOutput(cluster.name) });
        say(cluster.name, `refresh: ${refresh.summary.result}`);
        if (offline) {
            await stack.setConfig("fleet-cluster:kubernetesVersion", { value: version });
        } else {
            // The version lives in the ESC environment, so the change is made there.
            await exec("pulumi", ["env", "set", `${org}/fleet/${cluster.name}`,
                'pulumiConfig["fleet-cluster:kubernetesVersion"]', version, "--string"]);
        }
        const preview = await stack.preview({ onOutput: onOutput(cluster.name) });
        const summary = preview.changeSummary;
        const changed = Object.entries(summary).filter(([kind, n]) => kind !== "same" && n > 0);
        say(cluster.name, changed.length === 0 ? "no diff" : `DIFF: ${JSON.stringify(summary)}`);
    }));
}

async function destroyAll() {
    // Members first, then the canary, so the canary is the last cluster standing.
    for (const members of [clusters.filter(c => c.wave === 2), clusters.filter(c => c.wave === 1)]) {
        await Promise.all(members.map(async cluster => {
            const stack = await selectStack(cluster);
            if (previewOnly) {
                const preview = await stack.preview({ onOutput: onOutput(cluster.name) });
                say(cluster.name, `preview: ${JSON.stringify(preview.changeSummary)}`);
                return;
            }
            const result = await stack.destroy({ onOutput: onOutput(cluster.name) });
            say(cluster.name, `destroy: ${result.summary.result}`);
        }));
    }
}

async function main() {
    const [command, rest] = args;
    switch (command) {
        case "wave": return wave(Number(rest));
        case "reconcile": return reconcile(option("version") ?? "1.36");
        case "destroy": return destroyAll();
        default:
            throw new Error("usage: rollout.js wave <1|2> | reconcile [--version 1.36] | destroy  [--preview-only] [--offline]");
    }
}

main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exit(1); });
