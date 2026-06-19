# First-Time Setup — 环境检查 + 偏好收集

首次使用 yo-utils-music 时，按以下流程检查环境并收集偏好。

## 0. 检查 WIKI_DIR

```bash
echo "${WIKI_DIR:-未设置}"
```

未设置 → 引导用户配置 `$WIKI_DIR`：写入 `$YO_CONFIG_HOME/config.env`（`YO_CONFIG_HOME` 默认 macOS/Linux `~/.config/yolanda-skills`、Windows `%APPDATA%\yolanda-skills`），并按平台生效（macOS/Linux 在 shell rc 加 source 行；Windows 用 `setx WIKI_DIR "<路径>"`）。音乐偏好将存入 `$WIKI_DIR/我的画像/我的偏好.md`。

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

## 初始化偏好章节

若 `$WIKI_DIR/我的画像/我的偏好.md` 不存在或无「音乐偏好」章节，通过 `yo-whoami`（画像写入者）初始化该章节：

```markdown
## 音乐偏好

### 风格偏好
{Q1 选择结果}

### 喜欢的歌手
{Q2 输入，若无则留空}

### 听歌场景
{Q3 选择结果}

### 反馈记录
```

反馈记录区留空，后续使用中逐步积累。
