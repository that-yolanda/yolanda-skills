# First-Time Setup

本 skill 依赖 `$WIKI_DIR` 环境变量，指向你的知识库 vault 根目录。

## 检查是否已配置

```bash
echo "${WIKI_DIR:-未设置}"
[ -d "${WIKI_DIR:-/nonexistent}" ] && echo "目录存在" || echo "目录不存在"
```

## 未配置时的引导（通过 AskUserQuestion）

1. 询问用户：你的知识库目录路径？（若用户还没有，提供从 `知识库模板` 初始化的选项）
2. 若需初始化：
   ```bash
   cp -r 知识库模板 "<用户指定路径>"
   ```
3. 把 `WIKI_DIR=<用户指定路径>` 写入 `$YO_CONFIG_HOME/config.env`（文件不存在则创建）。
   `YO_CONFIG_HOME` 默认：macOS/Linux `~/.config/yolanda-skills`，Windows `%APPDATA%\yolanda-skills`。
4. 按平台使其生效：
   - **macOS/Linux**：把下面内容加到当前 shell 的启动文件（如 zsh 的 `~/.zshenv`），已有则跳过：
     ```bash
     export YO_CONFIG_HOME="${YO_CONFIG_HOME:-$HOME/.config/yolanda-skills}"
     [ -f "$YO_CONFIG_HOME/config.env" ] && set -a && . "$YO_CONFIG_HOME/config.env" && set +a
     ```
     当前 session 即时 `source` 该文件
   - **Windows**：`setx YO_CONFIG_HOME "%APPDATA%\yolanda-skills"` + `setx WIKI_DIR "<用户指定路径>"`（持久化）；当前窗口 `set WIKI_DIR=<路径>` 即时生效
5. 重新检查 `$WIKI_DIR` 是否就绪

## 就绪后

`$WIKI_DIR/使用说明.md` 及各子目录的 `使用说明.md` 应存在，按其规范操作。
