# CLI 速查

所有命令使用 `obsidian-cli vault="{vault}"` 前缀。`{vault}` 从 EXTEND.md 读取。

若 obsidian-cli 依赖 Obsidian 进程，若执行失败，先执行 `open -a Obsidian` 确保进行应用已启动。

## 读取与查询

| 用途 | 命令 | 输出 |
|------|------|------|
| 列出所有页面元数据 | `base:query file="{base_file}" format=json` | 页面列表含 frontmatter 属性 |
| 查找引用某文件的页面 | `backlinks file="{name}" format=json` | backlink 列表 |
| 读取文件内容 | `read file="{name}"` | 文件全文 |
| 读取单个 frontmatter 属性 | `property:read file="{name}" name={prop}` | 属性值 |
| 列出目录下文件 | `files folder="{folder}" ext=md` | 文件路径列表 |
| 列出目录结构 | `folders folder="{path}"` | 子目录列表 |
| 查看文件标题结构 | `outline file="{name}" format=json` | heading 层级 |

## 创建与写入

| 用途 | 命令 |
|------|------|
| 创建新文件 | `create path="{path}" content="..."` |
| 追加内容到文件末尾 | `append file="{name}" content="..."` |
| 设置 frontmatter 属性 | `property:set file="{name}" name={prop} value="{val}"` |

## Setup

| 用途 | 命令 |
|------|------|
| 列出所有 vault | `vaults` |
| 当前 vault 信息 | `vault info=name` |
| 列出所有 base 文件 | `bases` |
