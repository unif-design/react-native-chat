import type { IconName } from '@unif/react-native-design';
import type { ChatAttachmentItem } from './types';

export const CARD_WIDTH = 144;
export const ROW_IMAGE_SIZE = 56;
export const ATTACHMENT_ICONS: Record<
  NonNullable<ChatAttachmentItem['kind']>,
  IconName
> = {
  image: 'image',
  file: 'file',
  audio: 'sound',
  video: 'play',
};
export const STATUS_LABELS = {
  idle: '',
  uploading: '正在上传',
  processing: '正在处理',
  ready: '',
  failed: '处理失败',
} as const;
