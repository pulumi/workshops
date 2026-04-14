import { spawn, spawnSync } from "node:child_process";

const root = process.cwd();

const PORTS = [7001, 7070];
const existing = spawnSync("lsof", ["-ti", PORTS.map((p) => `:${p}`).join(",")], { encoding: "utf8" });
const pids = (existing.stdout ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
if (pids.length) {
  console.log(`Freeing ports ${PORTS.join(", ")} by killing: ${pids.join(" ")}`);
  spawnSync("kill", pids);
  spawnSync("sleep", ["0.5"]);
}

function launch(name, command, args, env = {}) {
  const child = spawn(command, args, {
    cwd: root,
    env: {
      ...process.env,
      ...env,
    },
    stdio: "inherit",
  });

  child.on("exit", (code) => {
    console.log(`[${name}] exited with code ${code ?? 0}`);
  });

  return child;
}

const backend = launch("backend", "node", ["./dist/services/backend/src/local-server.js"]);
const bff = launch("bff", "node", ["./dist/services/bff/src/local-server.js"]);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    backend.kill(signal);
    bff.kill(signal);
    process.exit(0);
  });
}

console.log("Local stack running:");
console.log("  frontend + bff -> http://127.0.0.1:7070");
console.log("  backend       -> http://127.0.0.1:7001");
console.log("  bff logs      -> http://127.0.0.1:7070/api/logs");
console.log("  backend logs  -> http://127.0.0.1:7001/internal/logs");

