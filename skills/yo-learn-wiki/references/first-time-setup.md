# First-time Setup — 创建 EXTEND.md

首次使用 yo-learn-wiki 时，如果未找到 EXTEND.md，按以下流程引导用户创建。EXTEND.md 放在 SKILL.md 同级目录。

## 前置条件

确认 Obsidian 应用运行中且 CLI 可用：

```bash
obsidian-cli vaults
```

## 自动探测

先收集信息，减少用户输入：

```bash
# 1. 当前工作目录是否在某个 vault 内
obsidian-cli vault info=name

# 2. vault 根目录下有哪些一级目录
obsidian-cli folders

# 3. vault 内是否有 .base 文件
obsidian-cli bases
```

## 引导流程

基于自动探测结果，用 AskUserQuestion 一次性询问：

### Q1：Vault 名称

若 `obsidian-cli vault info=name` 成功返回 → 自动填入，跳过此问题。
否则询问用户 vault 名称。

### Q2：知识库目录（wiki_dir）

从 `obsidian-cli folders` 结果中，选取名称含"知识库"、"wiki"、"总结"等关键词的目录作为推荐选项，其余作为备选。

### Q3：Base 视图文件（base_file）

从 `obsidian-cli bases` 结果中查找含"知识库"、"目录"、"index"的 .base 文件作为推荐。若无匹配，建议用户选择：
- 选项 A：从已有 .base 文件中选一个
- 选项 B：输入名称，后续自动创建

### Q4：源文件目录（source_dirs，多选）

从 `obsidian-cli folders` 结果中排除 `wiki_dir` 后，列出其余目录供用户多选。优先推荐名称含"笔记"、"输入"、"文章"、"知识"的目录。

### Q5：封面图存放路径（cover_dir）

Entity 的 `cover` 属性引用封面图，图片需要存在于 vault 中。询问用户：

- 选项 A：放在 `wiki_dir` 下（如 `08-知识库/assets/`）
- 选项 B：用户已有的资源目录（从 `obsidian-cli folders` 结果中选择）

### Q6：初始专题结构（可选）

询问用户是否需要预设专题目录：

- 选项 A：根据使用场景生成建议结构（用户描述目标 → AI 拟定目录 → 确认后创建）
- 选项 B：稍后手动创建（ingest 时会根据内容自动建议专题）
- 选项 C：跳过，使用现有目录结构

若选 A，根据用户描述的使用场景（如"AI Skill 开发"、"内容创作"、"产品管理"）生成 3-7 个专题目录名，确认后创建。专题会在后续 ingest 中自然生长，无需一次定义完整。

## 设置后操作

收集完所有回答后，按顺序执行：

### 1. 创建 Base 文件（如不存在）

```bash
obsidian-cli vault="{vault}" read file="{base_file}"
```

若文件不存在，用 `obsidian-cli create` 创建：

```bash
obsidian-cli vault="{vault}" create path="{wiki_dir}/{base_file}" content="views:
  - type: cards
    name: 目录
    filters:
      and:
        - or:
            - file.tags.contains(\"Entity\")
            - file.tags.contains(\"Topic\")
        - '!file.path.startsWith(\"98-模板\")'
    order:
      - file.name
      - tags
    image: note.cover"
```

### 2. 复制封面图

```bash
cp {baseDir}/assets/*.jpg "{vault_path}/{cover_dir}/"
```

### 3. 写入 EXTEND.md

```yaml
---
vault: "{auto_or_user}"
wiki_dir: "{user_selected}"
base_file: "{user_selected}"
cover_dir: "{user_selected}"
source_dirs:
  - "{user_selected_1}"
  - "{user_selected_2}"
---
```

写入 `{baseDir}/EXTEND.md`。

### 4. 验证

```bash
obsidian-cli vault="{vault}" base:query file="{base_file}" format=json
```

确认返回 JSON 数据（可为空数组）。
