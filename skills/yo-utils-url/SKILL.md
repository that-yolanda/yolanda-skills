---
name: yo-utils-url
description: 基于 opencli（Chrome CDP + 站点适配器）采集 URL 内容，转为干净的 markdown 并下载图片/视频。Use when user asks to "下载"、"获取"、"提取"、"保存" with a specific URL, or provides a link and wants content archived as local files.
version: 0.0.1
author: yolanda
---

# Yo Utils URL

通过 opencli 采集 URL 内容，输出干净的 markdown + 本地图片/视频。
若用户提及需要初始化知识库，则参考 Workflow STEP 0 引导用户创建 EXTEND.md。
若用户提供 URL 则参考完整 Workflow 进行采集。

## User Input Tools

When this skill prompts the user, follow this tool-selection rule (priority order):

1. **Prefer built-in user-input tools** exposed by the current agent runtime — e.g., `AskUserQuestion`, `request_user_input`, `clarify`, `ask_user`, or any equivalent.
2. **Fallback**: if no such tool exists, emit a numbered plain-text message and ask the user to reply with the chosen number/answer for each question.
3. **Batching**: if the tool supports multiple questions per call, combine all applicable questions into a single call; if only single-question, ask them one at a time in priority order.

Concrete `AskUserQuestion` references below are examples — substitute the local equivalent in other runtimes.

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `{baseDir}`
2. Script path = `{baseDir}/scripts/<script-name>.ts`
3. Resolve `${BUN_X}` runtime: if `bun` installed → `bun`; if `npx` available → `npx -y bun`; else suggest installing bun
4. Replace all `{baseDir}` and `${BUN_X}` in this document with actual values

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/preflight.ts` | Chrome 环境诊断 + 启动修复 |
| `scripts/postprocess.ts` | Markdown 清理 + 文件迁移 + 清理 |

## Workflow

```
- [ ] Step 0: Load preferences (EXTEND.md) ⛔ BLOCKING
- [ ] Step 1: Route URL → adapter
- [ ] Step 2: Preflight (仅 needs_browser=true)
- [ ] Step 3: Fetch content
- [ ] Step 4: Post-process
- [ ] Step 5: Summary
```

### Step 0: Load preferences (EXTEND.md) ⛔ BLOCKING

检查 EXTEND.md（优先级：项目级 > 用户级）：

```bash
test -f .claude/skills/yo-utils-url/EXTEND.md -o -f .agent/skills/yo-utils-url/EXTEND.md && echo "project"
test -f "${XDG_CONFIG_HOME:-$HOME/.config}/yolanda-skills/yo-utils-url/EXTEND.md" && echo "xdg"
```

| Result | Action |
|--------|--------|
| Found | 读取 `tmp_dir`、`markdown.dir`、`assets.dir`、`assets.download` 等字段 |
| Not found | 按 [references/first-time-setup.md](references/first-time-setup.md) 引导创建 |

### Step 1: Route URL → adapter

从 URL 提取 hostname，grep 查路由表：

```bash
grep -i "<hostname>" {baseDir}/references/adapters.md || grep '^\*' {baseDir}/references/adapters.md
```

匹配行格式：`pattern⇥platform⇥needs_browser⇥command`

提取 `command`（第 4 列），替换占位符：
- `{url}` → 用户 URL
- `{tmp}` → EXTEND.md 的 `tmp_dir`
- `{download_images}` → `assets.download` 包含 "image" 则为 `true`，否则 `false`

### Step 2: Preflight (仅 needs_browser=true)

```bash
${BUN_X} {baseDir}/scripts/preflight.ts --need-browser true --config "<extend-path>"
```

| 输出 | Action |
|------|--------|
| `{"status":"ok",...}` | 进入 Step 3 |
| `{"status":"error","step":"opencli",...}` | 提示安装 opencli |
| `{"status":"error","step":"launch",...}` | Chrome 启动失败，报告用户 |
| `{"status":"error","step":"extension",...}` | 提示安装 Browser Bridge 扩展 |

若 `needs_browser=false`，跳过此步骤。

### Step 3: Fetch content

```bash
<command> > {tmp_dir}/fetch-result.json 2>{tmp_dir}/fetch-stderr.log; echo $?
```

| exit code | Action |
|-----------|--------|
| `0` | 读 `fetch-result.json` 的 `title`、`saved`，进 Step 4 |
| 非 `0` | 读 stderr 报告用户 |

### Step 4: Post-process

```bash
${BUN_X} {baseDir}/scripts/postprocess.ts \
  --tmp "{tmp_dir}" \
  --title "<title>" \
  --platform "<platform>" \
  --config "<extend-path>"
```

输出：`{"files":1,"images":5,"videos":0,"total_size":"12.4 MB","output":"文章/weixin"}`

### Step 5: Summary

读 Step 4 输出，报告用户：

> 已保存至 `文章/weixin/`：1 篇文章，5 张图片，共 12.4 MB

## Content Rules

- 不读取 markdown 全文到上下文
- 只传递 JSON 摘要
- 错误只报告步骤 + 原因

## Extension Support

Custom configurations via EXTEND.md. See **Step 0** for paths and supported options.
