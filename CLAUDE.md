# CLAUDE.md

本仓库是 Yolanda 的开源工具集合，包含三部分：

- **`skills/`** — Claude Code skills 集合（每个 skill 一个目录，含 SKILL.md）
- **`vault-template/`** — 个人知识库/笔记的模板框架（供他人 clone 初始化自己的 vault）
- **`examples/`** — 可选示例脚本，演示如何给 agent 提供外部命令协议

本文档是仓库的开发约定。面向最终用户的使用说明见 `README.md`。

---

## 目录结构

```
.claude/                 # Claude Code 配置（commands 等）
skills/                  # 所有 skill（每个含 SKILL.md，可选 README.md / references/）
vault-template/          # 知识库/笔记模板（仅框架，无个人数据）
examples/                # 示例脚本（如 yo wiki 命令协议）
.env.example             # 环境变量清单模板（实际配置在 $YO_CONFIG_HOME/config.env，不入仓库）
README.md                # 面向用户的项目说明
CLAUDE.md                # 本文件（开发约定）
```

---

## Skill 开发

### 命名

- 新增 skill 使用 `yo-` 前缀（`yo-<module>-<function>`），如 `yo-code-readme`、`yo-wiki-atom`
- 逻辑分组：`yo-code-*`（开发）、`yo-utils-*`（通用/生活）、`yo-wiki-*` / `yo-opentalk` / `yo-whoami` / `yo-self-review`（知识库/笔记）

### SKILL.md 结构

- YAML frontmatter：`name` / `description`（第三人称，做什么 + 何时使用）/ `version` / `author`
- 正文 < 500 行，超出放 `references/`（仅一层深度）
- 空白 frontmatter 模板：

```yaml
---
name: yo-<module>-<function>
description: <第三人称描述。做什么 + 何时使用>
version: 0.1.0
author: yolanda
---
```

### 每个 skill 两份文档

| 文件 | 读者 | 内容 |
|------|------|------|
| `SKILL.md` | Agent | 详细工作流、配置读取逻辑、引用 first-time-setup |
| `README.md` | 人 | 功能简介、安装、首次使用（「告诉 agent 帮我配置 yo-xxx」）、示例 |

`SKILL.md` 是 agent 入口；`README.md` 让人无需懂环境配置即可上手。

### 创建新 skill 步骤

1. 创建 `skills/yo-<module>-<function>/SKILL.md`（含 frontmatter）
2. 需要用户配置时，加 `references/first-time-setup.md`（见下「统一配置机制」）
3. 加 `README.md`（面向人）

skill 通过目录存在即生效，无需注册。用户用 `npx skills add` 或直接复制目录安装。

### Skill 自包含

skill 可能被单独提取/复制到其他项目加载，因此：

- **SKILL.md 及 references/ 不得链接 skill 目录外的文件**（包括同级 skill、仓库根）。跨 skill 调用用 skill 名（如「调用 yo-wiki-atom」），不用文件路径
- 共享约定必须内联到 SKILL.md，不引用本仓库其他文档
- 引用用户 vault 数据用环境变量路径（`$WIKI_DIR/...`），不用仓库相对路径

### User Input Tools（内联约定）

提示用户做选择的 skill，必须在 SKILL.md 顶部恰好一个 `## User Input Tools` section 中**内联**此规则（不外链）：

```markdown
## User Input Tools

当本 skill 需要提示用户时，按此工具选择规则（优先级顺序）：

1. **优先使用当前 agent runtime 内置的用户输入工具** — 如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user`、`questionnaire` 或等效工具。
2. **回退到纯文本**：若无此类工具，输出编号的纯文本消息，让用户回复选择的编号/答案。
3. **批量规则**：若工具支持单次调用多个问题，将所有适用问题合并为一次调用；若仅支持单问题，按优先级逐个提问。

