# Changelog

All notable changes to this project will be documented in this file.

## 0.1.1 - 2026-04-30

### Features
- Add GitHub Release step to release-skills workflow

### Fixes
- Upgrade actions/checkout to v6 for native Node 24 support
- Opt-in CI actions to Node 24 to suppress deprecation warning
- Switch CI from npm to bun

### Refactor
- Use dynamic cover image discovery from cover_dir instead of hardcoded mapping (yo-learn-wiki)
- Add 11 new cover images and compress existing assets (yo-learn-wiki)

## 0.1.0 - 2026-04-30

### Features
- Add yo-utils-url skill for URL content collection
- Add yo-learn-wiki skill for knowledge base learning
- Add project-specific release-skills workflow under .claude/skills/

### Fixes
- Rename skills with yo- prefix and add CLAUDE.md

### Refactor
- Design skill creation flow referencing baoyu-skills
- Improve yo-utils-url first-time setup with auto-detection
