import { readFileSync, existsSync } from "fs";
import { pingAllProviders, summarizePingResults } from "../lib/ai/providerPing";

function loadEnvLocal() {
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnvLocal();

async function main() {
  console.log("\n=== PING IA · RDPR (6 proveedores) ===\n");
  const started = Date.now();
  const providers = await pingAllProviders();
  const summary = summarizePingResults(providers);

  for (const p of providers) {
    const icon = p.status === "ok" ? "OK" : p.status === "missing" ? "—" : "FAIL";
    const lat = p.latencyMs != null ? `${p.latencyMs}ms` : "";
    console.log(`${icon.padEnd(5)} ${p.label.padEnd(10)} ${p.model ?? ""} ${lat}`);
    if (p.error) console.log(`      ${p.error}`);
    else if (p.sample) console.log(`      → ${p.sample}`);
  }

  console.log(
    `\nResumen: ${summary.ok}/${summary.total} OK · ${summary.errors} error · ${summary.missing} sin key · ${Date.now() - started}ms`
  );
  process.exit(summary.errors > 0 || summary.missing > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
