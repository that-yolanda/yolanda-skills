# First-time Setup — 创建 EXTEND.md

首次使用 yo-utils-url 时，如果未找到 EXTEND.md，按以下流程引导用户创建。完成后 EXTEND.md 写入 SKILL.md 同级目录。

## 自动探测

先收集信息，减少用户输入：

```bash
# 1. 当前工作目录是否在某个 vault 内
obsidian-cli vault info=name 2>/dev/null

# 2. vault 一级目录列表
obsidian-cli folders 2>/dev/null || ls -1 "$(git rev-parse --show-toplevel 2>/dev/null || echo .)"
```

根据探测结果，识别名称含以下关键词的目录：
- **文章类**：文章、收集、存档、归档、archive、articles
- **资源类**：附件、资源、assets、attachments、media

## 引导流程

基于探测结果，用 AskUserQuestion 一次性询问：

### Q1：Markdown 存放目录 (markdown.dir)

> 采集的 markdown 文件存放到哪个目录？

告知用户可用占位符：
- `{platform}` — 自动替换为来源平台（weixin / zhihu / web 等）
- `{article_name}` — 自动替换为文章标题（截断至 32 字符）

选项从探测结果中动态生成（优先匹配文章类目录），拼接 `/{platform}`：
- 若探测到 `03-文章` → 推荐 `03-文章/{platform}`
- 若探测到 `收集/网页` → 推荐 `收集/网页/{platform}`
- 无匹配 → 兜底 `文章/{platform}`

用户也可输入自定义路径。推荐选项标记为 (Recommended)。

### Q2：资源下载类型 (assets.download)

> 是否保留下载的图片/视频等附件？

多选：
- 图片 (image)
- 视频 (video)
- 所有附件
- 不保留任何资源

### Q3：资源引用格式 (markdown.link)

> Markdown 中资源引用使用哪种格式？

选项：
- `![[文件名.png]]` — Obsidian 短链接 (Recommended)
- `![文件名](相对路径/文件名.png)` — 标准相对路径

### Q4：资源存放目录 (assets.dir)

仅当 Q2 选择了保留资源时显示。

> 资源文件存放到哪个目录？

告知用户可用占位符：
- `{type}` — 自动替换为资源类型（image / video）
- `{article_name}` — 自动替换为文章标题

选项从探测结果中动态生成（优先匹配资源类目录）：
- 若探测到 `附件` → 推荐 `附件/{type}/{article_name}` 和 `附件/{article_name}`
- 若探测到 `05-资源` → 推荐 `05-资源/{type}/{article_name}`
- 无匹配 → 兜底 `附件/{type}/{article_name}`

用户也可输入自定义路径。

## 模板

根据用户选择生成 EXTEND.md：

```yaml
---
tmp_dir: .tmp
markdown:
  dir: "文章/{platform}"
  link: short
assets:
  download:
    - image
    - video
  dir: "附件/{type}/{article_name}"
---
```

写入 `{baseDir}/EXTEND.md`。
