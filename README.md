<div align="center">
<h1>Yolanda Skills</h1>
<p>个人日常使用的 Skills + Tools + 知识库模板合集，支持 Claude Code 等 Agent runtime。</p>
</div>

本仓库包含三部分：

- **`skills/`** — Claude Code skills 集合，覆盖代码、知识库、笔记、生活场景
- **`tools/`** — 自定义命令行工具（视频转 GIF、知识库管理等），通过 `yo` 调度
- **`vault-template/`** — 个人知识库/笔记的模板框架，clone 后初始化你自己的 vault

## 快速开始

### 1. 安装 Skills

用 vercel 的 skills CLI 安装单个 skill：

```bash
npx skills add github:that-yolanda/yolanda-skills --skill yo-opentalk
```

或直接 clone 仓库，把 `skills/<name>` 复制到你的 agent skills 路径（如 `~/.claude/skills/`）：

```bash
git clone https://github.com/that-yolanda/yolanda-skills
```

### 2. 安装 Tools

```bash
git clone https://github.com/that-yolanda/yolanda-skills
# 把 tools/ 加入 PATH（macOS/Linux）
echo "export PATH=\"$(pwd)/yolanda-skills/tools:\$PATH\"" >> ~/.zshrc
source ~/.zshrc
yo list   # 查看可用工具
```

### 3. 首次配置（无需手动）

每个需要环境配置的 skill，首次使用时直接对 agent 说：

> 帮我配置 yo-opentalk（或 yo-self-review、opencli 等）

agent 会询问必要信息（如知识库路径），写入 `$YO_CONFIG_HOME/config.env` 并使其生效——**你无需手动编辑任何环境变量**。详见 [配置机制](#配置机制)。

## 目录结构

```
skills/          Claude Code skills（SKILL.md 给 agent + README.md 给人）
tools/           命令行工具（yo <subcommand>）
vault-template/  知识库/笔记模板（仅框架，无个人数据）
.env.example     环境变量清单模板
```

## Skills

| Skill | 类型 | 说明 |
|-------|------|------|
| yo-opentalk | 知识库 | 日常对话入口，路由到原子录入 / 画像更新 / 开放讨论 |
| yo-wiki-atom | 知识库 | 从输入提取知识原子写入原子库 |
| yo-wiki-review | 知识库 | 定期提炼原子到专题知识库与画像 |
| yo-whoami | 知识库 | 个人画像（经历/状态/目标/偏好/疑问）读写 |
| yo-self-review | 笔记 | 每日/每周复盘，训练判断力 |
| yo-utils-music | 生活 | 基于偏好控制网易云音乐播放 |
| yo-code-readme | 开发 | 生成或更新项目 README |
| opencli | 通用 | 复用 Chrome 登录 profile 访问反爬/登录网站 |
| agent-browser | 通用 | 浏览器自动化 CLI（hidden，按需调用） |

**已废弃**（文件保留、不再维护）：`yo-code-simplify`、`yo-learn-wiki`、`yo-utils-url`。

## Tools

通过 `yo <subcommand>` 调用，把 `tools/` 加入 PATH 后全局可用。

| 工具 | 说明 | 依赖 / 平台 |
|------|------|------------|
| gif | 视频转 GIF | ffmpeg · 跨平台 |
| wiki | 原子知识库管理 | rg + jq · 跨平台 |
| word-count | 中英文字数统计 | perl · Windows 需装 Strawberry Perl |
| zed-to-ghostty | zed 发送路径到 ghostty | **仅 macOS** |

## vault-template

个人知识库/笔记的模板框架：原子库（原始信息）→ 知识库（提炼沉淀）+ 我的画像 + 资料库。clone 后初始化你自己的 vault：

```bash
cp -r vault-template ~/path/to/我的知识库
# 然后让 agent 配置 yo-opentalk，它会引导设置 WIKI_DIR 指向该目录
```

## 配置机制

所有环境配置统一在 `$YO_CONFIG_HOME/config.env`，由 agent 在首次使用 skill 时经 first-time-setup 引导写入并使其生效。`YO_CONFIG_HOME` 默认：macOS/Linux `~/.config/yolanda-skills`，Windows `%APPDATA%\yolanda-skills`。变量清单见 [`.env.example`](.env.example)。

个人数据（知识库、笔记、画像）放在你自己的 vault，由 `WIKI_DIR` / `NOTES_DIR` 指向，不入仓库。

## 协议

[MIT](LICENSE)
