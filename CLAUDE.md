# CLAUDE.md

本仓库开发约定。仓库介绍与使用说明见 `README.md`。

## 项目结构

```
(repo)
├── skills/             # 所有 skill（目录存在即生效，无需注册）
├── 知识库模板/          # 知识库/笔记模板（供他人 clone 初始化 vault）
├── examples/           # 示例脚本（演示 agent 外部命令协议，非正式工具）
└── .env.example        # 环境变量清单模板（实际配置在 $YO_CONFIG_HOME/config.env，不入仓库）
```

环境变量规范：机器配置（路径/密钥）进 `$YO_CONFIG_HOME/config.env`，skill 运行时的个人内容进用户 vault；新增变量同步 `.env.example` 与对应 `first-time-setup.md`。机制细节（默认值、生效方式）见 `README.md`。

## skill 创建规范

```
skills/yo-<name>/
├── SKILL.md          # 必需，agent 入口（< 300 行，超出拆分模块至 references/）
├── README.md         # 必需，面向人（功能 / 安装 / 首次使用）
├── scripts/          # 可选，与该 skill 绑定的脚本
└── references/       # 可选，例如示例，模板，初始化引导文件等
    └── first-time-setup.md   # 需用户配置时加
```

frontmatter 字段：

```yaml
name: yo-<name>                   # 必须以 yo- 开头
description: <第三人称，做什么 + 何时使用>
version: 0.1.0
author: yolanda
```

- **最佳实践**：创建skill 前，先阅读 [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- **Skill 命名**：`yo-` 前缀 + 功能关键词，考虑 agent 更容易识别理解的名称，而非抽象的的命名
- **description**：第三人称，写清「做什么 + 何时使用」，含触发词提升 skill 命中
- **版本**：按变更 bump——patch（小修复）/ minor（常规，默认）/ major（重构或破坏性）；
- **环境变量**：需要时新增，同步 `.env.example` 与对应 `first-time-setup.md`
- **工作流**：线性任务用步骤 checklist；多模式用意图路由；详情进 `references/`
- **自包含**：SKILL.md 及 references/ 不链接目录外文件；跨 skill 调用用名字（「调用 yo-wiki-atom」）；路径用环境变量 + 相对路径，不写绝对路径
- **User Input Tools（可选）**：需与用户交互确认的 skill 才在顶部内联此 section，引导用选择题工具（优先 runtime 内置 → 回退编号纯文本 → 多问题合并）

## 发布规范

- **敏感信息**：检查个人路径（`/Users/xxx` 等）、邮箱、API key、token 泄露
- **git commit message**：采用标准的 prefix(module): description 格式，模块名用 skill 名（如 `feat(yo-wiki-atom): ...`）；
- **同步检查**：`README.md` / 受影响 skill 的 `version` 是否已更新
