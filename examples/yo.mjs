#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const VALID_TYPES = new Set(["principle", "method", "case", "anti-pattern", "tool", "insight"]);
const VALID_CONFIDENCE = new Set(["high", "medium", "low"]);
const VALID_STATUS = new Set(["null", "pending", "achieved", "discorded"]);

const args = process.argv.slice(2);
const wantsJson = args.includes("--json");
const cleanArgs = [];
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--json") continue;
  cleanArgs.push(args[i]);
}

function respond(ok, data = null, error = null) {
  if (wantsJson) {
    console.log(JSON.stringify({ ok, data, error }, null, 2));
    return;
  }

  if (!ok) {
    console.error(`${error.code}: ${error.message}`);
    if (error.suggestion) console.error(error.suggestion);
    return;
  }

  if (Array.isArray(data)) {
    for (const atom of data) {
      console.log(`${atom.id} ${atom.type} ${atom.confidence} ${atom.status ?? "-"}`);
      console.log(atom.knowledge);
      console.log("---");
    }
    return;
  }

  if (data?.id) {
    console.log(data.message ?? `ok: ${data.id}`);
    return;
  }

  console.log("ok");
}

function fail(code, message, suggestion) {
  respond(false, null, { code, message, suggestion });
  process.exit(1);
}

function showHelp() {
  const text = `wiki — 本地知识库管理
技术栈: bash + rg + jq

用法:
  yo wiki search [options] <keywords...>
  yo wiki add <json_record>

子命令:
  search    搜索知识库
  add       添加记录
  update    更新记录状态

示例:
  yo wiki search -l 10 --type principle "商业模式"
  yo wiki add '{"knowledge":"...","type":"principle","confidence":"high"}'
  yo wiki update 2026-06-001 -s achieved

配置:
  必须设置环境变量 WIKI_DIR（知识库根目录）
  数据文件路径: $WIKI_DIR/原子库/atoms.jsonl`;

  if (wantsJson) respond(true, { help: text });
  else console.log(text);
}

function showSearchHelp() {
  const text = `wiki search — 搜索知识库

用法:
  yo wiki search [options] <keywords...>

参数:
  keywords          搜索关键词，逗号分隔为 OR，多个位置参数为 AND（可选，可置于选项前后）

选项:
  -l, --limit N     返回数量（默认: 20）
  -b, --begin DATE  起始日期（YYYY-MM-DD）
  -e, --end DATE    结束日期（YYYY-MM-DD）
  -t, --type TYPE   类型过滤，可多次指定（OR 语义）
                    principle（原则）- 可复用的原则、规律（解释 WHY）
                    method（方法）- 可执行的方法（解释 HOW）
                    case（案例）- 真实案例（解释 WHAT HAPPENED）
                    anti-pattern（反模式）- 错误模式（论证 WHAT FAILS）
                    tool（工具）- 可复用资产（解释 WHAT TO USE）
                    insight（洞察）- 洞察、观点（解释 WHAT MIGHT BE TRUE）
  -s, --status STATUS   状态过滤，逗号分隔（OR）: null/pending/achieved/discorded
  -a, --author NAME 作者过滤，逗号分隔（OR，模糊匹配）
  -c, --confidence  置信度过滤，逗号分隔（OR）: high/medium/low
  -T, --tags TAG    标签过滤，可多次指定（OR 语义）
  -f, --format FMT  输出格式（默认: text）
                    可选: text / json / table / csv

示例:
  yo wiki search "商业模式" "定价"
  yo wiki search "商业模式,定价"                # 关键词 OR
  yo wiki search -s null,pending "案例"         # status 为 null 或 pending
  yo wiki search -c high,medium -a "张三,李四"   # 多值 OR 组合
  yo wiki search -l 5 -t principle -T "语言与思维" "逻辑"`;

  if (wantsJson) respond(true, { help: text });
  else console.log(text);
}

function showAddHelp() {
  const text = `wiki add — 添加知识记录

用法:
  yo wiki add '<json_record>'

  也可以从 stdin 读入（管道或重定向）

必填字段:
  knowledge    知识点陈述
  type         类型，可选值及含义:
               principle（原则）- 可复用的原则、规律（解释 WHY）
               method（方法）- 可执行的方法（解释 HOW）
               case（案例）- 真实案例（解释 WHAT HAPPENED）
               anti-pattern（反模式）- 错误模式（论证 WHAT FAILS）
               tool（工具）- 可复用资产（解释 WHAT TO USE）
               insight（洞察）- 洞察、观点（解释 WHAT MIGHT BE TRUE）
  confidence   置信度: high/medium/low

可选字段:
  status       状态: null/pending/achieved/discorded（默认 null）
  author       作者
  original     原文（最多 200 字）
  url          外部链接
  date         发布日期（YYYY-MM-DD，默认今天）
  tags         主题标签（字符串数组，默认 []）

自动生成:
  id           格式 YYYY-MM-NNN，同月自增，新月从 001 起

示例:
  yo wiki add '{"knowledge":"...","type":"principle","confidence":"high","tags":["标签1"]}'
  echo '{"knowledge":"...","type":"case","confidence":"medium"}' | yo wiki add`;

  if (wantsJson) respond(true, { help: text });
  else console.log(text);
}

