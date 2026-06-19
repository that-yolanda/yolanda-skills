# agent-browser

[agent-browser](https://github.com/vercel-labs/agent-browser) — 面向 AI agent 的浏览器自动化 CLI（Chrome via CDP + accessibility-tree snapshots）。本仓库内为 discovery stub，默认 `hidden`，由其他 skill 按需调用。

## 安装

```bash
npm i -g agent-browser && agent-browser install
```

## 使用

详细工作流由 CLI 自身提供（始终匹配已安装版本）：

```bash
agent-browser skills get core            # 核心工作流与常见模式
agent-browser skills list                # 列出全部可用 skill
```

本 skill 默认不直接面向用户；当其他 skill（如 yo-wiki-atom 读取需登录网页）需要浏览器自动化时调用。
