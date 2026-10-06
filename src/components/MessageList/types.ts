import type { ReactNode } from 'react';
import type { ScrollViewProps, StyleProp, ViewStyle } from 'react-native';

export interface MessageListScrollOptions {
  animated?: boolean;
}
export interface MessageListHandle {
  scrollToEnd(options?: MessageListScrollOptions): void;
}
export interface MessageListProps<T> {
  items: readonly T[];
  keyExtractor(item: T): string;
  renderItem(item: T, index: number): ReactNode;
  extraData?: unknown;
  header?: ReactNode;
  footer?: ReactNode;
  empty?: ReactNode;
  renderSeparator?(previous: T, next: T): ReactNode;
  initialPosition?: 'start' | 'end';
  followOutput?: 'whenAtEnd' | 'never';
  endThreshold?: number;
  showScrollToEnd?: boolean;
  /** 外部仍在生成内容时显示返回入口的进度外环，不影响滚动操作。 */
  scrollToEndBusy?: boolean;
  onAtEndChange?(atEnd: boolean): void;
  hasEarlier?: boolean;
  loadingEarlier?: boolean;
  onRequestEarlier?(): void;
  keyboardDismissMode?: ScrollViewProps['keyboardDismissMode'];
  contentContainerStyle?: StyleProp<ViewStyle>;
  showsVerticalScrollIndicator?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
export interface ListMeasurements {
  viewport: number;
  content: number;
  offset: number;
  hasContentSize: boolean;
}
