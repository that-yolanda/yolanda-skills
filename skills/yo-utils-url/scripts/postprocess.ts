import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { execSync } from "node:child_process";
import { basename, join, relative, extname } from "node:path";

interface ExtendConfig {
  tmp_dir: string;
  markdown: { dir: string; link: "short" | "long" };
  assets: { download: string[]; dir: string };
}

interface Summary {
  files: number;
  images: number;
  videos: number;
  total_size: string;
  output: string;
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

function parseExtendMd(path: string): ExtendConfig {
  const defaults: ExtendConfig = {
    tmp_dir: ".tmp",
    markdown: { dir: "文章/{platform}", link: "short" },
    assets: { download: ["image", "video"], dir: "附件/{type}/{article_name}" },
  };
  if (!path || !existsSync(path)) return defaults;
  const text = readFileSync(path, "utf-8");
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return defaults;
  const lines = match[1].split("\n");
  const config: Record<string, unknown> = {};
  let currentSection: Record<string, unknown> | null = null;
  let lastNestedKey: string | null = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;
    if (line.startsWith("    ") && trimmed.startsWith("- ")) {
      if (currentSection && lastNestedKey) {
        const val = parseValue(trimmed.slice(2));
        const arr = currentSection[lastNestedKey];
        if (Array.isArray(arr)) (arr as unknown[]).push(val);
        else currentSection[lastNestedKey] = [val];
      }
      continue;
    }
    const nested = line.match(/^  (\w[\w_]*):\s*(.*)/);
    if (nested && currentSection !== null) {
      lastNestedKey = nested[1];
      const val = nested[2].trim();
      if (val === "") {
        currentSection[lastNestedKey] = [];
      } else {
        currentSection[lastNestedKey] = parseValue(val);
      }
      continue;
    }
    const top = line.match(/^(\w[\w_]*):\s*(.*)/);
    if (top) {
      lastNestedKey = null;
      const val = top[2].trim();
      if (val === "") {
        currentSection = {};
        config[top[1]] = currentSection;
      } else {
        config[top[1]] = parseValue(val);
        currentSection = null;
      }
      continue;
    }
  }
  return {
    tmp_dir: (config.tmp_dir as string) || defaults.tmp_dir,
    markdown: Object.assign({}, defaults.markdown, (config.markdown as Record<string, unknown>) || {}),
    assets: Object.assign({}, defaults.assets, (config.assets as Record<string, unknown>) || {}),
  } as ExtendConfig;
}

