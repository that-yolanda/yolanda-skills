---
name: yo-utils-music
description: 音乐伴侣，基于用户偏好通过网易云音乐桌面客户端播放音乐。Use when user asks to "播放音乐"、"听歌"、"来点音乐"、"music"，或表达想听音乐的意图。
version: 0.1.2
author: yolanda
---

# Yo Utils Music

音乐伴侣，根据用户偏好智能选曲，通过网易云音乐桌面客户端播放。
若用户想听音乐，读取 EXTEND.md 了解偏好后选曲播放。

## User Input Tools

When this skill prompts the user, follow this tool-selection rule (priority order):

1. **Prefer built-in user-input tools** exposed by the current agent runtime — e.g., `AskUserQuestion`, `request_user_input`, `clarify`, `ask_user`, `questionnaire`, or any equivalent.
2. **Fallback**: if no such tool exists, emit a numbered plain-text message and ask the user to reply with the chosen number/answer for each question.
3. **Batching**: if the tool supports multiple questions per call, combine all applicable questions into a single call; if only single-question, ask them one at a time in priority order.

Concrete `AskUserQuestion` references below are examples — substitute the local equivalent in other runtimes.

## Workflow

```
- [ ] Step 0: Load preferences (EXTEND.md) ⛔ BLOCKING
- [ ] Step 1: Music selection + playback
- [ ] Step 2: Feedback → update EXTEND.md
```

### Step 0: Load preferences (EXTEND.md) ⛔ BLOCKING

检查 EXTEND.md（与 SKILL.md 同级目录）：

```bash
test -f {baseDir}/EXTEND.md && echo "found" || echo "not_found"
```

| Result | Action |
|--------|--------|
| Found | 读取偏好（风格、歌手、场景、反馈记录），用于 Step 1 选曲 |
| Not found | 按 [references/first-time-setup.md](references/first-time-setup.md) 引导创建 |

### Step 1: Music selection + playback

根据 EXTEND.md 偏好 + 用户意图选择播放策略。命令格式和故障排查见 [references/netease-music.md](references/netease-music.md)。

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

### Step 2: Feedback → update EXTEND.md

播放后收集用户反馈，更新 EXTEND.md：

**触发时机**：
- 用户主动评价（"不错"/"换一首"/"不喜欢"）
- 下次会话用户再次请求音乐时，可简短询问上次感受

**更新规则**：
- 正面反馈 → 追加到「反馈记录」，强化相关偏好
- 负面反馈 → 追加到「反馈记录」，标记避免
- 新发现的偏好 → 更新对应偏好区域
- 反馈记录保持最近 20 条，超出时删除最旧的条目

## EXTEND.md 格式

```markdown
# 音乐偏好

## 风格偏好
流行、民谣、轻音乐

## 喜欢的歌手
周杰伦、陈奕迅

## 听歌场景
工作时听轻音乐，放松时听流行

## 反馈记录
- 周杰伦《晴天》：很喜欢，适合工作时候听
```

## Content Rules

- 每次播放前读取 EXTEND.md 了解偏好
- 命令细节不内联，按需读取 [references/netease-music.md](references/netease-music.md)
- 播放结果只报告歌曲名和歌手，不输出完整表格
- 错误只报告步骤 + 原因

## Extension Support

Custom configurations via EXTEND.md. See **Step 0** for paths and supported options.