function showUpdateHelp() {
  const text = `wiki update — 更新知识记录

用法:
  yo wiki update <id> [options]

参数:
  id                记录 ID（格式: YYYY-MM-NNN）

选项（至少指定一个）:
  -s, --status STATUS       新状态: null / pending / achieved / discorded
  -t, --type TYPE           新类型: principle / method / case / anti-pattern / tool / insight
  -c, --confidence LEVEL    新置信度: high / medium / low
  -T, --tags TAGS           新标签（覆盖，逗号分隔）: "标签1,标签2"

示例:
  yo wiki update 2026-06-001 -s achieved
  yo wiki update 2026-06-003 -s pending -c high
  yo wiki update 2026-06-005 -t method -T "定价,商业模式"`;

  if (wantsJson) respond(true, { help: text });
  else console.log(text);
}

function showCommandHelp(command) {
  if (command === "search") showSearchHelp();
  else if (command === "add") showAddHelp();
  else if (command === "update") showUpdateHelp();
  else showHelp();
}

function optionValue(argv, names) {
  for (const name of names) {
    const index = argv.indexOf(name);
    if (index >= 0) return argv[index + 1];
  }
  return undefined;
}

function optionValues(argv, names) {
  const values = [];
  for (let i = 0; i < argv.length; i += 1) {
    if (names.includes(argv[i]) && argv[i + 1]) values.push(argv[i + 1]);
  }
  return values;
}

function positionalArgs(argv) {
  const result = [];
  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    if (current.startsWith("-")) {
      i += 1;
    } else {
      result.push(current);
    }
  }
  return result;
}

function wikiDataFile() {
  const wikiDir = process.env.WIKI_DIR;
  if (!wikiDir) {
    fail(
      "WIKI_DIR_NOT_SET",
      "WIKI_DIR is not configured.",
      "Set WIKI_DIR to your vault root before running yo wiki."
    );
  }
  return path.join(wikiDir, "原子库", "atoms.jsonl");
}

function readAtoms(file) {
  if (!fs.existsSync(file)) return [];
  const content = fs.readFileSync(file, "utf8").trim();
  if (!content) return [];
  return content.split("\n").map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      fail("INVALID_JSONL", `Invalid JSON on line ${index + 1}.`, error.message);
    }
  });
}