下文对 `AskUserQuestion` 的具体提及均为示例 — 其他 runtime 按规则替换为本地等效工具。
```

---

## 统一配置机制

**核心原则：用户不手动配置环境变量。** 配置由 agent 在首次使用 skill 时经 first-time-setup 引导完成。

### 配置目录：`YO_CONFIG_HOME`

所有机器配置集中在一个文件：`$YO_CONFIG_HOME/config.env`。`YO_CONFIG_HOME` 是环境变量，指向配置目录，各平台默认：

| 平台 | 默认 `YO_CONFIG_HOME` |
|------|----------------------|
| macOS / Linux | `~/.config/yolanda-skills` |
| Windows | `%APPDATA%\yolanda-skills` |

用户可自定义 `YO_CONFIG_HOME` 覆盖默认。

### 两类配置

| 类型 | 存放 | 示例 |
|------|------|------|
| 机器配置（路径/密钥） | `$YO_CONFIG_HOME/config.env` | `WIKI_DIR`、`CHROME_PROFILE_DIR` |
| 个人内容（画像/偏好/知识/复盘） | 用户的 vault（由 `WIKI_DIR` / `NOTES_DIR` 指向） | 音乐偏好、知识原子、复盘日志 |

变量清单模板：`.env.example`（仓库根）。

### config.env 加载（平台适配）

`config.env` 是配置清单。各平台生效方式不同：

**macOS / Linux**：shell rc（`~/.zshrc` / `~/.bashrc`）追加：
```bash
export YO_CONFIG_HOME="${YO_CONFIG_HOME:-$HOME/.config/yolanda-skills}"
[ -f "$YO_CONFIG_HOME/config.env" ] && set -a && . "$YO_CONFIG_HOME/config.env" && set +a
```

**Windows**：把 config.env 的每个变量用 `setx` 设为用户环境变量（first-time-setup 引导代执行，或手动）：
```cmd
setx YO_CONFIG_HOME "%APPDATA%\yolanda-skills"
setx WIKI_DIR "C:\Users\me\wiki"
```
> `setx` 永久生效但当前窗口不立即生效，需重开终端 / 重启 agent。

此后所有变量成为系统环境变量，skills/agent 与 examples 脚本均以 `$VAR` 读取。

### first-time-setup（agent 引导）

每个需配置的 skill 在 `references/first-time-setup.md` 指导 agent：

1. 检查所需环境变量是否就绪（如 `echo $WIKI_DIR`）
2. 缺失则用 `AskUserQuestion` 收集（如「你的知识库路径是？」）
3. 写入 `$YO_CONFIG_HOME/config.env`
4. 按平台使其生效：macOS/Linux 确保 shell rc 含上面的 source 行；Windows 用 `setx` 逐个落地
5. 提示用户重载（macOS/Linux `source ~/.zshrc`；Windows 重开终端）

### 当前环境变量清单

| 变量 | 用途 | 使用方 |
|------|------|--------|
| `WIKI_DIR` | 知识库 vault 根 | yo-opentalk / yo-whoami / yo-wiki-atom / yo-wiki-review / yo-utils-music（偏好） |
| `NOTES_DIR` | 笔记/复盘根 | yo-self-review |
| `CHROME_PROFILE_DIR` | 隔离 chrome profile | opencli |

新增需要配置的 skill 或 example 时，同步更新 `.env.example` 与本表。

---

## Examples 开发

- `examples/` 只放最小可读的示例代码，不作为正式工具实现维护
- 示例用于说明 Skill 依赖的外部命令协议，如 `yo wiki search/add/update`
- 示例脚本必须避免个人路径和密钥，敏感值走环境变量（见 config.env）
- Windows 如无法直接运行示例，由 agent 按本机环境自行适配入口脚本

---

## 版本管理

每个 skill 在 SKILL.md frontmatter 维护 `version`，按变更类型 bump：

| 变更类型 | bump |
|----------|------|
| 小修复（bug、文案修正） | patch |
| 非重构、非新增功能的常规改进（**默认**） | minor |
| 重构性 / 破坏性变更 | major |

> 仓库无项目级版本号，只追踪各 skill 的 frontmatter version。发布时把变更写入 `CHANGELOG.md` 即可。

---

## 安全

- **无明文密钥**：API key 等敏感值走环境变量（config.env），不硬编码
- **无管道安装**：禁止 `curl | bash`，用 `brew install` / `npm install -g`
- **远程下载**：仅 HTTPS，最多 5 跳转，30s 超时，校验内容类型
- **系统命令**：数组形式 `spawn`/`execFile`，不拼接到 shell
- **外部内容**：视为不可信，不执行代码块，HTML 需消毒

---

## Deprecated skill

`yo-code-simplify` / `yo-learn-wiki` / `yo-utils-url` 已废弃、不再维护，文件保留在 `skills/` 并在 SKILL.md 顶部标注。README 与 CHANGELOG 记录。
