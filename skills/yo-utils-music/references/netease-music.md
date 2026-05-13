# 网易云音乐 (NetEase Music)

macOS 网易云音乐桌面客户端控制适配器，基于 CDP (Chrome DevTools Protocol) 通过 WebSocket 与应用通信，实现播放控制、搜索、歌单浏览等功能。

## 前置要求

### 启动应用

网易云音乐需要以远程调试模式启动，开启 CDP 端口：

```bash
/Applications/NeteaseMusic.app/Contents/MacOS/NeteaseMusic --remote-debugging-port=9223
```

CDP 默认监听 `localhost:9223`，通过 `/json` 获取页面目标的 WebSocket 调试地址。

### 技术要点

- **平台限制**：仅支持 macOS
- **通信方式**：通过 Node 22 内置 `WebSocket` 连接 CDP，使用 `Runtime.evaluate` 注入 JS 操作 DOM
- **导航交互**：侧边栏等 React 组件需要 CDP 原生鼠标事件 (`Input.dispatchMouseEvent`)，JS `dispatchEvent` 无法触发点击
- **页面导航后**：WebSocket 连接会断开，需要重新调用 `getCdpSocket()` 获取新地址
- **依赖**：仅依赖 `@jackwener/opencli` 运行时，无第三方包

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

### playlist - 查看播放列表

获取当前播放列表中的歌曲。

```bash
# 默认返回 50 首
opencli netease-music playlist

# 指定返回数量（最大 100）
opencli netease-music playlist --limit 20
```

输出示例：

| Index | Name | Artist | Duration |
|-------|------|--------|----------|
| 1 | 晴天 | 周杰伦 | 04:59 |
| 2 | 七里香 | 周杰伦 | 04:59 |

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

搜索歌曲并可选播放指定结果。

```bash
# 搜索歌曲
opencli netease-music search --query 周杰伦

# 搜索并播放第 1 首
opencli netease-music search --query 周杰伦 --play 1
```

搜索结果输出示例：

| Index | Name | Artist | Album | Duration |
|-------|------|--------|-------|----------|
| 1 | 晴天 | 周杰伦 | 叶惠美 | 04:59 |
| 2 | 七里香 | 周杰伦 | 七里香 | 04:59 |

## 架构说明

```
netease-music/
├── utils.js        # 共享工具：CDP 连接、evaluate、进程检测
├── status.js       # 播放状态读取
├── play.js         # 播放/暂停
├── next.js         # 上一首/下一首
├── playlist.js     # 播放列表读取（虚拟列表滚动提取）
├── favorite.js     # 导航到"我喜欢的音乐"并播放
├── explore.js      # 精选歌单浏览（分类→歌单→播放）
├── search.js       # 搜索歌曲（输入→搜索→播放）
└── SKILL.md        # 本文件
```

### CDP 交互模式

命令根据交互方式分为两类：

**页内操作**（不涉及导航）：直接用 `cdpEvaluate` 注入 JS 操作 DOM
- `status`：读取 footer 播放信息
- `play`：点击 footer 播放按钮
- `next`：点击 footer 上一首/下一首按钮

**导航操作**（涉及页面跳转）：需要 CDP 原生鼠标事件 + 连接重建
- `favorite`：点击侧边栏 → 点击"播放全部"
- `explore`：点击侧边栏"精选" → 歌单广场 → 分类 → 歌单 → 播放
- `search`：点击搜索框 → 输入 → 回车 → 提取/播放结果

### DOM 关键选择器

| 目标 | 选择器 |
|------|--------|
| 侧边栏导航项 | `[class*="ItemContainer_"]`（排除 `NavItemContainer`） |
| 侧边栏项标题 | `[class*="Title_"]` |
| 播放器 footer | `footer` |
| 播放/暂停按钮 | `footer [aria-label="play"], [aria-label="pause"]` |
| 搜索框 | `.searchbox input` |
| 搜索结果行 | `.tr`，字段为 `.td-num/.td-title/.td-album/.td-duration` |
| 歌单广场标签 | `.cmd-tabs-tab` |
| 歌单卡片 | `.playlist-card`，含 `.name` 和 `.play-count` |
| 分类按钮 | `.tags-btns button`，更多分类面板用 `[class*="TagsContainer"] button` |
| 播放列表虚拟列表 | `.ReactVirtualized__Grid__innerScrollContainer` |

## 连接故障排查

当 `opencli netease-music status` 执行失败时，按以下步骤排查：

### 1. 网易云音乐未运行

检查进程：

```bash
pgrep -f NeteaseMusic || echo "not_running"
```

输出 `not_running` → 需要以调试模式启动：

```bash
/Applications/NeteaseMusic.app/Contents/MacOS/NeteaseMusic --remote-debugging-port=9223 &
```

### 2. 运行中但未开启调试端口

若网易云已在运行但未带 `--remote-debugging-port` 参数，CDP 无法连接。需要：

1. 退出当前网易云音乐
2. 以调试模式重新启动：

```bash
pkill NeteaseMusic
sleep 2
/Applications/NeteaseMusic.app/Contents/MacOS/NeteaseMusic --remote-debugging-port=9223 &
```

### 3. 导航后连接断开

页面导航（如 explore、search）会导致 WebSocket 断开。opencli 命令内部会自动重连。若连续操作时出现连接错误，等待 2-3 秒后重试即可。

### 4. 验证连接

启动/重启后，用 status 命令验证：

```bash
opencli netease-music status
```

返回播放状态表格即表示连接正常。
