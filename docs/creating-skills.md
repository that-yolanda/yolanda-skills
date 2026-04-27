# Creating New Skills

**REQUIRED READING**: [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

## Key Requirements

| Requirement | Details |
|-------------|---------|
| **Prefix** | All skills MUST use `yo-<module>-<function>` format |
| **name field** | Max 64 chars, lowercase letters/numbers/hyphens only, no "anthropic"/"claude" |
| **description** | Max 1024 chars, third person, include what + when to use |
| **SKILL.md body** | Keep under 500 lines; use `references/` for additional content |
| **References** | One level deep from SKILL.md; avoid nested references |


## SKILL.md Frontmatter Template

```yaml
---
name: yo-<module>-<function>
description: <Third-person description. What it does + when to use it.>
version: <semver>
author: yolanda
---
```

## Steps

1. Create `skills/yo-<module>-<function>/SKILL.md` with YAML front matter
2. Add TypeScript in `skills/yo-<module>-<function>/scripts/` (if applicable)
3. Add prompt templates in `skills/yo-<module>-<function>/prompts/` if needed
4. Register the skill in `.claude-plugin/marketplace.json` under the `yolanda-skills` plugin entry
5. Add Script Directory section to SKILL.md if skill has scripts
6. Add additional metadata to frontmatter if necessary

## Skill Grouping

All skills are registered under the single `yolanda-skills` plugin. Use these logical groups when deciding where the skill should appear in the docs:

| If your skill... | Use group | Prefix |
|------------------|-----------|--------|
| Coding related like README generation, code review, refactoring, etc. | Code Skills | `yo-code-*` |
| Learning and accumulation | Learn Skills | `yo-learn-*` |
| Converts or processes content | Utility Skills | `yo-utils-*` |

If you add a new logical group, update the docs that present grouped skills, but keep the skill registered under the single `yolanda-skills` plugin entry.


## Writing Descriptions

**MUST write in third person**:

```yaml
# Good
description: Generates Xiaohongshu infographic series from content. Use when user asks for "小红书图片", "XHS images".

# Bad
description: I can help you create Xiaohongshu images
```

## Script Directory Template

Every SKILL.md with scripts MUST include:

```markdown
## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `{baseDir}`
2. Script path = `{baseDir}/scripts/<script-name>.ts`
3. Resolve `${BUN_X}` runtime: if `bun` installed → `bun`; if `npx` available → `npx -y bun`; else suggest installing bun
4. Replace all `{baseDir}` and `${BUN_X}` in this document with actual values

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | Main entry point |
```

## Progressive Disclosure

For skills with extensive content:

```
skills/baoyu-example/
├── SKILL.md                # Main instructions (<500 lines)
├── EXTEND.md               # Loaded as needed
├── references/
│   ├── first-time-setup.md # Loaded as needed
│   ├── styles.md           # Loaded as needed
│   └── examples.md         # Loaded as needed
└── scripts/
    └── main.ts
```

Link from SKILL.md (one level deep only):

```markdown
**Available styles**: See [references/styles.md](references/styles.md)
```

## Extension Support (EXTEND.md)
EXTEND.md is a markdown file using frontmatter to define custom configurations for each skill.

Every SKILL.md MUST include EXTEND.md loading. Add as Step 0 (workflow skills) or "Preferences" section (simple skills without workflow):

```markdown
## Workflow
\`\`\`
- [ ] Step 0: Load preferences (EXTEND.md) ⛔ BLOCKING
- [ ] Step 1: ...
\`\`\`

### Step 0: Load preferences (EXTEND.md) ⛔ BLOCKING

Check EXTEND.md existence (priority order):

\`\`\`bash
test -f .claude/skills/<skill-name>/EXTEND.md -o -f .agent/skills/<skill-name>/EXTEND.md && echo "project"
test -f "${XDG_CONFIG_HOME:-$HOME/.config}/yolanda-skills/<skill-name>/EXTEND.md" && echo "xdg"
\`\`\`

| Path | Location |
|------|----------|
| `.claude/skills/<skill-name>/EXTEND.md` | Project directory |
| `.agent/skills/<skill-name>/EXTEND.md` | Project directory |
| `$XDG_CONFIG_HOME/yolanda-skills/<skill-name>/EXTEND.md` | XDG config (~/.config) |

| Result | Action |
|--------|--------|
| Found | Read, parse, display summary |
| Not found | Ask user via the runtime's user-input tool (see [user-input-tools.md](user-input-tools.md)) |
```

End of SKILL.md should include:

```markdown
## Extension Support
Custom configurations via EXTEND.md. See **Step 0** for paths and supported options.
```

SKILLS can create `references/first-time-setup.md` to guide users create EXTEND.md with user-input-tools if necessary.

## User Input Tools Section (Required)

Every SKILL.md that prompts the user for choices MUST include exactly one `## User Input Tools` section near the top (right after the intro, before the main workflow). The rule must be **inlined** — do NOT link to `docs/user-input-tools.md` (skills are self-contained; see [CLAUDE.md → Skill Self-Containment](../CLAUDE.md)). The author-side canonical reference lives at [user-input-tools.md](user-input-tools.md); copy its body into each new SKILL.md.

Standard snippet (copy verbatim):

```markdown
## User Input Tools

When this skill prompts the user, follow this tool-selection rule (priority order):

1. **Prefer built-in user-input tools** exposed by the current agent runtime — e.g., `AskUserQuestion`, `request_user_input`, `clarify`, `ask_user`, or any equivalent.
2. **Fallback**: if no such tool exists, emit a numbered plain-text message and ask the user to reply with the chosen number/answer for each question.
3. **Batching**: if the tool supports multiple questions per call, combine all applicable questions into a single call; if only single-question, ask them one at a time in priority order.

Concrete `AskUserQuestion` references below are examples — substitute the local equivalent in other runtimes.
```