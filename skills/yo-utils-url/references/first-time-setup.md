# First-time Setup — 创建 EXTEND.md

首次使用 yo-utils-url 时，如果未找到 EXTEND.md，Claude 按以下流程引导用户创建。完成后 EXTEND.md 写入 SKILL.md 同级目录。

## 引导流程

使用 AskUserQuestion 一次性询问以下配置：

### 问题 1：Markdown 存放目录 (markdown.dir)

> 采集的 markdown 文件存放到哪个目录？

选项：
- `文章/{platform}` — 按平台分目录（推荐）
- `文章` — 不区分平台
- 自定义路径

### 问题 2：资源下载类型 (assets.download)

> 是否保留下载的图片/视频等附件？

多选：
- 保留图片
- 保留视频
- 保留所有附件
- 不保留任何资源

### 问题 3：资源引用格式 (markdown.link)

> Markdown 中资源引用使用哪种格式？

选项：
- `![[文件名.png]]` — Obsidian 短链接（推荐）
- `![文件名](相对路径/文件名.png)` — 标准相对路径


### 问题 4：资源存放目录 (assets.dir)

若问题 2 中用户提到需要保留任意资源，例如图片视频等，则继续追问：

> 资源文件存放到哪个目录？

选项：
- `附件/{type}/{article_name}` — 按类型和文章名分目录（推荐），如 `附件/image/文章名/`
- `附件/{article_name}` — 按文章名，不区分类型
- 自定义路径

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
