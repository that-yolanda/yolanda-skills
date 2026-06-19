# yo-opentalk

知识系统的日常对话入口。根据你的意图路由到原子录入、画像更新或开放讨论。

## 何时用

日常与 agent 对话时，当你可能需要沉淀知识、更新偏好/状态、或基于已有知识库回答问题时。

## 安装

用 `npx skills add github:that-yolanda/yolanda-skills --skill yo-opentalk` 安装，或把本 skill 目录复制到你的 agent skills 路径（见仓库 README）。

## 首次使用

你的知识库还没配置时，直接对 agent 说：

> 帮我配置 yo-opentalk

agent 会询问你的知识库路径，从 `vault-template` 初始化（如需要），并设置好 `WIKI_DIR` 环境变量。你无需手动改任何配置。

## 它会做什么

- 你分享了值得沉淀的信息 → 调用 `yo-wiki-atom` 录入原子
- 你表达了偏好/目标/状态变化 → 调用 `yo-whoami` 更新画像
- 需要借助知识库回答 → 读取 `$WIKI_DIR/知识库/` 相关内容
