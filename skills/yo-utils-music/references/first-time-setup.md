# First-time Setup — 环境检查 + 偏好收集

首次使用 yo-utils-music 时，按以下流程检查环境并收集偏好，生成 EXTEND.md。

## 环境检查

### 1. 检查 opencli

```bash
which opencli
```

未安装 → 询问用户是否执行 `npm install -g @jackwener/opencli`。

### 2. 检查网易云音乐

```bash
opencli netease-music status
```

| 输出 | Action |
|------|--------|
| 返回播放状态表格 | 环境就绪，继续偏好收集 |
| 报错 / 无响应 | 提示用户以调试模式启动网易云音乐 |

启动命令：

```bash
/Applications/NeteaseMusic.app/Contents/MacOS/NeteaseMusic --remote-debugging-port=9223 &>/dev/null &
```

启动后重新执行 `opencli netease-music status` 验证连接。

## 偏好收集

环境就绪后，用 AskUserQuestion 一次性收集偏好：

### Q1：喜欢的音乐风格

> 你平时喜欢听什么类型的音乐？

多选 + 自定义：
- 华语流行
- 欧美流行
- 民谣
- 摇滚
- 电子
- 古典
- 轻音乐
- R&B / 灵魂乐
- 爵士
- 日语

### Q2：喜欢的歌手/乐队

> 有没有特别喜欢的歌手或乐队？可以列几个。

自由文本输入。

### Q3：听歌场景

> 你通常在什么场景下听音乐？

多选：
- 工作 / 学习（需要专注的背景音乐）
- 放松 / 休息
- 运动 / 健身
- 通勤
- 睡前

## 生成 EXTEND.md

根据用户选择生成，写入 `{baseDir}/EXTEND.md`：

```markdown
# 音乐偏好

## 风格偏好
{Q1 选择结果，逗号分隔}

## 喜欢的歌手
{Q2 输入，若无则留空}

## 听歌场景
{Q3 选择结果，每项一行简述偏好}

## 反馈记录
```

反馈记录区留空，后续使用中逐步积累。
