/**
 * Auto-extract ALL tables from the PFE Power BI report into CSV.
 *
 * Uses pbi-tools (https://pbi.tools) to open the .pbix offline and export every
 * table to back-end/data/powerbi/. Requires Power BI Desktop (64-bit) installed,
 * which is already the case on the development machine.
 *
 *   pbi-tools export-data -pbixPath <pfe.pbix> -outPath <data/powerbi>
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PBI_TOOLS_VERSION = "1.2.0";
const PBI_TOOLS_DIR = process.env.PBI_TOOLS_DIR || path.resolve(__dirname, "../../tools/pbi-tools");
const PBI_TOOLS_EXE = path.join(PBI_TOOLS_DIR, "pbi-tools.exe");
const PBI_TOOLS_ZIP = path.join(PBI_TOOLS_DIR, "pbi-tools.zip");

const PBIX_PATH = process.env.PBIX_PATH || path.resolve(__dirname, "../../../pfe.pbix");
const OUT_DIR = process.env.POWERBI_DATA_DIR || path.resolve(__dirname, "../../data/powerbi");

function pbiToolsInstalled() {
  return fs.existsSync(PBI_TOOLS_EXE);
}

function downloadPbiTools() {
  if (pbiToolsInstalled()) return;
  console.log("[pbi] downloading pbi-tools...");
  fs.mkdirSync(PBI_TOOLS_DIR, { recursive: true });

  const url = `https://github.com/pbi-tools/pbi-tools/releases/download/${PBI_TOOLS_VERSION}/pbi-tools.${PBI_TOOLS_VERSION}.zip`;
  const curl = spawnSync(
    "curl",
    ["-L", "-o", PBI_TOOLS_ZIP, "--fail", "--silent", "--show-error", url],
    { stdio: "inherit", timeout: 180000 }
  );
  if (curl.status !== 0) {
    console.error(`[pbi] failed to download pbi-tools from ${url}`);
    process.exit(1);
  }

  // Unzip (PowerShell Expand-Archive is available on all Windows systems).
  const ps = spawnSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      `Expand-Archive -LiteralPath '${PBI_TOOLS_ZIP}' -DestinationPath '${PBI_TOOLS_DIR}' -Force`,
    ],
    { stdio: "inherit", timeout: 120000 }
  );
  if (ps.status !== 0) {
    console.error("[pbi] failed to unzip pbi-tools");
    process.exit(1);
  }

  if (!pbiToolsInstalled()) {
    console.error(`[pbi] pbi-tools.exe not found after download. Looked in ${PBI_TOOLS_DIR}`);
    process.exit(1);
  }
  console.log("[pbi] pbi-tools ready.");
}

function exportAllTables() {
  if (!fs.existsSync(PBIX_PATH)) {
    console.error(`[pbi] PBIX not found at ${PBIX_PATH}. Set PBIX_PATH to point to your .pbix file.`);
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  // Clear stale exports so removed tables don't linger.
  for (const f of fs.readdirSync(OUT_DIR)) {
    if (f.toLowerCase().endsWith(".csv")) fs.rmSync(path.join(OUT_DIR, f), { force: true });
  }

  console.log(`[pbi] exporting all tables from ${path.basename(PBIX_PATH)}...`);
  const res = spawnSync(
    PBI_TOOLS_EXE,
    ["export-data", "-pbixPath", PBIX_PATH, "-outPath", OUT_DIR],
    { stdio: "inherit", timeout: 300000 }
  );
  if (res.status !== 0) {
    console.error("[pbi] pbi-tools export-data failed.");
    process.exit(1);
  }

  const csvs = fs.readdirSync(OUT_DIR).filter((f) => f.toLowerCase().endsWith(".csv"));
  console.log(`[pbi] exported ${csvs.length} table(s): ${csvs.join(", ")}`);
}

downloadPbiTools();
exportAllTables();
console.log("[pbi] extract complete.");
