import { cp, mkdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

const root = process.cwd();

await rm(path.join(root, "dist"), { recursive: true, force: true });

await new Promise((resolve, reject) => {
  const child = spawn("tsc", ["-p", "tsconfig.json"], {
    cwd: root,
    stdio: "inherit",
  });

  child.on("exit", (code) => {
    if (code === 0) {
      resolve();
      return;
    }

    reject(new Error(`tsc exited with code ${code}`));
  });
});

await mkdir(path.join(root, "dist", "frontend"), { recursive: true });
await cp(path.join(root, "frontend", "index.html"), path.join(root, "dist", "frontend", "index.html"));
await cp(path.join(root, "frontend", "styles.css"), path.join(root, "dist", "frontend", "styles.css"));
await cp(path.join(root, "frontend", "config.js"), path.join(root, "dist", "frontend", "config.js"));
await cp(path.join(root, "dist", "frontend", "src", "app.js"), path.join(root, "dist", "frontend", "app.js"));
