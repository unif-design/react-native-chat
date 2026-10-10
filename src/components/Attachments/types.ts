import type { ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';
import type { ChatAction } from '../../actions';

export type ChatAttachmentStatus =
  'idle' | 'uploading' | 'processing' | 'ready' | 'failed';
export interface ChatAttachmentItem {
  id: string;
  name?: string;
  kind?: 'image' | 'file' | 'audio' | 'video';
  thumbnail?: ImageSourcePropType;
  meta?: string;
  status?: ChatAttachmentStatus;
  statusText?: string;
  progress?: number;
  loadingVisual?: 'center' | 'caption';
  previewable?: boolean;
  removable?: boolean;
  removeDisabled?: boolean;
  actions?: readonly ChatAction[];
}
export interface AttachmentsProps {
  items: readonly ChatAttachmentItem[];
  layout?: 'grid' | 'compact' | 'mixed' | 'carousel' | 'list' | 'preview';
  showProgressLabel?: boolean;
  onPreview?(item: ChatAttachmentItem): void;
  onRemove?(item: ChatAttachmentItem): void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
export interface AttachmentItemProps extends Pick<
  AttachmentsProps,
  'showProgressLabel' | 'onPreview' | 'onRemove'
> {
  item: ChatAttachmentItem;
  width?: number;
  imageSize: number;
  row: boolean;
  mixed?: boolean;
  compact?: boolean;
  preview?: boolean;
}
