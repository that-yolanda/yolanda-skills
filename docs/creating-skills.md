# Creating New Skills

## Key Requirements

| Requirement | Details |
|-------------|---------|
| **Prefix** | 所有 skill 必须使用 `yo-<分类>-` 前缀（`yo-code-`、`yo-learn-`、`yo-insight-`） |
| **name field** | 最长 64 字符，小写字母/数字/连字符，不含 "anthropic"/"claude" |
| **description** | 最长 1024 字符，第三人称，包含做什么 + 何时使用 |
| **SKILL.md body** | 保持在 500 行以内；额外内容放 `references/` |
| **References** | 仅一层深度，不从 SKILL.md 向外嵌套引用 |

## Skill Grouping

| 分类 | 前缀 | 用途 | 示例 |
|------|------|------|------|
| Code Skills | `yo-code-` | 编码相关 | README 生成、代码审查、重构 |
| Learn Skills | `yo-learn-` | 学习与积累 | 知识采集、闪卡、总结 |
| Insight Skills | `yo-insight-` | 研究与洞察 | arxiv 分析、趋势研究、对比分析 |

## SKILL.md Frontmatter Template

```yaml
---
name: yo-<分类>-<功能>
description: <第三人称描述。做什么 + 何时使用 + 触发关键词>
version: <semver>
author: yolanda
---
```

## Steps

1. 创建 `skills/yo-<分类>-<功能>/SKILL.md`，含 YAML frontmatter
2. 在 `skills/yo-<分类>-<功能>/scripts/` 添加 TypeScript 脚本（如需要）
3. 在 `skills/yo-<分类>-<功能>/prompts/` 添加提示词模板（如需要）
4. 在 `skills/yo-<分类>-<功能>/references/` 添加参考文档（如需要）
5. 在 `skills/yo-<分类>-<功能>/agents/` 添加 agent 配置（如需要）
6. 如有脚本，在 SKILL.md 中添加 Script Directory section
7. 更新仓库 README.md 的 Skill 列表

## Writing Descriptions

**必须使用第三人称：**

```yaml
# Good
description: 创建或更新项目根目录下的 README.md 文件，按固定模板整理项目信息。Use when the user asks to create, update, or refresh a project README.

# Bad
description: 我可以帮你创建 README 文件
```

## Script Directory Template

有脚本的 SKILL.md 必须包含：

```markdown
## Script Directory

**Important**: 所有脚本位于本 skill 的 `scripts/` 子目录。

**Agent Execution Instructions**:
1. 确定 SKILL.md 文件所在目录路径为 `{baseDir}`
2. 脚本路径 = `{baseDir}/scripts/<script-name>.ts`
3. 解析 `${BUN_X}` 运行时：若 `bun` 已安装 → `bun`；若 `npx` 可用 → `npx -y bun`；否则提示安装 bun
4. 将文档中所有 `{baseDir}` 和 `${BUN_X}` 替换为实际值

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | 主入口 |
```

## Progressive Disclosure

内容较多的 skill 使用渐进式结构：

```
skills/yo-<分类>-<功能>/
├── SKILL.md              # 主指令（<500 行）
├── references/
│   ├── styles.md         # 按需加载
│   └── examples.md       # 按需加载
└── scripts/
    └── main.ts
```

从 SKILL.md 引用（仅一层深度）：
```markdown
**可用样式**: 参见 [references/styles.md](references/styles.md)
```

## User Input Tools Section（必需）

需要向用户提问的 SKILL.md **必须**在顶部（简介之后、主流程之前）包含一个 `## User Input Tools` section。规则必须**内联** — 不得链接到 `docs/user-input-tools.md`（skills 是自包含的）。此文档是作者侧的规范来源，将内容复制到每个 SKILL.md 中。

标准片段（直接复制）：

```markdown
## User Input Tools

When this skill prompts the user, follow this tool-selection rule (priority order):

1. **Prefer built-in user-input tools** exposed by the current agent runtime — e.g., `AskUserQuestion`, `request_user_input`, `clarify`, `ask_user`, or any equivalent.
2. **Fallback**: if no such tool exists, emit a numbered plain-text message and ask the user to reply with the chosen number/answer for each question.
3. **Batching**: if the tool supports multiple questions per call, combine all applicable questions into a single call; if only single-question, ask them one at a time in priority order.

Concrete tool names above are examples — substitute the local equivalent in other runtimes.
```

## Extension Support (EXTEND.md)

支持用户自定义配置的 SKILL.md 必须在开头（Workflow skills 作为 Step 1.1，Utility skills 在 Preferences section）包含 EXTEND.md 加载逻辑：

```markdown
**1.1 Load Preferences (EXTEND.md)**

检查 EXTEND.md 是否存在（优先级顺序）：

\`\`\`bash
test -f .yo-skills/<skill-name>/EXTEND.md && echo "project"
test -f "$HOME/.yo-skills/<skill-name>/EXTEND.md" && echo "user"
\`\`\`

| 路径 | 位置 |
|------|------|
| `.yo-skills/<skill-name>/EXTEND.md` | 项目目录 |
| `$HOME/.yo-skills/<skill-name>/EXTEND.md` | 用户主目录 |

| 结果 | 操作 |
|------|------|
| 找到 | 读取、解析、显示摘要 |
| 未找到 | 通过 User Input Tools 询问用户 |
```

SKILL.md 末尾应包含：
```markdown
## Extension Support

通过 EXTEND.md 自定义配置。参见 **Step 1.1** 了解路径和支持选项。
```
