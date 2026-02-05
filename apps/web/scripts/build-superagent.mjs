import path from "path";
import { fileURLToPath } from "url";
import { build } from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const entry = path.join(__dirname, "../../../src/superagent/index.ts");
const outFile = path.join(__dirname, "../server/superagent-dist/index.mjs");

await build({
  entryPoints: [entry],
  outfile: outFile,
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node20",
  sourcemap: false,
  logLevel: "info",
});

