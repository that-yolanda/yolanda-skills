# First-Time Setup

本 skill 依赖 `$WIKI_DIR` 环境变量（知识库根），以及 `yo wiki` 命令（tools/wiki，需加入 PATH）。

## 检查是否已配置

```bash
echo "${WIKI_DIR:-未设置}"
command -v yo >/dev/null 2>&1 && echo "yo 可用" || echo "yo 不可用（需把 tools/ 加入 PATH）"
```

## 未配置时的引导（通过 AskUserQuestion）

1. 询问用户知识库目录路径（若没有，从 `vault-template` 初始化）
2. 把 `WIKI_DIR=<路径>` 写入 `$YO_CONFIG_HOME/config.env`（`YO_CONFIG_HOME` 默认：macOS/Linux `~/.config/yolanda-skills`，Windows `%APPDATA%\yolanda-skills`）
3. 按平台使其生效：
   - **macOS/Linux**：确保 shell rc（`~/.zshrc` / `~/.bashrc`）含：
     ```bash
     export YO_CONFIG_HOME="${YO_CONFIG_HOME:-$HOME/.config/yolanda-skills}"
     [ -f "$YO_CONFIG_HOME/config.env" ] && set -a && . "$YO_CONFIG_HOME/config.env" && set +a
     ```
     无则追加；并提示把仓库 `tools/` 加入 PATH、`source ~/.zshrc`
   - **Windows**：用 `setx` 落地：
     ```cmd
     setx YO_CONFIG_HOME "%APPDATA%\yolanda-skills"
     setx WIKI_DIR "<路径>"
     ```
     提示重开终端
4. 重新检查 `$WIKI_DIR` 与 `yo` 是否就绪

## 就绪后

通过 `yo wiki add` 写入原子（禁止直接编辑 `atoms.jsonl`）。字段定义见 `$WIKI_DIR/原子库/使用说明.md`。