function parseValue(val: string): unknown {
  val = val.trim().replace(/^["']|["']$/g, "");
  if (val === "true") return true;
  if (val === "false") return false;
  if (val === "[]") return [];
  if (/^\d+$/.test(val)) return parseInt(val, 10);
  return val;
}

function expandHome(p: string): string {
  if (p.startsWith("~")) return p.replace("~", process.env.HOME || "/tmp");
  return p;
}

function truncate(s: string, max: number): string {
  s = s.replace(/[\/\\:*?"<>|]/g, "_").trim();
  return s.length > max ? s.slice(0, max) : s;
}

function cleanMarkdown(content: string): string {
  return content
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<(\w+)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g, "$2")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function findFiles(dir: string, exts: string[]): string[] {
  if (!existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(full, exts));
    } else if (entry.isFile() && exts.includes(extname(entry.name).toLowerCase())) {
      results.push(full);
    }
  }
  return results;
}

function dirSize(dir: string): number {
  if (!existsSync(dir)) return 0;
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) total += dirSize(full);
    else total += statSync(full).size;
  }
  return total;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function replaceAssetRefs(
  markdown: string,
  mapping: Map<string, string>,
  mode: "short" | "long",
  mdDir: string,
): string {
  for (const [original, renamed] of mapping) {
    const renamedBasename = basename(renamed);
    const origEsc = escapeRegex(basename(original));
    if (mode === "short") {
      markdown = markdown.replace(
        new RegExp(`!\\[[^\\]]*\\]\\([^)]*${origEsc}[^)]*\\)`, "g"),
        `![[${renamedBasename}]]`,
      );
      markdown = markdown.replace(
        new RegExp(`!?\\[\\[^\\]]*${origEsc}[^\\]]*\\]\\]`, "g"),
        `![[${renamedBasename}]]`,
      );
    } else {
      const relPath = relative(mdDir, renamed);
      markdown = markdown.replace(
        new RegExp(`!?\\[\\[^\\]]*${origEsc}[^\\]]*\\]\\]`, "g"),
        `![](${relPath})`,
      );
      markdown = markdown.replace(
        new RegExp(`!\\[[^\\]]*\\]\\([^)]*${origEsc}[^)]*\\)`, "g"),
        `![](${relPath})`,
      );
    }
  }
  return markdown;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findMarkdownFiles(dir: string): string[] {
  return findFiles(dir, [".md", ".markdown"]);
}

const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif"];
const VIDEO_EXTS = [".mp4", ".webm", ".mov", ".mkv", ".avi"];
const TYPE_EXTS: Record<string, string[]> = {
  image: IMAGE_EXTS,
  video: VIDEO_EXTS,
};

interface PidRecord {
  pid: number;
  "user-data-dir": string;
}

function cleanupChrome(tmpDir: string) {
  const pidFile = join(tmpDir, "chrome.pid");
  if (!existsSync(pidFile)) return;
  let record: PidRecord;
  try {
    record = JSON.parse(readFileSync(pidFile, "utf-8"));
  } catch {
    return;
  }
  const userDataDir = (record["user-data-dir"] || "").trim();
  if (!userDataDir) return;
  try {
    const ps = execSync("ps -eo pid,args", { encoding: "utf-8" });
    for (const line of ps.split("\n")) {
      const match = line.match(/^\s*(\d+)\s+(.*)/);
      if (!match) continue;
      const pid = parseInt(match[1], 10);
      const cmdLine = match[2];
      if (cmdLine.includes(userDataDir)) {
        try { process.kill(pid, "SIGTERM"); } catch {}
      }
    }
  } catch {}
  try { rmSync(pidFile, { force: true }); } catch {}
}

function main() {
  const parsed = parseArgs(process.argv.slice(2));
  const tmp = expandHome(parsed.tmp || ".tmp");
  const title = parsed.title || "untitled";
  const configPath = parsed.config || "";
  const platform = parsed.platform || "web";

  const config = parseExtendMd(configPath);
  const articleName = truncate(title, 32);

  const mdDir = expandHome(config.markdown.dir
    .replace("{platform}", platform)
    .replace("{article_name}", articleName));
  mkdirSync(mdDir, { recursive: true });

  const mdFiles = findMarkdownFiles(tmp);
  if (mdFiles.length === 0) {
    console.log(JSON.stringify({ files: 0, images: 0, videos: 0, total_size: "0 B", output: "" }));
    return;
  }

  const assetMapping = new Map<string, string>();
  const assetTypeDirs = new Map<string, string>();
  let imageCount = 0;
  let videoCount = 0;

  for (const type of config.assets.download) {
    const exts = TYPE_EXTS[type];
    if (!exts) continue;
    const typeDir = expandHome(config.assets.dir
      .replace("{type}", type)
      .replace("{article_name}", articleName));
    mkdirSync(typeDir, { recursive: true });
    assetTypeDirs.set(type, typeDir);

    const files = findFiles(tmp, exts);
    for (const file of files) {
      const origName = basename(file);
      const newName = `${articleName}-${origName}`;
      const dest = join(typeDir, newName);
      renameSync(file, dest);
      assetMapping.set(file, dest);
      if (type === "image") imageCount++;
      if (type === "video") videoCount++;
    }
  }

  for (const mdFile of mdFiles) {
    let content = readFileSync(mdFile, "utf-8");
    content = cleanMarkdown(content);
    content = replaceAssetRefs(content, assetMapping, config.markdown.link, mdDir);
    const destPath = join(mdDir, `${articleName}.md`);
    writeFileSync(destPath, content, "utf-8");
  }

  try { cleanupChrome(tmp); } catch {}
  try { rmSync(tmp, { recursive: true, force: true }); } catch {}

  let totalSize = dirSize(mdDir);
  for (const typeDir of assetTypeDirs.values()) {
    totalSize += dirSize(typeDir);
  }
  const summary: Summary = {
    files: mdFiles.length,
    images: imageCount,
    videos: videoCount,
    total_size: formatSize(totalSize),
    output: mdDir,
  };
  console.log(JSON.stringify(summary));
}

main();
