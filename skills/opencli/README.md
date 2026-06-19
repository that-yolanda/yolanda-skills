# opencli

复用你 Chrome 登录 profile 访问需要登录/反爬的网站（小红书、Twitter、微信公众号、知识星球、Youtube 等）。仅在 web 搜索/fetch 无法访问时使用。

## 何时用

提供了需登录或反爬严格的网站链接，普通抓取拿不到内容时。

## 安装与首次配置

依赖：opencli CLI、隔离 chrome profile、`cdp` alias。对 agent 说「帮我配置 opencli」引导完成（安装 opencli、设置 profile、配置 cdp alias、连接扩展跳板）。

## 使用

- `opencli doctor`：检查连接状态
- `opencli <site> search|read|download`：各站点命令详见 SKILL.md
- 优先 `-f json` 输出并用 jq 查询，减少上下文消耗
- 同站复用同一进程与标签页（`--site-session persistent --keep-tab true`）
- 操作间隔 ≥5 秒，避免触发反爬
