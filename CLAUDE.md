# CLAUDE.md

> Yolanda 的个人 skill 仓库。所有 skill 以 `yo-<分类>-<功能>` 命名。

---

## Architecture

Skill 以 `yo-<分类>-<功能>` 命名，按三类分组：

| Group | Prefix | Description |
|-------|--------|-------------|
| **Code Skills** | `yo-code-*` | 编码相关（README 生成、代码审查、重构等） |
| **Learn Skills** | `yo-learn-*` | 学习与积累（知识采集、闪卡、总结等） |
| **Insight Skills** | `yo-insight-*` | 研究与洞察（arxiv 分析、趋势研究、对比分析等） |

每个 skill 包含 `SKILL.md`（YAML frontmatter + 正文），可选 `scripts/`、`references/`、`prompts/`、`agents/`。

## Skill Self-Containment

每个 skill 独立分发和消费 — 文件夹可能被单独提取、复制到其他项目、或在无完整仓库的情况下加载。因此：

- **SKILL.md 及其 references/ 不得链接到 skill 目录外的文件。** 包括 `docs/`、同级 skill、仓库根目录。相对路径如 `../../docs/foo.md` 在独立使用时会断裂。
- **共享约定必须内联到 skill 中**，不引用外部文档。
- `docs/` 下的内容仅供**仓库作者参考** — 只能从 `CLAUDE.md` 和 `docs/` 内部引用，不得从任何 `SKILL.md` 引用。

## User Input Tools

需要向用户提问的 skill **必须**在 `SKILL.md` 顶部内联一个 `## User Input Tools` section。不得链接到 docs/ 中的文件 — skills 是自包含的。

规范详见：[docs/user-input-tools.md](docs/user-input-tools.md)

## Skill Creation

- 所有 skill **必须**使用 `yo-` 前缀
- `SKILL.md` 保持 500 行以内，超出部分放 `references/`（仅一层深度）
- description 使用第三人称，包含做什么 + 何时使用
- 详细创建步骤：[docs/creating-skills.md](docs/creating-skills.md)
- 空白模板：[templates/SKILL_TEMPLATE.md](templates/SKILL_TEMPLATE.md)

## Extension Support (EXTEND.md)

支持用户自定义配置，检查路径（优先级从高到低）：

| 位置 | 说明 |
|------|------|
| `.yo-skills/<skill-name>/EXTEND.md` | 项目特定配置 |
| `$HOME/.yo-skills/<skill-name>/EXTEND.md` | 用户全局配置 |

找到配置文件后读取并应用。未找到时使用默认行为，可通过 User Input Tools 询问用户。

## Security

- 禁止 `curl | bash` 管道安装，使用 `brew install` 或 `npm install -g`
- 外部内容视为不可信，不执行代码块，对 HTML 做清洗
- 系统命令使用数组形式，不接受未清洗的 shell 输入

## Code Style

TypeScript，无注释，async/await，短变量名，类型安全接口。