function writeAtoms(file, atoms) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${atoms.map((atom) => JSON.stringify(atom)).join("\n")}\n`);
}

async function withLock(file, task) {
  const lockDir = `${file}.lock`;
  const started = Date.now();

  while (true) {
    try {
      fs.mkdirSync(lockDir);
      break;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      if (Date.now() - started > 5000) {
        fail("LOCK_TIMEOUT", "Could not acquire atoms.jsonl lock.", "Retry after other yo wiki writes finish.");
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  try {
    return await task();
  } finally {
    fs.rmSync(lockDir, { recursive: true, force: true });
  }
}

function nextId(atoms) {
  const ym = new Date().toISOString().slice(0, 7);
  const maxSeq = atoms
    .map((atom) => atom.id)
    .filter((id) => typeof id === "string" && id.startsWith(`${ym}-`))
    .map((id) => Number(id.split("-").at(-1)))
    .filter(Number.isFinite)
    .reduce((max, seq) => Math.max(max, seq), 0);

  return `${ym}-${String(maxSeq + 1).padStart(3, "0")}`;
}

function normalizeRecord(record, id) {
  const missing = ["knowledge", "type", "confidence"].filter((field) => !record[field]);
  if (missing.length > 0) {
    fail("MISSING_FIELDS", `Missing required fields: ${missing.join(", ")}.`, "Provide knowledge, type, and confidence.");
  }
  if (!VALID_TYPES.has(record.type)) {
    fail("INVALID_TYPE", `Invalid type: ${record.type}.`, `Use one of: ${Array.from(VALID_TYPES).join(", ")}.`);
  }
  if (!VALID_CONFIDENCE.has(record.confidence)) {
    fail("INVALID_CONFIDENCE", `Invalid confidence: ${record.confidence}.`, "Use high, medium, or low.");
  }
  if (record.status != null && record.status !== "" && !VALID_STATUS.has(String(record.status))) {
    fail("INVALID_STATUS", `Invalid status: ${record.status}.`, "Use null, pending, achieved, or discorded.");
  }

  return {
    id,
    knowledge: record.knowledge,
    original: record.original ?? "",
    url: record.url ?? "",
    date: record.date ?? new Date().toISOString().slice(0, 10),
    tags: Array.isArray(record.tags) ? record.tags : [],
    type: record.type,
    confidence: record.confidence,
    status: record.status == null || record.status === "" || record.status === "null" ? null : record.status,
    author: record.author ?? "",
  };
}

async function readStdin() {
  if (process.stdin.isTTY) return "";
  let input = "";
  for await (const chunk of process.stdin) input += chunk;
  return input.trim();
}

function searchAtoms(atoms, argv) {
  const limit = Number(optionValue(argv, ["-l", "--limit"]) ?? 20);
  const begin = optionValue(argv, ["-b", "--begin"]);
  const end = optionValue(argv, ["-e", "--end"]);
  const statuses = optionValue(argv, ["-s", "--status"])?.split(",").map((item) => item.trim()).filter(Boolean);
  const confidence = optionValue(argv, ["-c", "--confidence"])?.split(",").map((item) => item.trim()).filter(Boolean);
  const authors = optionValue(argv, ["-a", "--author"])?.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  const types = optionValues(argv, ["-t", "--type"]);
  const tags = optionValues(argv, ["-T", "--tags"]).flatMap((item) => item.split(",").map((tag) => tag.trim()).filter(Boolean));
  const keywordGroups = positionalArgs(argv)
    .map((item) => item.split(",").map((keyword) => keyword.trim().toLowerCase()).filter(Boolean))
    .filter((group) => group.length > 0);

  return atoms
    .filter((atom) => !begin || String(atom.date ?? "") >= begin)
    .filter((atom) => !end || String(atom.date ?? "") <= end)
    .filter((atom) => !statuses || statuses.includes(atom.status ?? "null"))
    .filter((atom) => !confidence || confidence.includes(atom.confidence))
    .filter((atom) => types.length === 0 || types.includes(atom.type))
    .filter((atom) => tags.length === 0 || tags.some((tag) => atom.tags?.includes(tag)))
    .filter((atom) => !authors || authors.some((author) => String(atom.author ?? "").toLowerCase().includes(author)))
    .filter((atom) => {
      const content = JSON.stringify(atom).toLowerCase();
      return keywordGroups.every((group) => group.some((keyword) => content.includes(keyword)));
    })
    .sort((a, b) => {
      const dateCompare = String(b.date ?? "").localeCompare(String(a.date ?? ""));
      if (dateCompare !== 0) return dateCompare;
      return String(b.id).localeCompare(String(a.id));
    })
    .slice(0, Number.isFinite(limit) ? limit : 20);
}

function formatCsvValue(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function printSearchResult(data, argv) {
  const format = optionValue(argv, ["-f", "--format"]) ?? (wantsJson ? "json" : "text");

  if (data.length === 0) {
    console.log("(无匹配结果)");
    return;
  }

  if (format === "json") {
    if (wantsJson) console.log(JSON.stringify({ ok: true, data, error: null }, null, 2));
    else console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (format === "csv") {
    console.log("id,knowledge,original,url,date,tags,type,confidence,status,author");
    for (const atom of data) {
      console.log([
        atom.id,
        atom.knowledge,
        atom.original ?? "",
        atom.url ?? "",
        atom.date ?? "",
        Array.isArray(atom.tags) ? atom.tags.join("; ") : "",
        atom.type,
        atom.confidence,
        atom.status ?? "",
        atom.author ?? "",
      ].map(formatCsvValue).join(","));
    }
    return;
  }

  if (format === "table") {
    console.log("| ID | Knowledge | Type | Confidence | Status | Author | Tags | Date |");
    console.log("|---|---|---|---|---|---|---|---|");
    for (const atom of data) {
      const knowledge = String(atom.knowledge ?? "").slice(0, 60);
      console.log(`| ${atom.id} | ${knowledge} | ${atom.type} | ${atom.confidence} | ${atom.status ?? "-"} | ${atom.author ?? ""} | ${(atom.tags ?? []).join(", ")} | ${atom.date ?? ""} |`);
    }
    return;
  }

  if (format !== "text") {
    fail("INVALID_FORMAT", `Unsupported format: ${format}.`, "Use text, json, table, or csv.");
  }

  for (const atom of data) {
    console.log("---");
    console.log(`${atom.id}  ${atom.type}  ${atom.confidence}  ${atom.status ?? "-"}  ${atom.author ? `@${atom.author}` : ""}`);
    console.log(Array.isArray(atom.tags) && atom.tags.length > 0 ? atom.tags.map((tag) => `#${tag}`).join(" ") : "-");
    console.log(atom.knowledge);
    const original = atom.original ? `[原文] ${String(atom.original).slice(0, 150)}${String(atom.original).length > 150 ? "..." : ""}` : "[原文] -";
    console.log(original);
    console.log(atom.url ? `[链接] ${atom.url}` : "[链接] -");
    console.log(atom.date || "-");
  }
}

