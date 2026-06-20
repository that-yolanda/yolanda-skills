# Changelog

本文件记录本仓库所有 notable 变更。

## 1.0.0 - 2026-06-19

本次为重大重构：仓库从「仅 skills plugin」升级为「skills + 知识库模板」开源仓库，并完成开源化适配（去 bun、去 EXTEND.md、清理敏感信息）。

### 新功能
- 新增 `vault-template/`：知识库/笔记模板框架（原子库 → 知识库 + 我的画像 + 资料库），仅含框架与使用说明，无个人数据
- 新增 `examples/yo.mjs`：提供 `yo wiki` 命令协议示例，用于 agent 读写原子库
- 新增知识库 skill：yo-opentalk / yo-whoami / yo-wiki-atom / yo-wiki-review（从本地知识库迁移，统一以 `$WIKI_DIR` 引用）
- 新增 yo-self-review：每日/每周复盘 skill（从本地笔记迁移，以 `$NOTES_DIR` 引用）
- 引入统一配置机制：`$YO_CONFIG_HOME/config.env` + first-time-setup 引导（agent 帮用户配置，替代 EXTEND.md；跨平台，Windows 用 `setx`）
- 每个 skill 提供「两份文档」：SKILL.md（给 agent）+ README.md（给人）

### 变更
- 仓库不再作为 Claude Code plugin：移除 `.claude-plugin/` 与 `release-skills`，skill 通过 `npx skills add` 或复制目录安装
- 去除 bun / package.json / tsconfig 依赖，skills 不再需要 TypeScript 运行时
- 去除 EXTEND.md 配置机制，改用统一 config.env + 环境变量
- CLAUDE.md 重写：内联创建流程与用户输入工具约定，新增统一配置机制、Examples 约定、两份文档约定与版本规则（patch / minor / major）
- yo-utils-music：音乐偏好改存入 vault 的「我的画像/我的偏好」
- opencli：新增 first-time-setup（cdp alias / chrome profile 引导）
- Chrome profile 环境变量改名：`YOLANDA_CHROME_PROFILE_DIR` → `CHROME_PROFILE_DIR`

### 废弃
- yo-code-simplify / yo-learn-wiki / yo-utils-url 标记 deprecated（文件保留，不再维护）

---

## 历史版本（1.0.0 之前）

- **0.3.0**（2026-05-13）：新增 yo-utils-music；重设计 yo-code-readme 模板
- **0.2.0**（2026-05-08）：yo-utils-url 增加 Chrome profile 隔离与跨平台路径
- **0.1.1**（2026-04-30）：release-skills 增加 GitHub Release；CI 切换 bun
- **0.1.0**（2026-04-30）：初始版本，新增 yo-utils-url / yo-learn-wiki / release-skills
