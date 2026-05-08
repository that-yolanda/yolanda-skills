# Changelog

All notable changes to this project will be documented in this file.

## 0.2.0 - 2026-05-08

### Features
- Add configurable Chrome profile support via EXTEND.md chrome_profile field (yo-utils-url 0.1.0)
- Add environment check steps to first-time setup: opencli install, Chrome Bridge verification (yo-utils-url)
- Add Chrome profile isolation choice (Q5) to setup flow (yo-utils-url)

### Fixes
- Replace unreliable curl-based CDP port check with opencli daemon status polling (yo-utils-url)
- Clean stale SingletonLock/Socket/Cookie files before launching Chrome (yo-utils-url)
- Add Windows and Linux Chrome binary paths to findChrome() (yo-utils-url)

### Documentation
- Rewrite README with per-skill prerequisites, install steps, and usage examples
- Replace obsidian-cli with filesystem checks in yo-utils-url first-time setup
- Add CLI hint for auto-launching Obsidian in yo-learn-wiki (0.1.1)

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
