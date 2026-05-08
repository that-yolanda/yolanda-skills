# 更新日志

本项目的所有重要变更都将记录在此文件中。

## 0.2.0 - 2026-05-08

### 新功能
- 支持通过 EXTEND.md chrome_profile 字段配置 Chrome 隔离 profile（yo-utils-url 0.1.0）
- 首次 setup 增加环境检查步骤：opencli 安装、Chrome Bridge 验证（yo-utils-url）
- setup 流程新增 Chrome profile 隔离选项 Q5（yo-utils-url）

### 修复
- 用 opencli daemon status 轮询替代不可靠的 curl CDP 端口检测（yo-utils-url）
- 启动 Chrome 前清理残留 SingletonLock/Socket/Cookie 文件（yo-utils-url）
- findChrome() 新增 Windows 和 Linux Chrome 二进制路径（yo-utils-url）

### 文档
- 重写 README，按 skill 分别列出前置环境、安装步骤和使用示例
- yo-utils-url setup 中用文件系统检测替代 obsidian-cli 调用
- yo-learn-wiki 新增 obsidian-cli 失败时自动启动提示（0.1.1）

## 0.1.1 - 2026-04-30

### 新功能
- release-skills 工作流新增 GitHub Release 步骤

### 修复
- 升级 actions/checkout 至 v6 以原生支持 Node 24
- CI 显式启用 Node 24 消除弃用警告
- CI 从 npm 切换至 bun

### 重构
- yo-learn-wiki 封面选图改为从 cover_dir 动态扫描，移除硬编码映射表
- 新增 11 张封面图，压缩已有资源文件（yo-learn-wiki）

## 0.1.0 - 2026-04-30

### 新功能
- 新增 yo-utils-url 技能，用于 URL 内容采集
- 新增 yo-learn-wiki 技能，用于知识库学习
- 新增项目专属 release-skills 发布工作流

### 修复
- 重命名技能统一使用 yo- 前缀，添加 CLAUDE.md

### 重构
- 参考 baoyu-skills 设计 skill 创建流程
- 改进 yo-utils-url 首次设置的自动检测
