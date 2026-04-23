---
name: yo-<分类>-<功能>
description: <第三人称描述。做什么 + 何时使用 + 触发关键词>
version: 0.1.0
author: yolanda
---

# <Skill 标题>

一段话说明这个 skill 做什么。

## User Input Tools

When this skill prompts the user, follow this tool-selection rule (priority order):

1. **Prefer built-in user-input tools** exposed by the current agent runtime — e.g., `AskUserQuestion`, `request_user_input`, `clarify`, `ask_user`, or any equivalent.
2. **Fallback**: if no such tool exists, emit a numbered plain-text message and ask the user to reply with the chosen number/answer for each question.
3. **Batching**: if the tool supports multiple questions per call, combine all applicable questions into a single call; if only single-question, ask them one at a time in priority order.

Concrete tool names above are examples — substitute the local equivalent in other runtimes.

## Execution Flow

1. 第一步：前置检查 / 环境准备
2. 第二步：...
3. 第三步：...
4. 第四步：输出 / 交付

## Content Rules

- 规则 1
- 规则 2

## Output Template

（固定的输出格式模板）

## Extension Support

检查 EXTEND.md 配置文件（优先级：项目目录 > 用户目录）：

```bash
test -f .yo-skills/<skill-name>/EXTEND.md && echo "project"
test -f "$HOME/.yo-skills/<skill-name>/EXTEND.md" && echo "user"
```

| 位置 | 说明 |
|------|------|
| `.yo-skills/<skill-name>/EXTEND.md` | 项目特定配置 |
| `$HOME/.yo-skills/<skill-name>/EXTEND.md` | 用户全局配置 |

找到配置文件后读取并应用。未找到时使用默认行为。

## References

- [references/xxx.md](references/xxx.md)
