# First-Time Setup

本 skill 依赖 `$WIKI_DIR` 环境变量，指向你的知识库 vault 根目录。

## 检查是否已配置

```bash
echo "${WIKI_DIR:-未设置}"
[ -d "${WIKI_DIR:-/nonexistent}" ] && echo "目录存在" || echo "目录不存在"
```

## 未配置时的引导（通过 AskUserQuestion）

1. 询问用户：你的知识库目录路径？（若用户还没有，提供从 `vault-template` 初始化的选项）
2. 若需初始化：
   ```bash
   cp -r vault-template "<用户指定路径>"
   ```
3. 把 `WIKI_DIR=<用户指定路径>` 写入 `$YO_CONFIG_HOME/config.env`（文件不存在则创建）。
   `YO_CONFIG_HOME` 默认：macOS/Linux `~/.config/yolanda-skills`，Windows `%APPDATA%\yolanda-skills`。
4. 按平台使其生效：
   - **macOS/Linux**：确保 shell rc（`~/.zshrc` / `~/.bashrc`）含：
     ```bash
     export YO_CONFIG_HOME="${YO_CONFIG_HOME:-$HOME/.config/yolanda-skills}"
     [ -f "$YO_CONFIG_HOME/config.env" ] && set -a && . "$YO_CONFIG_HOME/config.env" && set +a
     ```
     无则追加，提示用户 `source ~/.zshrc`
   - **Windows**：用 `setx` 把变量设为用户环境变量：
     ```cmd
     setx YO_CONFIG_HOME "%APPDATA%\yolanda-skills"
     setx WIKI_DIR "<用户指定路径>"
     ```
     提示用户重开终端（`setx` 当前窗口不生效）
5. 重新检查 `$WIKI_DIR` 是否就绪

## 就绪后

`$WIKI_DIR/我的画像/使用说明.md` 应存在，按其 5 个文件的格式规范写入。
