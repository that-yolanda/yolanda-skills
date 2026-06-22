# First-Time Setup

本 skill 依赖三个环境变量：

- `NOTES_DIR`：笔记/复盘根目录
- `DAILY_NOTE_PATH`：每日日志路径模板，用 `{YYYY}` / `{YYYY-MM}` / `{YYYY-MM-DD}` 占位日期
- `WEEKLY_NOTE_PATH`：每周日志路径模板，用 `{START}` / `{END}` 占位本周一 / 本周日

示例（按你实际的笔记目录结构调整）：

- `DAILY_NOTE_PATH=$NOTES_DIR/02-我的复盘/01-每日思考/{YYYY-MM}/{YYYY-MM-DD}.md`
- `WEEKLY_NOTE_PATH=$NOTES_DIR/02-我的复盘/02-每周复盘/{START}-{END}.md`

## 检查是否已配置

```bash
echo "${NOTES_DIR:-未设置}"
echo "${DAILY_NOTE_PATH:-未设置}"
echo "${WEEKLY_NOTE_PATH:-未设置}"
```

## 未配置时的引导（通过 AskUserQuestion）

1. 询问用户：笔记/复盘根目录路径？（`NOTES_DIR`）
2. 询问每日日志、每周日志的路径规律，拼成带占位的模板：
   - `DAILY_NOTE_PATH`（含 `{YYYY}` / `{YYYY-MM}` / `{YYYY-MM-DD}`）
   - `WEEKLY_NOTE_PATH`（含 `{START}` / `{END}`，对应本周一 / 本周日）
   按用户实际目录结构填写，示例见本文件顶部。
3. 把三个变量写入 `$YO_CONFIG_HOME/config.env`（文件不存在则创建）。`DAILY_NOTE_PATH` / `WEEKLY_NOTE_PATH` 可引用 `$NOTES_DIR`（确保 `NOTES_DIR` 行在前）。
   `YO_CONFIG_HOME` 默认：macOS/Linux `~/.config/yolanda-skills`，Windows `%APPDATA%\yolanda-skills`。
4. 按平台使其生效：
   - **macOS/Linux**：把下面内容加到当前 shell 的启动文件（如 zsh 的 `~/.zshenv`），已有则跳过：
     ```bash
     export YO_CONFIG_HOME="${YO_CONFIG_HOME:-$HOME/.config/yolanda-skills}"
     [ -f "$YO_CONFIG_HOME/config.env" ] && set -a && . "$YO_CONFIG_HOME/config.env" && set +a
     ```
     当前 session 即时 `source` 该文件
   - **Windows**：用 `setx` 把上述变量设为用户环境变量（持久化）；当前窗口用 `set` 即时生效
5. 重新检查三个变量是否就绪
