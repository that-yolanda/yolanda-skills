# First-Time Setup — 环境检查 + 偏好收集

首次使用 yo-utils-music 时，按以下流程检查环境并收集偏好。

## 0. 确认配置目录

音乐偏好文件位于 `$YO_CONFIG_HOME/music.md`。`$YO_CONFIG_HOME` 默认：macOS/Linux `~/.config/yolanda-skills`；Windows `%APPDATA%\yolanda-skills`，由全局统一配置机制管理。本 skill 直接使用该默认目录，无需单独配置 shell。

## 1. 检查 opencli

```bash
which opencli
```

未安装 → 询问用户是否执行 `npm install -g @jackwener/opencli`。

## 2. 检查网易云音乐

```bash
opencli netease-music status
```

| 输出 | Action |
|------|--------|
| 返回播放状态表格 | 环境就绪，继续偏好收集 |
| 报错 / 无响应 | 提示用户以调试模式启动网易云音乐 |

启动命令（macOS）：

```bash
/Applications/NeteaseMusic.app/Contents/MacOS/NeteaseMusic --remote-debugging-port=9223 &>/dev/null &
```

启动后重新执行 `opencli netease-music status` 验证连接。（Windows/Linux 需自行调整网易云的调试启动参数。）

## 偏好收集

环境就绪后，用 AskUserQuestion 一次性收集偏好：

### Q1：喜欢的音乐风格（多选 + 自定义）

> 你平时喜欢听什么类型的音乐？

- 华语流行 / 欧美流行 / 民谣 / 摇滚 / 电子 / 古典 / 轻音乐 / R&B / 爵士 / 日语

### Q2：喜欢的歌手/乐队（自由文本）

> 有没有特别喜欢的歌手或乐队？可以列几个。

### Q3：听歌场景（多选）

> 你通常在什么场景下听音乐？

- 工作/学习（专注背景音乐）/ 放松 / 运动 / 通勤 / 睡前

## 写入偏好文件

将收集的偏好写入 `$YO_CONFIG_HOME/music.md`：

```markdown
# 音乐偏好

## 风格偏好
{Q1 选择结果}

## 喜欢的歌手
{Q2 输入，若无则留空}

## 听歌场景
{Q3 选择结果}

## 反馈记录
```

反馈记录区留空，后续使用中逐步积累。
