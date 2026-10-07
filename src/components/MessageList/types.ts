import type { ComponentProps, ReactNode } from 'react';
import type {
  FlatListProps,
  LayoutRectangle,
  ScrollViewProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

export interface MessageListScrollOptions {
  animated?: boolean;
}
export interface MessageListAnchorOptions extends MessageListScrollOptions {
  /** 正文顶端距列表视口顶部的留白，默认 0。 */
  topOffset?: number;
}
export interface MessageListHandle {
  scrollToEnd(options?: MessageListScrollOptions): void;
  /** 按稳定 key 等待真实布局并顶锚；用户拖动、回到末尾或目标删除时结束。 */
  anchorToItem(key: string, options?: MessageListAnchorOptions): void;
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
  width: number;
  viewport: number;
  content: number;
  offset: number;
  hasContentSize: boolean;
}
export type MessageListCellProps<T> = ComponentProps<
  NonNullable<FlatListProps<T>['CellRendererComponent']>
>;
export interface MessageListRowProps<T> extends Pick<
  MessageListProps<T>,
  'renderItem' | 'renderSeparator' | 'extraData'
> {
  item: T;
  previous: T | undefined;
  index: number;
  itemKey: string;
  nativeID: string;
  testID?: string;
  onItemLayout(key: string, index: number, y: number): void;
}
export interface MessageListItemLayout {
  index: number;
  cell?: LayoutRectangle;
  itemY?: number;
}
export interface MessageListAnchorRequest {
  key: string;
  topOffset: number;
  animated: boolean;
  seen: boolean;
  locatedAt?: number;
  offset?: number;
  viewport?: number;
  settled?: boolean;
}
export interface MessageListPendingScroll extends MessageListScrollOptions {
  contentBeforeRelease?: number;
}
export interface MessageListEndButtonProps {
  busy: boolean;
  onPress(): void;
}
