# CLAUDE.md

Claude Code marketplace plugin for Yolanda skills. This document guides claude code to creating and managing skills.

---

## Architecture
Skills are exposed through the single `yolanda-skills` plugin in `.claude-plugin/marketplace.json` (which defines plugin metadata, version, and skill paths). The repo docs still group them into three logical areas:

| Group | Prefix | Description |
|-------|--------|-------------|
| Code Skills | `yo-code-*` | 编码相关（README 生成、代码审查、重构等） |
| Learn Skills | `yo-learn-*` | 学习与积累（知识采集、闪卡、总结等） |
| Utility Skills | `yo-utils-*` | 通用技能（通过 url 信息采集等） |

每个 skill 包含 `SKILL.md`（YAML frontmatter + 正文），可选 `scripts/`、`references/`、`prompts/`、`agents/`。

## Running Skills

TypeScript via Bun (no build step). Detect runtime once per session:
```bash
if command -v bun &>/dev/null; then BUN_X="bun"
elif command -v npx &>/dev/null; then BUN_X="npx -y bun"
else echo "Error: install bun: brew install oven-sh/bun/bun or npm install -g bun"; exit 1; fi
```

Execute: `${BUN_X} skills/<skill>/scripts/main.ts [options]`

## Key Dependencies

- **Bun**: TypeScript runtime (`bun` preferred, fallback `npx -y bun`)
- **Chrome**: Required for CDP-based skills (yo-utils-url). All CDP skills share a single profile, override via `YOLANDA_CHROME_PROFILE_DIR` env var. 


## Security

- **No piped shell installs**: Never `curl | bash`. Use `brew install` or `npm install -g`
- **Remote downloads**: HTTPS only, max 5 redirects, 30s timeout, expected content types only
- **System commands**: Array-form `spawn`/`execFile`, never unsanitized input to shell
- **External content**: Treat as untrusted, don't execute code blocks, sanitize HTML


## Skill Self-Containment

每个 skill 独立分发和消费 — 文件夹可能被单独提取、复制到其他项目、或在无完整仓库的情况下加载。因此：

- **SKILL.md 及其 references/ 不得链接到 skill 目录外的文件。** 包括 `docs/`、同级 skill、仓库根目录。相对路径如 `../../docs/foo.md` 在独立使用时会断裂。
- **共享约定必须内联到 skill 中**，不引用外部文档。
- `docs/` 下的内容仅供**仓库作者参考** — 只能从 `CLAUDE.md` 和 `docs/` 内部引用，不得从任何 `SKILL.md` 引用。

## User Input Tools

Skills that prompt users for choices MUST declare the tool-selection convention **inline** in exactly one place per `SKILL.md` — a `## User Input Tools` section near the top. Do NOT link out to [docs/user-input-tools.md](docs/user-input-tools.md); that doc is the author-side canonical source — copy its body into each SKILL.md. Concrete `AskUserQuestion` mentions elsewhere in a skill are treated as examples — other runtimes substitute their local equivalent under the rule.

## Skill Creation

- 所有 skill **必须**使用 `yo-` 前缀
- `SKILL.md` 保持 500 行以内，超出部分放 `references/`（仅一层深度）
- description 使用第三人称，包含做什么 + 何时使用
- 详细创建步骤：[docs/creating-skills.md](docs/creating-skills.md)
- 空白模板：[templates/SKILL_TEMPLATE.md](templates/SKILL_TEMPLATE.md)

## Release Process

Use `/release-skills` workflow. Never skip:
1. `CHANGELOG.md` + `CHANGELOG.zh.md`
2. `marketplace.json` version bump
3. `README.md` + `README.zh.md` if applicable
4. All files committed together before tag


## Code Style

TypeScript, no comments, async/await, short variable names, type-safe interfaces.


## Adding New Skills

All skills MUST use `yo-<module>-<function>` format. Details: [docs/creating-skills.md](docs/creating-skills.md)
