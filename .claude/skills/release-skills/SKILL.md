---
name: release-skills
description: Yolanda Skills 项目的发布工作流。分析变更、生成双语 changelog、更新版本、创建 git tag 和 GitHub Release。当用户说"release"、"发布"、"新版本"、"bump version"、"更新版本"时触发。
---

# Release Skills

项目专属发布流程，服务于 yolanda-skills 仓库。

## User Input Tools

When this skill prompts the user, follow this tool-selection rule (priority order):

1. **Prefer built-in user-input tools** exposed by the current agent runtime — e.g., `AskUserQuestion`, `request_user_input`, `clarify`, `ask_user`, `questionnaire`, or any equivalent.
2. **Fallback**: if no such tool exists, emit a numbered plain-text message and ask the user to reply with the chosen number/answer for each question.
3. **Batching**: if the tool supports multiple questions per call, combine all applicable questions into a single call; if only single-question, ask them one at a time in priority order.

Concrete tool names above are examples — substitute the local equivalent in other runtimes.

## Options

| Flag | Description |
|------|-------------|
| `--dry-run` | Preview changes without executing |
| `--major` | Force major version bump |
| `--minor` | Force minor version bump |
| `--patch` | Force patch version bump |

## Version & Changelog Locations

| Item | File | Path/Field |
|------|------|------------|
| Skill 版本 | `skills/<name>/SKILL.md` | frontmatter `version` |
| 项目版本 | `package.json` | `"version"` |
| 项目版本 | `.claude-plugin/marketplace.json` | `$.metadata.version` |
| Changelog (en) | `CHANGELOG.md` | — |
| Changelog (zh) | `CHANGELOG.zh.md` | — |

## Workflow

### Step 1: Detect Current State

```bash
# Current version
cat .claude-plugin/marketplace.json

# Last tag
LAST_TAG=$(git tag --sort=-v:refname | head -1)

# If no tag, use initial commit
if [ -z "$LAST_TAG" ]; then
  LAST_TAG=$(git rev-list --max-parents=0 HEAD)
fi

# Commits since last tag
git log ${LAST_TAG}..HEAD --oneline
git diff ${LAST_TAG}..HEAD --stat
```

If no changelog files exist, create them with header:

```markdown
# Changelog

All notable changes to this project will be documented in this file.
```

### Step 2: Categorize Changes

Classify commits by conventional commit type:

| Type | Description | Changelog Section (en/zh) |
|------|-------------|---------------------------|
| `feat` | New features | Features / 新功能 |
| `fix` | Bug fixes | Fixes / 修复 |
| `docs` | Documentation | Documentation / 文档 |
| `refactor` | Code refactoring | Refactor / 重构 |
| `perf` | Performance | Performance / 性能优化 |
| `style` | Formatting | (skip in changelog) |
| `test` | Tests | (skip in changelog) |
| `chore` | Maintenance | (skip in changelog) |

**Breaking change detection**:
- Commit message starts with `BREAKING CHANGE`
- Commit body contains `BREAKING CHANGE:`
- Removed public APIs, renamed exports, changed interfaces

If breaking changes detected, warn: "Breaking changes detected. Consider major version bump (--major)."

### Step 3: Determine Version Bump

Rules (priority order):
1. User flag `--major/--minor/--patch` → Use specified
2. Framework changes detected (CLAUDE.md, docs/, .claude/skills/) → Major bump
3. New skill directory added under `skills/` → Minor bump
4. Otherwise (existing skill modified) → Patch bump

Take the **highest level** across all changes since last tag.

Display: `0.3.0 → 0.3.1`

### Step 4: Group Changes by Skill

Analyze commits and group by affected skill:

1. Map changed files to skills:
   - `skills/<skill-name>/*` → That skill
   - `CLAUDE.md`, `docs/`, `.claude/skills/`, root files → "project"
   - Multiple skills in one commit → Split
2. For each group, determine if README needs updating
3. **Identify SKILL.md version bumps**: for each skill with changes, its SKILL.md frontmatter `version` gets a patch bump

**Example**:
```
yo-utils-url:
  - refactor: improve first-time setup with auto-detection
  → SKILL.md: 0.1.0 → 0.1.1

yo-learn-wiki:
  - feat: add knowledge base learning skill
  → SKILL.md: 0.1.1 → 0.1.2

project:
  - docs: update user-input-tools with questionnaire
  → (framework change → major bump candidate)
```

### Step 5: Generate Changelogs

For each language (en → `CHANGELOG.md`, zh → `CHANGELOG.zh.md`):

