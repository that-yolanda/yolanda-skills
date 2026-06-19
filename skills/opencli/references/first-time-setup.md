# First-Time Setup

opencli 复用你电脑 Chrome 的登录 profile 访问需登录/反爬网站。依赖：opencli CLI、一个隔离的 chrome profile、以及 `cdp` alias（启动带该 profile 的 chrome 供扩展跳板连接）。

## 检查

```bash
command -v opencli >/dev/null 2>&1 && echo "opencli 已安装" || echo "opencli 未安装"
echo "${CHROME_PROFILE_DIR:-CHROME_PROFILE_DIR 未设置}"
opencli doctor    # 检查与 chrome 的连接 + 扩展跳板
```

## 未就绪时的引导（通过 AskUserQuestion）

### 1. 安装 opencli

未安装则询问用户执行 `npm install -g @jackwener/opencli`。

### 2. 设置 chrome profile 目录

确认 profile 路径（默认 `$YO_CONFIG_HOME/chrome-profile`，`YO_CONFIG_HOME` 默认 macOS/Linux `~/.config/yolanda-skills`、Windows `%APPDATA%\yolanda-skills`）。把 `CHROME_PROFILE_DIR=<路径>` 写入 `$YO_CONFIG_HOME/config.env`。

### 3. 按平台使其生效

- **macOS/Linux**：确保 shell rc（`~/.zshrc` / `~/.bashrc`）含：
  ```bash
  export YO_CONFIG_HOME="${YO_CONFIG_HOME:-$HOME/.config/yolanda-skills}"
  [ -f "$YO_CONFIG_HOME/config.env" ] && set -a && . "$YO_CONFIG_HOME/config.env" && set +a
  ```
  无则追加。
- **Windows**：用 `setx` 落地：
  ```cmd
  setx YO_CONFIG_HOME "%APPDATA%\yolanda-skills"
  setx CHROME_PROFILE_DIR "<路径>"
  ```
  提示重开终端。

### 4. 配置 cdp alias

在用户 shell rc 追加 alias，启动带该 profile 的 chrome（供 opencli 扩展跳板连接）。

macOS（`~/.zshrc` / `~/.bashrc`）：
```bash
alias cdp='/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir="$CHROME_PROFILE_DIR" >/dev/null 2>&1 &'
```

Linux：
```bash
alias cdp='google-chrome --remote-debugging-port=9222 --user-data-dir="$CHROME_PROFILE_DIR" >/dev/null 2>&1 &'
```

Windows（PowerShell `$PROFILE`）：
```powershell
function cdp { Start-Process chrome "--remote-debugging-port=9222 --user-data-dir=$env:CHROME_PROFILE_DIR" }
```

### 5. 连接扩展并登录

提示用户 `source ~/.zshrc`（或重开终端）→ 运行 `cdp` 启动 chrome → 在 chrome 中安装 opencli 扩展跳板 → 登录目标网站。

### 6. 验证

重新执行 `opencli doctor`，确认 `Extension: connected`。
