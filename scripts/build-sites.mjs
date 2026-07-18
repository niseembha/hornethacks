import { copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = process.cwd();
const bundleDirectory = mkdtempSync(join(tmpdir(), "hornet-hacks-sites-"));
const executableSuffix = process.platform === "win32" ? ".cmd" : "";

function localExecutable(name) {
  return resolve(
    projectRoot,
    "node_modules",
    ".bin",
    `${name}${executableSuffix}`,
  );
}

function run(command, args, environment = process.env) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    env: environment,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status}`);
  }
}

try {
  run(localExecutable("opennextjs-cloudflare"), ["build"]);
  run(
    localExecutable("wrangler"),
    ["deploy", "--dry-run", "--outdir", bundleDirectory],
    {
      ...process.env,
      WRANGLER_LOG_PATH: join(bundleDirectory, "wrangler.log"),
    },
  );

  copyFileSync(
    join(bundleDirectory, "worker.js"),
    resolve(projectRoot, ".open-next", "worker.js"),
  );

  console.log(
    "Sites-ready worker saved to .open-next/worker.js after Wrangler bundling.",
  );
} finally {
  rmSync(bundleDirectory, { force: true, recursive: true });
}
