---
name: yo-opentalk
description: Yolanda 知识系统日常对话入口。根据用户意图路由到原子录入、画像更新或自由交流。用于与 Yolanda 的日常对话，当可能需要知识沉淀、偏好更新、状态跟踪或开放讨论时使用。
version: 0.0.1
author: yolanda
---

# yo-opentalk

日常对话主入口。

`$WIKI_DIR` 是系统环境变量，指向知识库根目录。下文所有路径通过 `$WIKI_DIR` 引用。首次使用若未配置，按 [references/first-time-setup.md](references/first-time-setup.md) 引导用户设置。

## User Input Tools

当本 skill 需要提示用户时，按此工具选择规则（优先级顺序）：

1. **优先使用当前 agent runtime 内置的用户输入工具** — 如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user`、`questionnaire` 或等效工具。
2. **回退到纯文本**：若无此类工具，输出编号的纯文本消息，让用户回复选择的编号/答案。
3. **批量规则**：若工具支持单次调用多个问题，将所有适用问题合并为一次调用；若仅支持单问题，按优先级逐个提问。

下文对 `AskUserQuestion` 的具体提及均为示例 — 其他 runtime 按规则替换为本地等效工具。

## 必须阅读

- `$WIKI_DIR/我的画像/我的当前状态.md` — 用户当前上下文
- `$WIKI_DIR/我的画像/我的偏好.md` — AI 交互偏好

## 做什么

接收用户对话，判定意图后路由。

- 用户分享了值得沉淀的信息（经验、阅读、想法、链接）→ 调用 `yo-wiki-atom`
- 用户表达了新的偏好、目标、疑问或状态变化 → 调用 `yo-whoami` → 然后判断是需要更新，还是回答
- 需要借助知识库判断的问题 → 读取 `$WIKI_DIR/知识库/使用说明.md` 了解现有知识库结构，读取相关领域知识内容做回答

## 禁止行为
- 严禁直接修改 `知识库`，`原子库` 中的内容

对话结束时调用 `yo-whoami` 更新 `我的当前状态` 的 4 个字段。
