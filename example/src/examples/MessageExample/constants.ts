export const LOCAL_MARKDOWN_IMAGE_DATA_URI =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

export const LONG_PLAIN_MESSAGE =
  '普通文本保持调用方提供的累计正文，并在可用宽度内换行。'.repeat(12);

export const STREAM_MESSAGE_CHUNKS = [
  '第一段已到达。',
  '第二段继续追加。',
  '第三段形成完整累计正文。',
] as const;

export const MARKDOWN_DEMO_TEXT = `# Markdown 长文

这里是固定长文段落，用于检查中文换行、主题字体和消息宽度。${'持续展示调用方提供的正文。'.repeat(8)}

[只记录链接事件](https://example.invalid/reference)

| 商品 | 数量 | 状态 |
| --- | ---: | --- |
| 商品甲 | 2 | 待确认 |
| 商品乙 | 1 | 已选择 |

\`\`\`ts
const total = items.reduce((sum, item) => sum + item.quantity, 0);
\`\`\`

![本地固定图片](${LOCAL_MARKDOWN_IMAGE_DATA_URI})`;
