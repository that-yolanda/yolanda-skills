---
name: yo-utils-music
description: 音乐伴侣，基于用户偏好通过网易云音乐桌面客户端播放音乐。Use when user asks to "播放音乐"、"听歌"、"来点音乐"、"music"，或表达想听音乐的意图。
version: 0.1.3
author: yolanda
---

# Yo Utils Music

音乐伴侣，根据用户偏好智能选曲，通过网易云音乐桌面客户端播放。

音乐偏好读取自 `$WIKI_DIR/我的画像/我的偏好.md` 的「音乐偏好」章节。`$WIKI_DIR` 是系统环境变量，指向你的知识库 vault 根目录。首次使用若未配置，按 [references/first-time-setup.md](references/first-time-setup.md) 引导用户设置。

## User Input Tools

当本 skill 需要提示用户时，按此工具选择规则（优先级顺序）：

1. **优先使用当前 agent runtime 内置的用户输入工具** — 如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user`、`questionnaire` 或等效工具。
2. **回退到纯文本**：若无此类工具，输出编号的纯文本消息，让用户回复选择的编号/答案。
3. **批量规则**：若工具支持单次调用多个问题，将所有适用问题合并为一次调用；若仅支持单问题，按优先级逐个提问。

下文对 `AskUserQuestion` 的具体提及均为示例 — 其他 runtime 按规则替换为本地等效工具。

## Workflow

```
- [ ] Step 1: 读取偏好 + 选曲播放
- [ ] Step 2: 反馈 → 更新偏好
```

### Step 1: 读取偏好 + 选曲播放

读取 `$WIKI_DIR/我的画像/我的偏好.md` 的「音乐偏好」章节（风格、歌手、场景、反馈记录），据此选曲。命令格式和故障排查见 [references/netease-music.md](references/netease-music.md)。

**选曲策略**：

| 用户意图 | 策略 | 命令 |
|----------|------|------|
| 指定歌手/歌曲 | 搜索播放 | `opencli netease-music search --query <keyword> --play <index>` |
| 想探索新音乐 | 按偏好匹配分类浏览 | `opencli netease-music explore --category <genre> --play <index>` |
| 想听熟悉的 | 播放收藏或播放列表 | `opencli netease-music favorite` |
| 随便听听 | 查看播放列表继续播放 | `opencli netease-music playlist` + `opencli netease-music play` |
| 控制播放 | 暂停/切歌 | `opencli netease-music play` / `opencli netease-music next` |

**选曲原则**：
- 优先从「喜欢的歌手」和「风格偏好」中匹配
- 避免推荐「反馈记录」中标记为不喜欢的类型
- 若用户未指定，结合「听歌场景」推断合适的风格
- 搜索后先展示结果列表，让用户确认或指定 index

### Step 2: 反馈 → 更新偏好

播放后收集用户反馈，通过 `yo-whoami` 更新 `$WIKI_DIR/我的画像/我的偏好.md` 的「音乐偏好」章节（画像由 yo-whoami 统一写入）。

**触发时机**：
- 用户主动评价（"不错"/"换一首"/"不喜欢"）
- 下次会话用户再次请求音乐时，可简短询问上次感受

**更新规则**：
- 正面反馈 → 追加到「反馈记录」，强化相关偏好
- 负面反馈 → 追加到「反馈记录」，标记避免
- 新发现的偏好 → 更新对应区域
- 反馈记录保持最近 20 条，超出时删除最旧的条目

## 偏好文件格式

`$WIKI_DIR/我的画像/我的偏好.md` 中的一个 `##` 章节，例如：

```markdown
## 音乐偏好

### 风格偏好
流行、民谣、轻音乐

### 喜欢的歌手
周杰伦、陈奕迅

### 听歌场景
工作时听轻音乐，放松时听流行

### 反馈记录
- 周杰伦《晴天》：很喜欢，适合工作时候听
```

若该章节不存在，按 [references/first-time-setup.md](references/first-time-setup.md) 引导用户初始化。

## Content Rules

- 每次播放前读取偏好章节
- 命令细节不内联，按需读取 [references/netease-music.md](references/netease-music.md)
- 播放结果只报告歌曲名和歌手，不输出完整表格
- 错误只报告步骤 + 原因
- 偏好写入统一经 yo-whoami，不直接编辑画像文件
