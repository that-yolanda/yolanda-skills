# 网易云音乐 (NetEase Music)

macOS 网易云音乐桌面客户端控制插件，基于 CDP 通过 WebSocket 与应用通信，实现播放控制、搜索、歌单浏览等功能。

## 前置要求

网易云音乐需要以远程调试模式启动，开启 CDP 端口：

```bash
/Applications/NeteaseMusic.app/Contents/MacOS/NeteaseMusic --remote-debugging-port=9223 &>/dev/null &
```

## 命令列表

### status - 查看播放状态

获取当前播放歌曲、歌手、进度和播放模式。

```bash
opencli netease-music status
```

输出示例：

| Song | Artist | Progress | State | LoopMode |
|------|--------|----------|-------|----------|
| 晴天 | 周杰伦 | 02:30/04:59 | Playing | loop |

### play - 播放/暂停

切换播放和暂停状态。

```bash
opencli netease-music play
```

### next - 切换歌曲

切换上一首或下一首。

```bash
# 下一首（默认）
opencli netease-music next

# 上一首
opencli netease-music next --direction prev
```

### playlist - 播放列表

获取当前播放列表中的歌曲，或清空播放列表。

```bash
# 默认返回 50 首
opencli netease-music playlist

# 指定返回数量（最大 100）
opencli netease-music playlist --limit 20

# 清空播放列表
opencli netease-music playlist --clear
```

输出示例：

| Index | Name | Artist | Duration |
|-------|------|--------|----------|
| 1 | 晴天 | 周杰伦 | 04:59 |
| 2 | 七里香 | 周杰伦 | 04:59 |

清空时输出：

| Action | Playlist |
|--------|----------|
| Cleared | 播放列表已清空 |

### favorite - 播放我喜欢的音乐

导航到"我喜欢的音乐"并播放全部。

```bash
opencli netease-music favorite
```

### explore - 探索推荐歌单

渐进式参数设计，分三步使用：

```bash
# 第一步：查看所有分类
opencli netease-music explore

# 第二步：查看某个分类下的歌单
opencli netease-music explore --category 华语

# 第三步：播放指定位置的歌单
opencli netease-music explore --category 华语 --play 1
```

分类列表输出示例：

| Index | Name | Group |
|-------|------|-------|
| 1 | 全部 | |
| 2 | 华语 | |
| ... | ... | |
| 8 | 欧美 | 语种 |
| 9 | 日语 | 语种 |

歌单列表输出示例：

| Index | Name | PlayCount |
|-------|------|-----------|
| 1 | 华语经典老歌 | 123.4万 |
| 2 | 华语流行精选 | 89.2万 |

### search - 搜索歌曲

搜索歌曲并可选播放指定结果。`--play` 可单独使用，直接播放当前搜索结果页面中的歌曲（不重新搜索）。

```bash
# 搜索歌曲
opencli netease-music search --query 周杰伦

# 搜索并播放第 1 首
opencli netease-music search --query 周杰伦 --play 1

# 播放当前搜索结果中的第 3 首（不重新搜索）
opencli netease-music search --play 3
```

搜索结果输出示例：

| Index | Name | Artist | Album | Duration |
|-------|------|--------|-------|----------|
| 1 | 晴天 | 周杰伦 | 叶惠美 | 04:59 |
| 2 | 七里香 | 周杰伦 | 七里香 | 04:59 |

## 连接故障排查

当 `opencli netease-music status` 执行失败时，按以下步骤排查：

### 1. 网易云音乐未运行

检查进程：

```bash
pgrep -f NeteaseMusic || echo "not_running"
```

输出 `not_running` → 需要以调试模式启动：

```bash
/Applications/NeteaseMusic.app/Contents/MacOS/NeteaseMusic --remote-debugging-port=9223 &>/dev/null &
```

### 2. 运行中但未开启调试端口

若网易云已在运行但未带 `--remote-debugging-port` 参数，CDP 无法连接。需要：

1. 退出当前网易云音乐
2. 以调试模式重新启动：

```bash
pkill NeteaseMusic
sleep 2
/Applications/NeteaseMusic.app/Contents/MacOS/NeteaseMusic --remote-debugging-port=9223 &>/dev/null &
```

### 3. 导航后连接断开

页面导航（如 explore、search）会导致 WebSocket 断开。opencli 命令内部会自动重连。若连续操作时出现连接错误，等待 2-3 秒后重试即可。

### 4. 验证连接

启动/重启后，用 status 命令验证：

```bash
opencli netease-music status
```

返回播放状态表格即表示连接正常。

## 免责声明

本项目仅供学习和技术研究使用，不得用于任何商业用途。本项目通过非官方方式与网易云音乐客户端交互，可能违反网易云音乐用户协议，使用者需自行承担相关风险。本项目与网易云音乐公司无任何关联。

## 许可证

[MIT License](LICENSE)
