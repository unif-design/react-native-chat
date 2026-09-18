import type { ChatAttachmentItem } from '@unif/react-native-chat';
import type { AttachmentsExampleLayout } from './types';

export const LOCAL_IMAGE_DATA_URI =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

export const INVALID_LOCAL_IMAGE_DATA_URI = 'data:image/png;base64,invalid';

export const ATTACHMENT_LAYOUTS: readonly {
  value: AttachmentsExampleLayout;
  label: string;
}[] = [
  { value: 'grid', label: '网格' },
  { value: 'mixed', label: '混合' },
  { value: 'carousel', label: '横向' },
  { value: 'list', label: '列表' },
];

export const INITIAL_ATTACHMENT_ITEMS: readonly ChatAttachmentItem[] = [
  {
    id: 'idle-image',
    name: '本地图片（空闲）',
    kind: 'image',
    status: 'idle',
    thumbnail: { uri: LOCAL_IMAGE_DATA_URI },
    previewable: true,
    removable: true,
  },
  {
    id: 'uploading-center',
    name: '已知比例（中央）',
    kind: 'image',
    status: 'uploading',
    progress: 0.42,
    loadingVisual: 'center',
    thumbnail: { uri: LOCAL_IMAGE_DATA_URI },
  },
  {
    id: 'uploading-border',
    name: '未知比例（边缘）',
    kind: 'video',
    status: 'uploading',
    loadingVisual: 'border',
  },
  {
    id: 'processing-caption',
    name: '处理状态（说明）',
    kind: 'audio',
    status: 'processing',
    loadingVisual: 'caption',
  },
  {
    id: 'ready-fallback',
    name: '失败图片占位（就绪）',
    kind: 'image',
    status: 'ready',
    thumbnail: { uri: INVALID_LOCAL_IMAGE_DATA_URI },
    previewable: true,
  },
  {
    id: 'failed-file',
    name: '失败文件',
    kind: 'file',
    meta: 'PDF · 2.4 MB',
    status: 'failed',
    statusText: '样例处理失败',
    removable: true,
  },
];
