# First-Time Setup

本 skill 依赖 `$NOTES_DIR` 环境变量，指向你的笔记/复盘根目录。

日志默认组织为：
- 每日：`$NOTES_DIR/02-我的复盘/01-每日思考/{YYYY-MM}/{YYYY-MM-DD}.md`
- 每周：`$NOTES_DIR/02-我的复盘/02-每周复盘/{YYYY-MM-DD-YYYY-MM-DD}.md`

## 检查是否已配置

```bash
echo "${NOTES_DIR:-未设置}"
[ -d "${NOTES_DIR:-/nonexistent}" ] && echo "目录存在" || echo "目录不存在"
```

## 未配置时的引导（通过 AskUserQuestion）

1. 询问用户：你的笔记/复盘根目录路径？
2. 把 `NOTES_DIR=<路径>` 写入 `$YO_CONFIG_HOME/config.env`（文件不存在则创建）。
   `YO_CONFIG_HOME` 默认：macOS/Linux `~/.config/yolanda-skills`，Windows `%APPDATA%\yolanda-skills`。
3. 按平台使其生效：
   - **macOS/Linux**：确保 shell rc（`~/.zshrc` / `~/.bashrc`）含：
     ```bash
     export YO_CONFIG_HOME="${YO_CONFIG_HOME:-$HOME/.config/yolanda-skills}"
     [ -f "$YO_CONFIG_HOME/config.env" ] && set -a && . "$YO_CONFIG_HOME/config.env" && set +a
     ```
     无则追加，提示用户 `source ~/.zshrc`
   - **Windows**：用 `setx` 落地：
     ```cmd
     setx YO_CONFIG_HOME "%APPDATA%\yolanda-skills"
     setx NOTES_DIR "<路径>"
     ```
     提示用户重开终端
4. 重新检查 `$NOTES_DIR` 是否就绪

## 关于日志目录结构

若你的笔记目录命名不同，可在参考文件（daily-review.md / week-review.md）中相应调整 `$NOTES_DIR/...` 路径。
