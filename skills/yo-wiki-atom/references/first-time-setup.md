# First-Time Setup

本 skill 依赖 `$WIKI_DIR` 环境变量（知识库根），以及可执行的 `yo wiki` 命令。仓库提供 `examples/yo.mjs` 作为读写 `atoms.jsonl` 的示例实现，用户也可以按相同命令协议自行改写。

## 检查是否已配置

```bash
echo "${WIKI_DIR:-未设置}"
command -v yo >/dev/null 2>&1 && echo "yo 可用" || echo "yo 不可用（需配置 examples/yo.mjs 或自行适配 yo 入口）"
```

## 未配置时的引导（通过 AskUserQuestion）

1. 询问用户知识库目录路径（若没有，从 `知识库模板` 初始化）
2. 把 `WIKI_DIR=<路径>` 写入 `$YO_CONFIG_HOME/config.env`（`YO_CONFIG_HOME` 默认：macOS/Linux `~/.local/share/yo`，Windows `%LOCALAPPDATA%\yo`）
3. 按平台使其生效：
   - **macOS/Linux**：把下面内容加到当前 shell 的启动文件（如 zsh 的 `~/.zshenv`），已有则跳过：
     ```bash
     export YO_CONFIG_HOME="${YO_CONFIG_HOME:-$HOME/.local/share/yo}"
     [ -f "$YO_CONFIG_HOME/config.env" ] && set -a && . "$YO_CONFIG_HOME/config.env" && set +a
     ```
     如需使用示例脚本，再追加 `yo()` 函数（路径替换为实际仓库路径）；当前 session 即时 `source` 该文件
   - **Windows**：`setx YO_CONFIG_HOME "%LOCALAPPDATA%\yo"` + `setx WIKI_DIR "<路径>"`（持久化）；当前窗口 `set WIKI_DIR=<路径>` 即时生效；`yo wiki` 入口由 agent 按当前 Windows 环境自行适配
4. 重新检查 `$WIKI_DIR` 与 `yo` 是否就绪

## 就绪后

通过 `yo wiki add` 写入原子（禁止直接编辑 `atoms.jsonl`）。字段定义见 `$WIKI_DIR/原子库/使用说明.md`。
