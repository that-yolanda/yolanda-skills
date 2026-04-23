# Yolanda Skills

> Agent skills 仓库。所有 skill 以 `yo-<分类>-<功能>` 命名，由 Hermes / Claude Code / Codex 创建和使用。

## Architecture

### 命名

格式：`yo-<分类>-<功能>`

| 分类 | 用途 | 示例 |
|------|------|------|
| `code` | 编码 | `yo-code-readme`, `yo-code-simplify` |
| `learn` | 学习与积累 | `yo-learn-wikiclip`, `yo-learn-summarize` |
| `insight` | 研究与洞察 | `yo-insight-arxiv`, `yo-insight-compare` |

### Skill 目录结构

```
yo-<分类>-<功能>/
├── SKILL.md              # 主文件（<500 行）
├── references/           # 可选，参考文档（仅一层深度）
├── scripts/              # 可选，TypeScript 脚本
├── agents/               # 可选，Codex 配置
└── prompts/              # 可选，提示词模板
```

### 仓库目录

```
05-yolanda-skills/
├── AGENTS.md              # Agent 创建规范（Hermes / Codex 读这个）
├── CLAUDE.md              # Claude Code 创建规范
├── README.md              # 仓库说明（给人看）
├── templates/
│   └── SKILL_TEMPLATE.md  # 空白模板
└── skills/
    ├── yo-code-readme/
    └── yo-code-simplify/
```

## 快速开始

### 创建新 Skill

1. 阅读 [AGENTS.md](AGENTS.md) 或 [CLAUDE.md](CLAUDE.md)（取决于当前 agent）
2. 从 [templates/SKILL_TEMPLATE.md](templates/SKILL_TEMPLATE.md) 复制模板
3. 按规范填写

### 安装

```bash
npx skills install github:that-yolanda/yolanda-skills
```

## Skill 列表

### Code Skills
- **yo-code-readme**: 创建或更新项目 README.md
- **yo-code-simplify**: 代码可读性与复杂度审核

### Learn Skills
*(暂无)*

### Insight Skills
*(暂无)*

---

**最后更新**: 2026-04-20
**维护者**: Yolanda