1. Write section titles in target language
2. Write descriptions naturally (not translated — use the language natively)
3. Insert at file head (after the header), preserve existing content

**Format**:
```markdown
## {VERSION} - {YYYY-MM-DD}

### Features
- Description of new feature

### Fixes
- Description of fix
```

Only include sections with changes. Omit empty sections.

### Step 6: Update Versions

Three version sources to update:

**6a. SKILL.md frontmatter (changed skills only)**

For each skill that had changes since last tag:
- Read `skills/<name>/SKILL.md` frontmatter
- Bump `version` by one patch level (e.g., `0.1.0` → `0.1.1`)
- Write back, preserve formatting

**6b. package.json + marketplace.json (unified project version)**

```bash
# Bump package.json using npm (no auto commit/tag)
npm version <patch|minor|major> --no-git-tag-version
```

Then update `.claude-plugin/marketplace.json` `metadata.version` to match package.json.

**6c. Sync check**

Verify package.json and marketplace.json have identical version numbers before proceeding.

### Step 7: Update README

Check `README.md` and `README.zh.md` (if exists):
- Skill list matches current skills in `skills/` directory
- Last updated date set to today
- Any new/deprecated skills reflected

### Step 8: User Confirmation

Before creating release commit, ask user to confirm with three questions:

1. **Version bump** (single select):
   - Show recommended version
   - Options: recommended, patch, minor, major

2. **Push to remote** (single select):
   - Options: "Yes, push after commit", "No, keep local only"

3. **Create GitHub Release** (single select):
   - Options: "Yes, create GitHub Release with changelog", "No, tag only"

**Preview output**:
```
Changes grouped by skill:
  yo-utils-url:
    - refactor: improve first-time setup
  yo-learn-wiki:
    - feat: add knowledge base learning

Changelog preview (en):
  ## 0.1.0 - 2026-04-30
  ### Features
  - Add knowledge base learning skill
  ### Refactor
  - Improve yo-utils-url first-time setup with auto-detection

Ready to create release commit and tag.
```

### Step 9: Create Release Commit and Tag

After user confirmation:

```bash
# Stage all release files
git add package.json .claude-plugin/marketplace.json
git add CHANGELOG.md CHANGELOG.zh.md
git add README.md README.zh.md 2>/dev/null
git add skills/*/SKILL.md

# Create release commit
git commit -m "chore: release v{VERSION}"

# Create annotated tag
git tag -a v{VERSION} -m "v{VERSION}"
```

If user confirmed push:
```bash
git push --follow-tags
```

**Note**: Do NOT add Co-Authored-By line. This is a release commit, not a code contribution.

**Post-release output**:
```
Release v0.3.1 created.

Files changed:
  - package.json (0.3.0 → 0.3.1)
  - .claude-plugin/marketplace.json (0.3.0 → 0.3.1)
  - skills/yo-code-readme/SKILL.md (0.1.0 → 0.1.1)
  - skills/yo-utils-url/SKILL.md (0.1.0 → 0.1.1)
  - CHANGELOG.md
  - CHANGELOG.zh.md
  - README.md

Tag: v0.3.1
Status: Pushed to origin
```

### Step 10: Create GitHub Release

If user confirmed in Step 8:

1. Extract the changelog section for this version from `CHANGELOG.md`
2. Write it to a temporary file
3. Create the GitHub Release:

```bash
# Extract version section from CHANGELOG.md to temp file
# (from "## {VERSION}" to the next "## " or EOF)
gh release create v{VERSION} --title "v{VERSION}" --notes-file {temp_file}
```

4. Clean up temp file

**Note**: If the user chose not to push in Step 8 but wants a GitHub Release, warn that the tag must be pushed first before creating the release. Offer to push the tag only.

**Final output**:
```
Release v0.1.0 created.

Tag: v0.1.0
Push: ✓ origin
GitHub Release: ✓ https://github.com/.../releases/tag/v0.1.0
```

## Example Usage

```
/release-skills              # Auto-detect version bump
/release-skills --dry-run    # Preview only
/release-skills --minor      # Force minor bump
/release-skills --patch      # Force patch bump
/release-skills --major      # Force major bump
```

## When to Use

Trigger when user says:
- "release", "发布", "create release", "new version", "新版本"
- "bump version", "update version", "更新版本"
- "prepare release"
- "push to remote" (with uncommitted changes)

**Important**: If user says "just push" or "直接 push" with uncommitted changes, STILL follow all steps first.
