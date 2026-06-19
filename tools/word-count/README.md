# word-count — 中英文字数统计

统计文本中的中文汉字数和英文单词数。

## 用法

```bash
# 按文件
word-count ./demo.txt

# 按字符串
word-count text "你好 world（test）Hello, AI!"
```

## 统计规则

- 中文汉字：每个汉字算 1 个字
- 英文：每个英文单词算 1 个字
- 空格、换行、括号、标点符号：不统计
- 数字：默认不统计

## 技术栈

- Perl — Unicode 文本处理，支持 UTF-8 / GB18030 / Big5 编码
