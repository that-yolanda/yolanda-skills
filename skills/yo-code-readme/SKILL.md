---
name: yo-code-readme
description: 创建或更新项目根目录下的 README.md 文件，按固定模板整理项目名称、简介、核心功能、快速开始、开发指南、规划和参考文档。适用于任意技术架构。Use when the user asks to create, generate, write, refresh, rewrite, or update a project README, including requests such as `创建 readme`、`更新 readme`、`生成 README.md`、`create readme`、`update readme`。
version: 0.1.0
author: yolanda
---

# CODE README

为项目根目录创建或更新 `README.md`。

## User Input Tools

When this skill prompts the user, follow this tool-selection rule (priority order):

1. **Prefer built-in user-input tools** exposed by the current agent runtime — e.g., `AskUserQuestion`, `request_user_input`, `clarify`, `ask_user`, or any equivalent.
2. **Fallback**: if no such tool exists, emit a numbered plain-text message and ask the user to reply with the chosen number/answer for each question.
3. **Batching**: if the tool supports multiple questions per call, combine all applicable questions into a single call; if only single-question, ask them one at a time in priority order.

Concrete tool names above are examples — substitute the local equivalent in other runtimes.

## Output Template

模板定义在 [references/template.md](references/template.md)，严格按其结构生成。

模板中的条件标记：
- `<!-- if-bilingual -->`：项目有中英双语 README 时保留语言切换行，否则删除
- `<!-- screenshot: xxx -->`：截图占位，生成时按截图规则处理

## Execution Flow

1. 快速扫描项目结构、配置、脚本、源码、已有 README、文档和路线图。
2. 判断自己是否已理解项目定位、模块规划和核心功能，无法确认时先向用户提问。
3. 扫描项目中已有的截图资源（`assets/`、`screenshots/`、`.github/`、根目录图片文件）。
4. 按 [references/template.md](references/template.md) 结构生成或更新 `README.md`。
5. 生成后明确告知用户需要补充的截图（如有）。

## Content Rules

- 基于仓库事实和已确认信息写内容，不要臆造。
- README 必须同时反映：
  - 当前真相：代码、配置、文档中已能确认的内容
  - 已确认规划：用户明确说明或文档明确记录的后续方向
- 信息不足时先提问；仍无法确认时写"待补充"或"暂无"。
- 除非用户明确要求，否则不要写成营销文案或超长说明，不要新增额外说明文件。
- 双语时生成语言切换行，单语时不生成。
- 已存在 `README.md` 时保留有价值信息，整体改写为模板结构。

## 核心功能写法

- 功能分组按业务模块组织，不按技术栈堆砌。
- 每个子功能用 `###` 标题，紧跟 1~2 句话描述。
- 只保留高价值功能点。

## 快速开始写法

根据项目类型选择最合适的表达（npm 包安装、npx 运行、clone + 安装等），用户能在一分钟内理解如何使用即可。

## 开发指南写法

按项目实际需要的步骤生成子标题，没有对应命令的步骤不生成。

## 规划写法

- 已完成：`- [x] YYYY-MM-DD 功能描述`
- 规划中：`- [ ] 功能描述`
- 存在 TODO、规划文档、占位实现或模块空壳时，可写为规划项，但前提是规划可确认。

## 截图规则

1. 扫描项目图片文件，重点关注 `assets/`、`screenshots/`、`docs/screenshot/`、`.github/`、根目录图片。
2. 已有截图：直接引用，删除 `<!-- screenshot: xxx -->` 占位。
3. 无截图但有 UI/输出：保留占位，生成完成后告知用户需补充的截图位置。
4. 纯库/CLI 等无 UI 项目：不保留截图占位，不提示用户。
