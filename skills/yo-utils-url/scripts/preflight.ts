import { execSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const CDP_PORT = 9222;

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

function parseFrontmatterField(configPath: string, field: string): string | null {
  if (!configPath || !existsSync(configPath)) return null;
  const text = readFileSync(configPath, "utf-8");
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  for (const line of match[1].split("\n")) {
    const m = line.match(new RegExp(`^${field}:\\s*(.*)`));
    if (m) return m[1].trim().replace(/^["']|["']$/g, "") || null;
  }
  return null;
}

function parseTmpDir(configPath: string): string {
  return parseFrontmatterField(configPath, "tmp_dir") || ".tmp";
}

function parseChromeProfile(configPath: string): string | null {
  return parseFrontmatterField(configPath, "chrome_profile");
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

function findChrome(): string | null {
  const candidates: Record<string, string[]> = {
    darwin: [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ],
    win32: [
      join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe"),
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    ],
    linux: [
      "/usr/bin/google-chrome-stable",
      "/usr/bin/chromium-browser",
      "/usr/bin/chromium",
    ],
  };
  for (const p of candidates[process.platform] || []) {
    if (existsSync(p)) return p;
  }
  const fallback =
    process.platform === "win32"
      ? "where chrome"
      : "which google-chrome-stable 2>/dev/null || which chromium-browser 2>/dev/null || which chromium 2>/dev/null";
  try {
    return execSync(fallback, { encoding: "utf-8" }).trim() || null;
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

function cleanStaleLocks(profileDir: string) {
  for (const f of ["SingletonLock", "SingletonSocket", "SingletonCookie"]) {
    try {
      unlinkSync(join(profileDir, f));
    } catch {}
  }
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function launchChrome(tmpDir: string, profileDir: string): Promise<boolean> {
  const chromePath = findChrome();
  if (!chromePath) return false;

  mkdirSync(profileDir, { recursive: true });
  cleanStaleLocks(profileDir);

  const args = [
    `--remote-debugging-port=${CDP_PORT}`,
    "--remote-allow-origins=*",
    "--no-first-run",
    `--user-data-dir=${profileDir}`,
  ];

  let childPid: number;
  try {
    const child = spawn(chromePath, args, {
      detached: true,
      stdio: "ignore",
    });
    childPid = child.pid!;
    writePidRecord(tmpDir, {
      pid: childPid,
      "user-data-dir": profileDir,
    });
    child.unref();
  } catch {
    return false;
  }

  await new Promise((r) => setTimeout(r, 1500));
  return isProcessAlive(childPid);
}

async function waitForDaemon(maxMs: number): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    if (checkDaemonStatus()) return true;
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

  const configPath = parsed.config || "";
  const chromeProfile = parseChromeProfile(configPath);

  if (!chromeProfile) {
    outputJson({
      status: "error",
      step: "default-profile",
      message: "Browser Bridge extension not connected and no isolated Chrome profile configured. Start your Chrome with the Bridge extension installed, or run first-time setup to configure an isolated profile.",
    });
    process.exit(1);
  }

  const profileDir = expandHome(chromeProfile);
  const tmpDir = expandHome(parsed.tmp || parseTmpDir(configPath) || ".tmp");

  const launched = await launchChrome(tmpDir, profileDir);
  if (!launched) {
    outputJson({ status: "error", step: "launch", message: "Failed to launch Chrome. Ensure Chrome or Chromium is installed." });
    process.exit(1);
  }

  const daemonReady = await waitForDaemon(10000);
  if (!daemonReady) {
    outputJson({ status: "error", step: "extension", message: EXTENSION_INSTALL_HINT });
    process.exit(1);
  }

  outputJson({ status: "ok", browser_needed: true });
}

main();
