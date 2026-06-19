# yo-utils-music

音乐伴侣，根据你的偏好通过网易云音乐桌面客户端播放音乐。

## 何时用

你说「播放音乐」「听歌」「来点音乐」「music」时。

## 安装与首次配置

依赖：`opencli`（npm 包）、网易云音乐桌面客户端、`$WIKI_DIR`（音乐偏好存于此）。对 agent 说「帮我配置 yo-utils-music」引导完成（安装 opencli、验证网易云连接、设置偏好）。

> 注：网易云调试模式启动命令为 macOS 专属，Windows/Linux 需自行调整启动参数。

## 它会做什么

读取 `$WIKI_DIR/我的画像/我的偏好.md` 的音乐偏好 → 选曲 → opencli 控制网易云播放 → 收集反馈经 yo-whoami 更新偏好。
