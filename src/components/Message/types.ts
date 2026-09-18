import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ChatAction } from '../../actions';

export type MessagePlacement = 'start' | 'end';
export type MessageStatus = 'idle' | 'pending' | 'streaming' | 'failed';
export interface MessageBaseProps {
  placement?: MessagePlacement;
  avatar?: ReactNode;
  name?: string;
  surface?: 'bubble' | 'outlined' | 'plain';
  fullWidth?: boolean;
  status?: MessageStatus;
  statusText?: string;
  header?: ReactNode;
  footer?: ReactNode;
  actions?: readonly ChatAction[];
  onPress?(): void;
  onLongPress?(): void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
export interface MessagePlainContent {
  text: string;
  format?: 'text';
  numberOfLines?: number;
  children?: never;
  onLinkPress?: never;
}
export interface MessageMarkdownContent {
  text: string;
  format: 'markdown';
  onLinkPress?(url: string): void;
  numberOfLines?: never;
  children?: never;
}
export interface MessageCustomContent {
  children?: ReactNode;
  text?: never;
  format?: never;
  numberOfLines?: never;
  onLinkPress?: never;
}
export type MessageProps = MessageBaseProps &
  (MessagePlainContent | MessageMarkdownContent | MessageCustomContent);
