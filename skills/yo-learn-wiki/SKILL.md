---
name: yo-learn-wiki
description: 将 Obsidian 笔记按主题组织为知识 Entity，通过 wiki link 建立知识图谱。Use when user asks to "整理笔记", "归档到知识库", "知识库整理", "ingest", "lint", or provides a note and wants it organized into the knowledge base.
version: 0.1.0
author: yolanda
---

# Yo Learn Wiki

将 Obsidian 笔记按主题梳理为知识 Entity，通过 wiki link 关联源材料，构建个人知识图谱。
基于 Obsidian CLI 查询元数据和链接关系，最小化全文读取。

两个操作：
- **ingest**：读取源文件 → 匹配/创建 Entity → 写入
- **lint**：检查知识库健康状态（零全文读取）

## User Input Tools

When this skill prompts the user, follow this tool-selection rule (priority order):

1. **Prefer built-in user-input tools** exposed by the current agent runtime — e.g., `AskUserQuestion`, `request_user_input`, `clarify`, `ask_user`, or any equivalent.
2. **Fallback**: if no such tool exists, emit a numbered plain-text message and ask the user to reply with the chosen number/answer for each question.
3. **Batching**: if the tool supports multiple questions per call, combine all applicable questions into a single call; if only single-question, ask them one at a time in priority order.

Concrete `AskUserQuestion` references below are examples — substitute the local equivalent in other runtimes.

## Workflow

```
- [ ] Step 0: Load preferences (EXTEND.md) ⛔ BLOCKING
- [ ] Step 1: Determine operation (ingest / lint)
```

### Step 0: Load preferences (EXTEND.md) ⛔ BLOCKING

检查 EXTEND.md（优先级：项目级 > 用户级）：

```bash
test -f .claude/skills/yo-learn-wiki/EXTEND.md -o -f .agent/skills/yo-learn-wiki/EXTEND.md && echo "project"
test -f "${XDG_CONFIG_HOME:-$HOME/.config}/yolanda-skills/yo-learn-wiki/EXTEND.md" && echo "xdg"
```

| Result | Action |
|--------|--------|
| Found | 读取 `vault`、`wiki_dir`、`base_file`、`source_dirs` |
| Not found | 按 [references/first-time-setup.md](references/first-time-setup.md) 引导创建 |

以下文档中 `{vault}`、`{wiki_dir}`、`{base_file}`、`{source_dirs}` 均从 EXTEND.md 读取。

### Step 1: Determine operation

| 用户意图 | 操作 |
|---------|------|
| 提供文件/目录路径，要求整理 | → Ingest |
| 要求检查、审查知识库状态 | → Lint |

---

## Operation: Ingest

### Ingest Step 1: 读取源文件

- 单文件：用 `obsidian read` 读取源文件内容
- 目录：先用 `obsidian files` 列出文件，用户确认后逐个进入单文件流程

### Ingest Step 2: 分析内容（LLM）

按 [references/template.md](references/template.md) 中对应类型的提取维度分析源文件。同时判断页面类型：

| 内容特征 | 类型 |
|---------|------|
| 聚焦一个具体事物、技术或概念 | Entity |
| 宏观综述，聚合多个知识点的主题 | Topic |
| 两者兼有 | 拆分为 Entity + Topic，互相关联 |

### Ingest Step 3: 匹配页面（纯 CLI）

对 Step 2 确定的每个页面类型分别匹配：

1. **精确匹配**：用 `obsidian backlinks` 检查源文件是否已被某页面的更新日志引用
2. **主题匹配**：若未命中，用 `obsidian base:query` 获取所有 Entity/Topic description，比较主题重叠度
3. **无匹配**：创建新页面

### Ingest Step 4: 写入

**创建新页面**：

1. 推断领域子目录（基于内容），不确定则询问用户
2. 按 [references/template.md](references/template.md) 生成内容（根据 Step 2 判断的类型选择 Entity 或 Topic 模板）
3. 用 `obsidian create` 创建文件

