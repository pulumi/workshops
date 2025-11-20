const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");
const { execSync } = require('node:child_process');
// We want to run "tsc --types node --types something-else ..." for each @types package.
const packageJSON = JSON.parse(fs.readFileSync("package.json") ?? "{}");
const deps = Object.keys(packageJSON.dependencies ?? []).concat(Object.keys(packageJSON.devDependencies ?? []));
const types = deps.filter(d => d.startsWith("@types/")).map(d => d.slice("@types/".length)).join(",");
const typesFlag = types.length > 0 ? " --types " + types : "";
try {
  execSync("tsc"+typesFlag, { cwd: path.join(__dirname, "..") });
} catch (error) {
  console.error("Failed to run 'tsc'", {
    stdout: error.stdout.toString(),
    stderr: error.stderr.toString(),
  });
  process.exit(1);
}
// TypeScript is compiled to "./bin", copy package.json to that directory so it can be read in "getVersion".
fs.copyFileSync(path.join(__dirname, "..", "package.json"), path.join(__dirname, "..", "bin", "package.json"));
