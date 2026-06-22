---
name: opencli
description: 复用用户chrome profile（有登录cookie）访问一些需要登录的网站链接，或具备防爬的网站时使用。当用户提供了 twitter，小红书，微信公众号等需要登录或反爬策略严格的网站链接时使用。
version: 0.1.0
author: yolanda
---

# Opencli

基于chrome-devtools封装的cli命令工具，复用用户电脑的chrome profile，访问一些具备防爬手段的一些网站，例如 twitter，小红书，微信公众号等，基本涵盖大部分主流网站与electron app。需要借助附带的一个浏览器插件做跳板。

该工具仅在 web_search ，web_fetch 无法访问时使用。

首次使用若 opencli / chrome profile / cdp alias 未就绪，按 [references/first-time-setup.md](references/first-time-setup.md) 引导用户配置。

## User Input Tools

当本 skill 需要提示用户时，按此工具选择规则（优先级顺序）：

1. **优先使用当前 agent runtime 内置的用户输入工具** — 如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user`、`questionnaire` 或等效工具。
2. **回退到纯文本**：若无此类工具，输出编号的纯文本消息，让用户回复选择的编号/答案。
3. **批量规则**：若工具支持单次调用多个问题，将所有适用问题合并为一次调用；若仅支持单问题，按优先级逐个提问。

下文对 `AskUserQuestion` 的具体提及均为示例 — 其他 runtime 按规则替换为本地等效工具。

## 使用指导
- 状态检查
  - opencli doctor 检查与 chrome 是否正常
  - opencli依赖一个chrome插件作为跳板，若opencli提示插件未连接（Extension: not connected），可使用 alias 命令 `cdp` 快速启动一个带用户登录cookie的chrome实例。
  - 若碰到下面某个页面 无法访问，或cookie失效时，告知用户，让用户登录对应网站后再操作
- 安全执行
  - 因使用该命令需要访问的网站大多有反爬措施，避免短期/大规模/批量的采集，每次查询操作间隔保持5秒以上
  - 避免重复开启 页面 / chrome 进程，访问基于浏览器 的 opencli 命令时优先考虑复用同一个进程与标签页，参数后面必须带上：--site-session persistent --keep-tab true --window foreground
    同站点复用通标签：`--site-session`， persistent 复用 ； ephemeral 不复用（default）
    命令结束后保持标签页：`--keep-tab`，true 保持页面； false 关闭页面（default）
    前台/后台操作： `--window`，foreground 前台； background 后台（default）
  - 当任务完成，且确定当前会话不再需要使用opencli时，关闭通过 cdp 启动的进程。
  - 优先使用 -f json 格式输出结果，并用jq查询内容，避免必不要的上下文消耗
- 避免临时文件
  - opencli使用过程中下载的临时文件，在任务完成后及时清理，避免遗留中间产物
- 网页如果遇到未登录或 cookie 过期
  - 告知用户需要登录或者授权过期，请求用户协助登录，并在用户登录后继续任务

## 基本命令
- 命令格式：opencli [options] [command]
- 检查连接状态：opencli doctor
- 查看可用命令：opencli list，注意：由于支持的command比较多，list 命令尽量避免频繁使用
- 支持命令带 -h 查看帮助说明

## 小红书
注意：小红书分为 `rednote` 海外版本 与  `xiaohongshu` 国内版本，根据用户实际登录账号选择，下面以 `rednote` 为例，可以直接替换为 `xiaohongshu`

### 平台登录
- 输入：无
- 输出：登录状态，status, logged_in, site, user_id, nickname
- 命令：opencli rednote login [options]
- 说明：若当前返回未登录，提醒用户协助登录，第一次打开该平台时使用

### 笔记搜索
- 输入：关键词
- 输出： 笔记列表，包含：rank, title, author, likes, published_at, url, author_url 
- 命令：opencli rednote search [keyword] [options]

### 查看笔记
- 输入：笔记 url 地址（with xsec_token）
- 输出：笔记详情 field, value，包括：title, author, content, like, collects, comments, tags
- 命令：opencli rednote note [url] [options]

### 查看评论
- 输入：笔记 url 地址
- 输出：评论内容，包括：rank, author, text, likes, time, is_reply, reply_to
- 命令：opencli rednote comments [url] [options]

### 下载图片/视频
- 输入：笔记 url 地址
- 输出：视频/图片文件，保存位置为 {output}/{note_id}/*.mp4 或 *.jpg
- 命令：opencli rednote download [url] [options]
- 说明：如果需要增加超时时长 --timeout, 正常可能会下载两个一样的 不同分辨率的文件，只需要取小的那个(*_2.mp4) 分析 |

## 微信公众号
该命令仅支持下载（不支持直接查看），如果不需要的话注意清理
### 公众号搜索
- 输入：关键词
- 输出：文章搜索摘要内容
- 命令：opencli weixin search <query> [options]
- 常用options：
  - --page [value]   结果页码，从 1 开始  default: 1
  - --limit [value]  返回条数，最大 10  default: 10

### 公众号文章下载
- 输入：文章 url 地址
- 输出：文章内容，图片（可选）
- 命令：opencli weixin download --url [url] --output [value] --download-images [value]

## Twitter
### 平台登录
- 输入：无
- 输出：登录状态，status, logged_in, site, user_id, nickname
- 命令：opencli twitter login [options]
- 说明：若当前返回未登录，提醒用户协助登录，第一次打开该平台时使用

### 搜索内容
- 输入：搜索条件，支持 Raw X operators (e.g. "exact phrase", #tag, OR, lang:en, since:YYYY-MM-DD, from:, since:)
- 输出：id, author, bio, text, created_at, likes, views, url, has_media, media_urls, card, quoted_tweet
- 命令：opencli twitter search <query> [options]
- 常用options：
  - --limit [value] 搜索数量限制，默认 15
  - --product [value] 搜索类型(top (default), live (Latest), photos, video)
  - --top-by-engagement [value] 按照热度过滤(likes×1 + retweets×3 + replies×2 + bookmarks×5 + log10(views+1)×0.5) ，默认 0 不过滤

### 阅读完整内容（带评论）
- 输入：twitter id 或原文链接
- 输出：正文+评论
- 命令：opencli twitter thread <tweet-id> [options]
- 常用options：
  - --limit [value] 限制返回评论数量，默认 50
  - --top-by-engagement 同搜索

### 下载长文内容
- 输入：twitter id 或原文链接
- 输出：原文
- 命令：opencli twitter article <tweet-id> [options]

## reddit
### 搜索
- 输入：关键词
- 输出：帖子概览内容
- 命令：opencli reddit-api search <query> [options]

### 阅读帖子
- 输入：post id 或 url
- 输出：type, author, score, text
- 命令：opencli reddit-api read <post-id> [options]

### subreddit 帖子查看
- 输入：subreddit 名称
- 输出：帖子概览内容
- 命令：opencli reddit-api subreddit <name> [options]

## 知识星球

### 最新内容（feeds）
- 输入：group id
- 输出：topic_id, type, author, title, comments, likes, time, url
- 命令：opencli zsxq topics [options]
- 常用options：
  - --limit [value] 返回结果数量，默认20
  - --group_id [value] 默认当前激活group，一般第一次调用时建议带上该参数，后续统一会话里可以省略

### 搜索
- 输入：关键词
- 输出：topic_id, group, author, title, comments, likes, time, url
- 命令：opencli zsxq search <keyword> [options]
- 常用options：同查询最新内容

### 查询完整内容&评论
一般如果搜索，得到content以及不完整，且需要进一步深入查看完整内容时使用
- 输入：topic id
- 输出：topic_id, type, author, title, comments, likes, comment_preview, url
- 命令：opencli zsxq topic <id> [options]
- 常用options：
  - --comment_limit [value] 返回的评论数量，默认 20

## 其他一些优质内容渠道
### substack
- 搜索：opencli substack search (无需浏览器)
  - 常用options：--type [value]   搜索类型（posts=文章, publications=Newsletter）  default: posts  choices: posts, publications
- 查看并下载某篇内容：opencli web read --url "<url>" --output "<path>"

### HackerNews
- 搜索：opencli hackernews search <query>
- 查看：opencli hackernews read <id>

### Youtube
- 搜索：opencli youtube search <query> [options]
- 查看视频的metadata：opencli youtube video "<url>" 注意url 一定要带引号
- 获取视频字幕：opencli youtube transcript "<url>" [options]

### 通用网页内容获取
- 网页内容下载：opencli web read --url "<url>" --output "<path>"