**更新已有页面**：

1. 用 `obsidian read` 读取现有页面全文
2. 解析 `## 关联` 中的页面名称
3. 用 `obsidian base:query` 获取所有 Entity/Topic description → 快速感知关联页面
4. 若关联页面与本次更新高度相关 → 按需 `obsidian read` 精读
5. LLM 综合理解后，决定如何补充/刷新：
   - 更新 `## 核心理解`（如果新内容改变了主题认知）
   - 更新 `## 核心特征` 或 `## 支撑框架`（补充要点、修正理解）
   - 在 `## 更新日志` 追加一条增量记录
   - 检查 `## 关联` 是否需要更新（新增/移除关联）
6. 写回文件
7. 若变更影响了关联页面 → 提示用户是否需要一并更新

**关联感知三档**：解析关联名 → description 快速感知 → 按需精读。大部分到第二步即可。

---

## Operation: Lint

**全程零全文读取**，4 条 CLI 命令覆盖所有检查项。

### Lint Step 1: 页面元数据

用 `obsidian base:query` 获取所有 Entity 和 Topic，检查 `description`（error）和 `cover`（warn）。

### Lint Step 2: 断链检查

用 `obsidian unresolved` 获取未解析链接，过滤仅报告 `{wiki_dir}` 内页面的断链。

### Lint Step 3: 无来源页面

用 `obsidian deadends` 获取无出链文件，过滤仅报告 `{wiki_dir}` 内的页面。

### Lint Step 4: 孤立源文件

用 `obsidian orphans` 获取无人引用的文件，过滤仅报告 `{source_dirs}` 内的文件。

### Lint 输出格式

```
## Lint 报告

### Errors ({n})
- {domain}/{name}.md: 缺少 description
- {domain}/{name}.md: 断链 → [[不存在的文件]]

### Warnings ({n})
- {domain}/{name}.md: 无来源链接（deadend）
- {domain}/{name}.md: 缺少 cover

### Info: 孤立源文件 ({n})
- {source_dir}/{file}.md
```

---

## CLI 速查

所有命令使用 `obsidian vault="{vault}"` 前缀。`{vault}` 从 EXTEND.md 读取。

### 读取与查询

| 用途 | 命令 | 输出 |
|------|------|------|
| 列出所有页面元数据 | `base:query file="{base_file}" format=json` | Entity/Topic 列表含 frontmatter 属性 |
| 查找引用某文件的页面 | `backlinks file="{name}" format=json` | backlink 列表 |
| 读取文件内容 | `read file="{name}"` | 文件全文 |
| 读取单个 frontmatter 属性 | `property:read file="{name}" name={prop}` | 属性值 |
| 列出目录下文件 | `files folder="{folder}" ext=md` | 文件路径列表 |
| 列出目录结构 | `folders folder="{path}"` | 子目录列表 |
| 查看文件标题结构 | `outline file="{name}" format=json` | heading 层级 |

### 创建与写入

| 用途 | 命令 |
|------|------|
| 创建新文件 | `create path="{path}" content="..."` |
| 追加内容到文件末尾 | `append file="{name}" content="..."` |
| 设置 frontmatter 属性 | `property:set file="{name}" name={prop} value="{val}"` |

### 诊断

| 用途 | 命令 | 输出 |
|------|------|------|
| 未解析链接（断链） | `unresolved format=json` | 断链文件 + 链接来源 |
| 无入链文件（孤立） | `orphans format=json` | 无人引用的文件列表 |
| 无出链文件（deadend） | `deadends format=json` | 不引用任何文件的列表 |

### Setup

| 用途 | 命令 |
|------|------|
| 列出所有 vault | `vaults` |
| 当前 vault 信息 | `vault info=name` |
| 列出所有 base 文件 | `bases` |

## Content Rules

- 页面文件名和领域目录名使用中文

## Extension Support

Custom configurations via EXTEND.md. See **Step 0** for paths and supported options.