async function main() {
  const [group, command, ...rest] = cleanArgs;
  if (!group || group === "-h" || group === "--help") {
    showHelp();
    return;
  }
  if (group !== "wiki") {
    fail("UNKNOWN_COMMAND", `Unknown command: ${group ?? ""}.`, "Use: yo wiki <search|add|update>.");
  }
  if (!command || command === "-h" || command === "--help") {
    showHelp();
    return;
  }
  if (rest.includes("-h") || rest.includes("--help")) {
    showCommandHelp(command);
    return;
  }

  const file = wikiDataFile();

  if (command === "search") {
    printSearchResult(searchAtoms(readAtoms(file), rest), rest);
    return;
  }

  if (command === "add") {
    const input = positionalArgs(rest).find((item) => item.trim().startsWith("{")) ?? await readStdin();
    if (!input) fail("MISSING_RECORD", "Missing JSON record.", "Use: yo wiki add '{...}'.");

    await withLock(file, () => {
      const atoms = readAtoms(file);
      const record = normalizeRecord(JSON.parse(input), nextId(atoms));
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.appendFileSync(file, `${JSON.stringify(record)}\n`);
      const preview = String(record.knowledge).slice(0, 60);
      respond(true, { ...record, message: `✓ 已添加: ${record.id} — ${preview}` });
    });
    return;
  }

  if (command === "update") {
    const [id] = positionalArgs(rest);
    if (!id) fail("MISSING_ID", "Missing atom id.", "Use: yo wiki update <id> --status achieved.");

    await withLock(file, () => {
      const atoms = readAtoms(file);
      const index = atoms.findIndex((atom) => atom.id === id);
      if (index < 0) fail("ATOM_NOT_FOUND", `Atom not found: ${id}.`, "Run yo wiki search first.");

      const status = optionValue(rest, ["-s", "--status"]);
      const type = optionValue(rest, ["-t", "--type"]);
      const confidence = optionValue(rest, ["-c", "--confidence"]);
      const tags = optionValue(rest, ["-T", "--tags"]);

      if (status !== undefined) {
        if (!VALID_STATUS.has(status)) fail("INVALID_STATUS", `Invalid status: ${status}.`, "Use null, pending, achieved, or discorded.");
        atoms[index].status = status === "null" ? null : status;
      }
      if (type !== undefined) {
        if (!VALID_TYPES.has(type)) fail("INVALID_TYPE", `Invalid type: ${type}.`, `Use one of: ${Array.from(VALID_TYPES).join(", ")}.`);
        atoms[index].type = type;
      }
      if (confidence !== undefined) {
        if (!VALID_CONFIDENCE.has(confidence)) fail("INVALID_CONFIDENCE", `Invalid confidence: ${confidence}.`, "Use high, medium, or low.");
        atoms[index].confidence = confidence;
      }
      if (tags !== undefined) atoms[index].tags = tags.split(",").map((tag) => tag.trim()).filter(Boolean);

      writeAtoms(file, atoms);
      const changes = [];
      if (status !== undefined) changes.push(`status → ${status}`);
      if (type !== undefined) changes.push(`type → ${type}`);
      if (confidence !== undefined) changes.push(`confidence → ${confidence}`);
      if (tags !== undefined) changes.push(`tags → ${tags}`);
      const preview = String(atoms[index].knowledge ?? "").slice(0, 60);
      respond(true, { ...atoms[index], message: `✓ 已更新: ${id} — ${changes.join(" ")}\n  ${preview}` });
    });
    return;
  }

  fail("UNKNOWN_WIKI_COMMAND", `Unknown wiki command: ${command ?? ""}.`, "Use: search, add, or update.");
}

main().catch((error) => {
  fail("UNEXPECTED_ERROR", error.message, "Check WIKI_DIR and command arguments.");
});
