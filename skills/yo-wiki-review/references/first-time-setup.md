# First-Time Setup

本 skill 依赖 `$WIKI_DIR` 环境变量（知识库根），以及可执行的 `yo wiki` 命令。仓库提供 `examples/yo.mjs` 作为读写 `atoms.jsonl` 的示例实现，用户也可以按相同命令协议自行改写。

## 检查是否已配置

```bash
echo "${WIKI_DIR:-未设置}"
command -v yo >/dev/null 2>&1 && echo "yo 可用" || echo "yo 不可用（需配置 examples/yo.mjs 或自行适配 yo 入口）"
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
     无则追加；如需使用示例脚本，再追加：
     ```bash
     yo() {
       node "/path/to/yolanda-skills/examples/yo.mjs" "$@"
     }
     ```
     提示用户把路径替换为实际仓库路径并 `source ~/.zshrc`
   - **Windows**：用 `setx` 落地：
     ```cmd
     setx YO_CONFIG_HOME "%APPDATA%\yolanda-skills"
     setx WIKI_DIR "<路径>"
     ```
     提示重开终端，并让 agent 按当前 Windows 环境自行适配等效的 `yo wiki` 入口
4. 重新检查 `$WIKI_DIR` 与 `yo` 是否就绪

## 就绪后

按 `$WIKI_DIR/知识库/使用说明.md`、`原子库/使用说明.md`、`我的画像/使用说明.md` 的规范提炼原子并回写状态。
