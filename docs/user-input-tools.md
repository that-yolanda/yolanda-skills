# User Input Tools

本仓库的 skill 可被多种 agent runtime 加载（Claude Code、其他 agent、纯 CLI）。每种 runtime 暴露不同的用户交互 API。本文档定义所有 skill 遵循的**工具选择规则**，确保 skill 在不同 runtime 间保持可移植。

## Tool Selection（优先级顺序）

1. **优先使用 runtime 内置的用户输入工具** — 如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或等效工具。
2. **回退到纯文本**：若无此类工具，输出编号的纯文本消息，让用户回复选择的编号/答案。
3. **批量规则**：
   - 若工具支持**单次调用多个问题**（如 `AskUserQuestion`）：**将所有适用的问题合并为一次调用，不得拆分为多次调用。**
   - 若工具仅支持**单次调用一个问题**（如单提示 `clarify`）：**按优先级逐个提问。**

## How Skills Declare This

每个使用交互式用户输入的 `SKILL.md` 必须在**恰好一个** `## User Input Tools` section（通常位于顶部，简介之后）中**内联**此规则。不要从 SKILL.md 链接到本文档 — skills 是自包含的（参见 [CLAUDE.md → Skill Self-Containment](../CLAUDE.md)）。本文档是作者侧的规范来源，将其内容复制到每个 SKILL.md 中。该规则随后约束该 skill 及其 `references/` 文件中的所有用户交互。

SKILL.md 中对具体工具（如 `AskUserQuestion`）的提及是**具体示例** — 其他 runtime 中的 agent 按上述规则替换为本地等效工具。工具特定参数（如 `header:`、`multiSelect:`）仅作说明用途；不支持这些参数的 runtime 可省略。
