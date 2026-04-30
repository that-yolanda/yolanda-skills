# 更新日志

本项目的所有重要变更都将记录在此文件中。

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
