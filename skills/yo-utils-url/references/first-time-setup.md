# First-time Setup — 创建 EXTEND.md

首次使用 yo-utils-url 时，如果未找到 EXTEND.md，按以下流程引导用户创建。完成后 EXTEND.md 写入 SKILL.md 同级目录。

## 自动探测

先收集信息，减少用户输入：

```bash
# 1. 检测是否在 Obsidian vault 内（通过 .obsidian 目录判断）
test -d .obsidian && echo "in_vault" || echo "not_in_vault"

# 2. 目录列表
ls -1
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

### Q5：Chrome Profile 选择

> 是否为此 skill 创建独立的 Chrome Profile？

- **创建隔离 Profile (Recommended)** — 不干扰日常浏览，profile 路径写入 EXTEND.md。默认路径根据平台：
  - macOS/Linux：`~/.local/share/yo/chrome-profile`
  - Windows：`%LOCALAPPDATA%\yo\chrome-profile`
  - 用户可自定义路径。
- **复用当前 Chrome** — 不创建隔离 profile，需确保 Chrome 已运行且安装了 Browser Bridge 扩展。

## 模板

根据用户选择生成 EXTEND.md：

**选 A（隔离 Profile）**：

```yaml
---
tmp_dir: .tmp
chrome_profile: "<chrome_profile_path>"
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

**选 B（复用默认）**：

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

## 环境检查

写入 EXTEND.md 后，按顺序检查环境：

### 1. 检查 opencli

```bash
which opencli
```

未安装 → 询问用户是否执行 `npm install -g opencli`。

### 2. 检查 Chrome Bridge

```bash
opencli doctor
```

解析输出判断 extension 是否 connected。

### 3. 创建 Profile 并安装 Bridge（仅选 A）

若用户选择了隔离 Profile：

1. 启动 Chrome 创建 profile：
   ```bash
   "<chrome_binary_path>" --remote-debugging-port=9222 --remote-allow-origins=* --no-first-run --user-data-dir="<chrome_profile_path>"
   ```

2. 引导用户在打开的 Chrome 窗口中安装 Browser Bridge 扩展：
   - 下载：https://github.com/jackwener/opencli/releases
   - 打开 `chrome://extensions/` → 开启开发者模式
   - 点击"加载已解压的扩展程序" → 选择扩展目录

3. 安装完成后验证：
   ```bash
   opencli doctor
   ```

### 4. 安装 Bridge（仅选 B）

引导用户在当前运行的 Chrome 中安装 Browser Bridge 扩展（同上步骤 2），然后 `opencli doctor` 验证。
