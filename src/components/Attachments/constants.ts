import { icon, r } from '@unif/react-native-design';
import type { IconName } from '@unif/react-native-design';
import type { ChatAttachmentItem } from './types';

export const CARD_WIDTH = r(76);
export const ROW_IMAGE_SIZE = icon.xl;
export const MIXED_IMAGE_SIZE = r(36);
export const ATTACHMENT_STATUS_SIZE = r(40);
export const ATTACHMENT_STATUS_OWNER_SIZE = Math.max(
  44,
  ATTACHMENT_STATUS_SIZE
);
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
