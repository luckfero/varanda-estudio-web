#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${SITES_ENV_READY:-}" != "1" ]]; then
  exec "${script_dir}/sites-env.sh" -- "$0" "$@"
fi

worker="${SITES_PROJECT_ROOT}/dist/server/index.js"
wrangler_config="${SITES_PROJECT_ROOT}/dist/server/wrangler.json"
client_assets="${SITES_PROJECT_ROOT}/dist/client"

[[ -f "${worker}" ]] || {
  echo "Missing Cloudflare Worker entry: dist/server/index.js" >&2
  exit 66
}
[[ -f "${wrangler_config}" ]] || {
  echo "Missing generated Wrangler config: dist/server/wrangler.json" >&2
  exit 66
}
[[ -d "${client_assets}" ]] || {
  echo "Missing generated client assets directory: dist/client" >&2
  exit 66
}

node --input-type=module - "${worker}" "${wrangler_config}" "${client_assets}" <<'NODE'
import { readFile, readdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const [workerPath, wranglerPath, clientAssetsPath] = process.argv.slice(2);
const wrangler = JSON.parse(await readFile(wranglerPath, "utf8"));

if (wrangler.name !== "varanda-estudio-web") {
  throw new Error("Generated Worker name must be varanda-estudio-web");
}

const flags = wrangler.compatibility_flags ?? [];
const duplicateFlags = flags.filter((flag, index) => flags.indexOf(flag) !== index);
if (duplicateFlags.length > 0) {
  throw new Error(`Generated Wrangler config contains duplicated compatibility flags: ${[...new Set(duplicateFlags)].join(", ")}`);
}

if (!wrangler.assets || typeof wrangler.assets.directory !== "string") {
  throw new Error("Generated Wrangler config must contain an assets.directory entry");
}

const clientFiles = await readdir(clientAssetsPath, { recursive: true });
if (clientFiles.length === 0) {
  throw new Error("Generated client assets directory is empty");
}

const workerUrl = pathToFileURL(workerPath);
workerUrl.searchParams.set("sites-validation", `${process.pid}-${Date.now()}`);
const worker = await import(workerUrl.href);
if (!worker.default || typeof worker.default.fetch !== "function") {
  throw new Error("dist/server/index.js must have an ESM default export with fetch(request, env, ctx)");
}
NODE

echo "Validated Cloudflare artifact: Worker, unique compatibility flags, assets config, client files and ESM default.fetch are present."
