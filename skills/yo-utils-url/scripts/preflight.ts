import { execSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const CDP_PORT = 9222;
const CDP_URL = `http://localhost:${CDP_PORT}/json/version`;
const CHROME_PROFILE_DIR = join(
  process.env.XDG_CONFIG_HOME || join(homedir(), ".config"),
  "yolanda-skills",
  "chrome-profile",
);

interface PidRecord {
  pid: number;
  "user-data-dir": string;
}

function parseArgs(args: string[]): Record<string, string> {
  const parsed: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--") && i + 1 < args.length) {
      parsed[args[i].slice(2)] = args[i + 1];
      i++;
    }
  }
  return parsed;
}

function outputJson(data: Record<string, unknown>) {
  console.log(JSON.stringify(data));
}

function expandHome(p: string): string {
  if (!p) return p;
  if (p.startsWith("~")) return p.replace("~", homedir());
  return p;
}

function parseTmpDir(configPath: string): string {
  if (!configPath || !existsSync(configPath)) return ".tmp";
  const text = readFileSync(configPath, "utf-8");
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return ".tmp";
  for (const line of match[1].split("\n")) {
    const m = line.match(/^tmp_dir:\s*(.*)/);
    if (m) return m[1].trim().replace(/^["']|["']$/g, "") || ".tmp";
  }
  return ".tmp";
}

function checkDaemonStatus(): boolean {
  try {
    const output = execSync("opencli daemon status 2>&1", {
      encoding: "utf-8",
      timeout: 10000,
    });
    return !(/extension.*disconnect/i.test(output) || /extension.*not\s*connect/i.test(output));
  } catch {
    return false;
  }
}

function isCdpReady(): boolean {
  try {
    execSync(`curl -sf ${CDP_URL} -o /dev/null`, { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

function findChrome(): string | null {
  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  try {
    return execSync("which google-chrome-stable 2>/dev/null || which chromium-browser 2>/dev/null || which chromium 2>/dev/null", {
      encoding: "utf-8",
    }).trim() || null;
  } catch {
    return null;
  }
}

function pidPath(tmpDir: string): string {
  return join(tmpDir, "chrome.pid");
}

function writePidRecord(tmpDir: string, record: PidRecord) {
  mkdirSync(tmpDir, { recursive: true });
  writeFileSync(pidPath(tmpDir), JSON.stringify(record), "utf-8");
}

function launchChrome(tmpDir: string): boolean {
  const chromePath = findChrome();
  if (!chromePath) return false;

  mkdirSync(CHROME_PROFILE_DIR, { recursive: true });

  const args = [
    `--remote-debugging-port=${CDP_PORT}`,
    "--remote-allow-origins=*",
    "--no-first-run",
    `--user-data-dir=${CHROME_PROFILE_DIR}`,
  ];

  try {
    const child = spawn(chromePath, args, {
      detached: true,
      stdio: "ignore",
    });
    writePidRecord(tmpDir, {
      pid: child.pid!,
      "user-data-dir": CHROME_PROFILE_DIR,
    });
    child.unref();
  } catch {
    return false;
  }

  return true;
}

async function waitForCdp(maxMs: number): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    if (isCdpReady()) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

const EXTENSION_INSTALL_HINT =
  "Browser Bridge extension not connected after launching Chrome. Install it:\n" +
  "1. Download from https://github.com/jackwener/opencli/releases\n" +
  "2. Open chrome://extensions/ → Enable Developer Mode\n" +
  "3. Click 'Load unpacked' → select the extension folder";

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  const needBrowser = parsed["need-browser"] !== "false";

  if (!needBrowser) {
    outputJson({ status: "ok", browser_needed: false });
    return;
  }

  try {
    execSync("which opencli", { stdio: "pipe" });
  } catch {
    outputJson({ status: "error", step: "opencli", message: "opencli not found in PATH. Install: npm install -g opencli" });
    process.exit(1);
  }

  if (checkDaemonStatus()) {
    outputJson({ status: "ok", browser_needed: true });
    return;
  }

  if (isCdpReady()) {
    outputJson({ status: "ok", browser_needed: true });
    return;
  }

  const configPath = parsed.config || "";
  const tmpDir = expandHome(parsed.tmp || parseTmpDir(configPath) || ".tmp");

  const launched = launchChrome(tmpDir);
  if (!launched) {
    outputJson({ status: "error", step: "launch", message: "Failed to launch Chrome. Ensure Chrome or Chromium is installed." });
    process.exit(1);
  }

  const cdpReady = await waitForCdp(10000);
  if (!cdpReady) {
    outputJson({ status: "error", step: "launch", message: "Chrome launched but CDP port not ready within 10s." });
    process.exit(1);
  }

  if (checkDaemonStatus()) {
    outputJson({ status: "ok", browser_needed: true });
    return;
  }

  outputJson({ status: "error", step: "extension", message: EXTENSION_INSTALL_HINT });
  process.exit(1);
}

main();
