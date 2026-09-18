import type { ChatAttachmentItem } from '@unif/react-native-chat';

export const DEMO_IMAGE_URI =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff1df"/><stop offset="1" stop-color="#f7b26d"/></linearGradient></defs><rect width="320" height="180" rx="24" fill="url(#g)"/><circle cx="244" cy="48" r="22" fill="#fff" opacity=".7"/><path d="M38 142 112 70l42 42 34-28 94 58H38Z" fill="#eb6e00" opacity=".72"/></svg>'
  );

export const INITIAL_ATTACHMENTS: readonly ChatAttachmentItem[] = [
  {
    id: 'photo',
    name: '窗边的午后.svg',
    kind: 'image',
    thumbnail: { uri: DEMO_IMAGE_URI },
    meta: '320 × 180',
    status: 'ready',
    previewable: true,
    removable: true,
  },
  {
    id: 'notes',
    name: '访谈笔记.md',
    kind: 'file',
    meta: '18 KB',
    status: 'uploading',
    statusText: '正在准备',
    progress: 0.62,
    loadingVisual: 'caption',
    removable: true,
  },
  {
    id: 'brief',
    name: '项目简报.pdf',
    kind: 'file',
    meta: '1.2 MB',
    status: 'processing',
    statusText: '正在读取内容',
    loadingVisual: 'caption',
  },
];
