# 05-yolanda-skills
统一维护个人 Agent Skills 的仓库，后续通过 GitHub 分发，并用 `npx skills` 安装到 `Codex`、`Claude Code` 等工具。

## 项目脚本
### 项目初始化
暂无。

### 项目本地运行
暂无。

### 项目启动
暂无。

### 项目调试
暂无。

## 项目功能（含规划）
### 模块 Skill 仓库
- [x] **统一维护个人 Skills**: 所有个人 Skill 集中存放在根目录 `skills/` 下，作为唯一维护源。
- [x] **按 Skill 独立目录组织**: 每个 Skill 保持独立目录，可包含 `SKILL.md`、`assets/`、`references/`、`agents/` 等内容。
- [x] **兼容 `npx skills` 发现规则**: 当前仓库使用 `skills/<skill-name>/` 结构，便于后续直接通过 `npx skills add` 安装。

### 模块 已有 Skills
- [x] **code-review-simplify**: 用于审查代码可读性和复杂度，重点识别过度设计与冗余结构。
- [x] **readme-skill**: 用于按固定模板创建或更新项目根目录 `README.md`。
- [x] **khazix-writer**: 用于按既定风格生成公众号长文内容。

### 模块 分发与使用规划
- [ ] **发布到 GitHub**: 后续将该仓库作为公开或私有远程源统一发布与维护。
- [ ] **通过 `npx skills` 安装**: 后续优先使用 `npx skills` 管理目标目录中的 Skill，而不是自建安装工具。
- [ ] **面向多 Agent 复用**: 后续安装目标包括 `Codex`、`Claude Code` 等支持 Agent Skills 的工具。

## 项目结构
```text
.
├── README.md                          # 仓库说明与当前维护规划
├── .gitignore                         # 本地无关文件忽略规则
└── skills/                            # 个人 Skills 主目录
    ├── code-review-simplify/          # 代码简化与可读性审查 Skill
    │   ├── SKILL.md                   # Skill 主说明与触发规则
    │   ├── agents/openai.yaml         # Agent 侧附加配置
    │   └── assets/                    # Skill 资源文件
    ├── khazix-writer/                 # 长文写作 Skill
    │   ├── SKILL.md                   # Skill 主说明与写作规则
    │   ├── README.md                  # 该 Skill 自身的补充说明
    │   ├── LICENSE                    # 该 Skill 附带许可信息
    │   ├── agents/openai.yaml         # Agent 侧附加配置
    │   ├── assets/                    # Skill 素材资源
    │   └── references/                # 写作参考资料
    └── readme-skill/                  # README 生成与更新 Skill
        ├── SKILL.md                   # Skill 主说明与输出模板
        ├── agents/openai.yaml         # Agent 侧附加配置
        └── assets/                    # Skill 资源文件
```

---
更新日期:2026-04-10
