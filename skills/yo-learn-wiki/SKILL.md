---
name: yo-learn-wiki
description: 将 Obsidian 笔记按专题组织为结构化知识库，每个专题是可被 AI 直接引用的子知识库。Use when user asks to "整理笔记", "归档到知识库", "知识库整理", "专题整理", "ingest", "restructure", or provides a note and wants it organized into the knowledge base.
version: 0.2.0
author: yolanda
---

> ⚠️ **Deprecated**：本 skill 已废弃、不再维护。知识库整理能力已由 `yo-opentalk` / `yo-wiki-atom` / `yo-wiki-review` + `知识库模板` 取代。

# Yo Learn Wiki

将 Obsidian 笔记按专题组织为结构化知识库。每个专题目录是一个自包含的子知识库——有索引入口、逻辑排序、完整方法论，AI agent 执行任务时可直接引用。

两个操作：
- **ingest**：读取源文件 → 准入判断 → 定位/创建专题 → 丰富专题结构
- **restructure**：专题结构整理（将无序内容重组为有序知识库）

## User Input Tools

When this skill prompts the user, follow this tool-selection rule (priority order):

1. **Prefer built-in user-input tools** exposed by the current agent runtime — e.g., `AskUserQuestion`, `request_user_input`, `clarify`, `ask_user`, `questionnaire`, or any equivalent.
2. **Fallback**: if no such tool exists, emit a numbered plain-text message and ask the user to reply with the chosen number/answer for each question.
3. **Batching**: if the tool supports multiple questions per call, combine all applicable questions into a single call; if only single-question, ask them one at a time in priority order.

Concrete `AskUserQuestion` references below are examples — substitute the local equivalent in other runtimes.

## Workflow

```
- [ ] Step 0: Load preferences (EXTEND.md) ⛔ BLOCKING
- [ ] Step 1: Determine operation (ingest / restructure)
```

### Step 0: Load preferences (EXTEND.md) ⛔ BLOCKING

检查 EXTEND.md（优先级：项目级 > 用户级）：

```bash
test -f .claude/skills/yo-learn-wiki/EXTEND.md -o -f .agent/skills/yo-learn-wiki/EXTEND.md && echo "project"
test -f "${YO_CONFIG_HOME:-$HOME/.local/share/yo}/yo-learn-wiki/EXTEND.md" && echo "xdg"
```

| Result | Action |
|--------|--------|
| Found | 读取 `vault`、`wiki_dir`、`base_file`、`source_dirs` |
| Not found | 按 [references/first-time-setup.md](references/first-time-setup.md) 引导创建 |

以下文档中 `{vault}`、`{wiki_dir}`、`{base_file}`、`{source_dirs}` 均从 EXTEND.md 读取。

CLI 命令参考 [references/cli-reference.md](references/cli-reference.md)。

### Step 1: Determine operation

| 用户意图 | 操作 |
|---------|------|
| 提供文件/目录路径，要求整理 | → Ingest |
| 要求整理专题结构、重组目录 | → Restructure |

---

## Operation: Ingest

### Ingest Step 1: 读取源文件

- 单文件：用 `obsidian-cli read` 读取源文件内容
- 目录：先用 `obsidian-cli files` 列出文件，用户确认后逐个进入单文件流程

### Ingest Step 2: 准入判断与专题定位

1. 用 `obsidian-cli base:query file="{base_file}" format=json` 获取所有页面的 description 和 tags（复用于后续步骤）
2. 按 [references/template.md](references/template.md) 的「准入标准」评估源内容

若拒绝，说明原因，结束。若准入通过，继续定位专题：

3. 用 `obsidian-cli folders folder="{wiki_dir}"` 获取所有专题目录
4. 通过 `00-` 文件名前缀识别专题索引页，判断源文件最匹配哪个专题

**匹配到已有专题** → 继续 Step 3。

**无匹配专题** → 评估是否需要新建专题：
1. 用准入标准（专题级）判断是否值得建
2. 若值得，向用户展示建议：
   - 专题名称
   - 基于什么内容建议创建
   - 服务于什么 AI 任务场景
   - 建议的初始知识路径结构
3. 用户确认后创建专题目录和索引页（`00-{专题名}.md`）
4. 继续将当前内容写入新专题

### Ingest Step 3: 专题内分析

1. 读取目标专题的索引页（`00-{专题名}.md`），了解现有知识路径和页面约定
2. 读取专题内相关页面的 description，定位新内容应该：
   - **补充已有页面**：新内容是对已有知识点的深化/扩展
   - **插入新页面**：新内容是专题中尚缺的环节
   - **更新索引**：新内容改变了专题的整体认知

### Ingest Step 4: 写入

**更新已有页面**：

1. 用 `obsidian-cli read` 读取目标页面全文
2. 按 [references/template.md](references/template.md) 的「更新时的整体评估」从结构层面判断：
   - 新内容是否改变了页面主题范围 → 更新 `description`
   - 新内容是否引入新话题维度 → 更新 `tags`
   - 新内容是否需要调整逻辑顺序 → 重排 heading
   - 新内容是否让现有结构不够用 → 重构内容层级
   - 新内容是否改变了页面核心定位 → 考虑重命名文件
3. 将新内容融入页面，确保更新后整体结构连贯、逻辑有条理
4. 在 `更新日志` 追加一条增量记录
5. 写回

**创建新页面**：

1. 根据专题索引页的 `知识路径` 确定新页面在逻辑序列中的位置
2. 文件名格式：`{序号}-{主题名}.md`（序号基于逻辑位置，已有文件序号可能需要调整）
3. 按写作质量指南生成内容，遵循专题索引页的「页面约定」（如有）
4. tags 按 [references/template.md](references/template.md) 的「Tags 约定」设置
5. 更新专题索引页的 `知识路径`，插入新条目

每次写入后同步检查专题索引页是否需要更新（知识路径、核心原则、tags）。

---

## Operation: Restructure（专题整理）

检查并调整知识库的专题目录结构。核心能力：将无序专题重组为有序结构。

### Restructure Step 1: 扫描结构

用 `obsidian-cli folders folder="{wiki_dir}"` 获取所有专题目录及其文件数量。

### Restructure Step 2: 两阶段分析

**阶段一（粗筛）**：用 `obsidian-cli base:query file="{base_file}" format=json` 获取所有页面的 description，快速感知每个专题下的内容分布。

**阶段二（精读）**：对粗筛中判断模糊的专题（如 description 相似度高、或主题边界不清），用 `obsidian-cli read` 精读具体文件内容，明确归属。

大部分专题到阶段一即可，仅对存疑部分进入阶段二。

### Restructure Step 3: 生成建议并执行

基于分析结果生成建议，用户确认后执行。

**目录结构建议**：

| 信号 | 建议 |
|------|------|
| 单个专题内 description 主题跨度大、无明显内在联系 | 建议拆分为更细专题 |
| 小专题内容与另一专题高度重叠 | 建议合并 |
| 多个专题间的页面存在强关联但分属不同专题 | 建议重组 |
| 小专题内容独立、无重叠 | 保留，不做建议 |

**专题内排序**：为需要重组的专题确定逻辑顺序（前置知识优先、基础到进阶、流程顺序等），分配序号 `01-{主题}.md`，生成或更新索引页 `00-{专题名}.md`。

将所有建议一次性展示给用户，确认后统一执行：移动文件、重命名、创建/更新索引页、更新关联链接。

---

## Extension Support

Custom configurations via EXTEND.md. See **Step 0** for paths and supported options.
