import {
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import type { RefAttributes } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import { Button, useThemedStyles } from '@unif/react-native-design';
import { DEFAULT_END_THRESHOLD } from './constants';
import { createStyles } from './styles';
import { useWebPrependAnchor } from './webPrependAnchor';
import { useMessageListScroll } from './useMessageListScroll';
import { MessageListRow } from './MessageListRow';
import { MessageListEndButton } from './MessageListEndButton';
import type {
  MessageListCellProps,
  MessageListHandle,
  MessageListProps,
} from './types';

const MAINTAIN_VISIBLE_POSITION = { minIndexForVisible: 0 };

export function MessageList<T>({
  items,
  keyExtractor,
  renderItem,
  extraData,
  header,
  footer,
  empty,
  renderSeparator,
  initialPosition = 'end',
  followOutput = 'whenAtEnd',
  endThreshold = DEFAULT_END_THRESHOLD,
  showScrollToEnd = true,
  scrollToEndBusy = false,
  onAtEndChange,
  hasEarlier = false,
  loadingEarlier = false,
  onRequestEarlier,
  keyboardDismissMode = 'on-drag',
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  style,
  testID,
  ref,
}: MessageListProps<T> & RefAttributes<MessageListHandle>) {
  const styles = useThemedStyles(createStyles);
  const listRef = useRef<FlatList<T>>(null);
  const listTestID = useRef(testID);
  listTestID.current = testID;
  const contentStyle = StyleSheet.flatten(contentContainerStyle);
  const keys = useMemo(() => items.map(keyExtractor), [items, keyExtractor]);
  const { getRowNativeID, preservingPrependRef, cancelPrependPreservation } =
    useWebPrependAnchor({ listRef, itemsIdentity: items, keys });
  const {
    atEnd,
    anchorMinimumHeight,
    anchorToItem,
    onCellLayout,
    onItemLayout,
    onCellUnmount,
    onFooterLayout,
    onScrollToIndexFailed,
    scrollToEnd,
    onLayout,
    onContentSizeChange,
    onScroll,
    onUserScrollBegin,
    onMomentumScrollBegin,
    onScrollEndDrag,
    onMomentumScrollEnd,
  } = useMessageListScroll({
    listRef,
    keys,
    initialPosition,
    followOutput,
    endThreshold,
    onAtEndChange,
    hasFooter: !!footer,
    contentMinimumHeight: contentStyle?.minHeight,
    contentBottomPadding:
      contentStyle?.paddingBottom ??
      contentStyle?.paddingVertical ??
      contentStyle?.padding,
    preservingPrependRef,
    cancelPrependPreservation,
  });
  useImperativeHandle(ref, () => ({ scrollToEnd, anchorToItem }), [
    scrollToEnd,
    anchorToItem,
  ]);

  const CellRenderer = useCallback(
    function MessageListCell({
      cellKey,
      index,
      children,
      style: cellStyle,
      onLayout: reportLayout,
      onFocusCapture,
    }: MessageListCellProps<T>) {
      const currentIndex = useRef(index);
      currentIndex.current = index;
      useLayoutEffect(
        () => () => onCellUnmount(cellKey, currentIndex.current),
        [cellKey]
      );
      return (
        <View
          style={cellStyle}
          onFocusCapture={onFocusCapture}
          testID={
            listTestID.current
              ? `${listTestID.current}-cell-${encodeURIComponent(cellKey)}`
              : undefined
          }
          onLayout={(event) => {
            reportLayout?.(event);
            onCellLayout(cellKey, index, event.nativeEvent.layout);
          }}
        >
          {children}
        </View>
      );
    },
    [onCellLayout, onCellUnmount]
  );

  const renderRow = useCallback(
    ({ item, index }: ListRenderItemInfo<T>) => (
      <MessageListRow
        item={item}
        index={index}
        itemKey={keys[index]!}
        onItemLayout={onItemLayout}
        testID={
          testID
            ? `${testID}-item-${encodeURIComponent(keys[index]!)}`
            : undefined
        }
        previous={renderSeparator ? items[index - 1] : undefined}
        nativeID={getRowNativeID(keys[index]!)}
        renderItem={renderItem}
        renderSeparator={renderSeparator}
        extraData={extraData}
      />
    ),
    [
      extraData,
      getRowNativeID,
      items,
      keys,
      onItemLayout,
      renderItem,
      renderSeparator,
      testID,
    ]
  );

  const history = hasEarlier && onRequestEarlier;
  const hasHeader = Boolean(header || history);
  const listHeader = useMemo(
    () =>
      hasHeader ? (
        <View>
          {header}
          {history ? (
            <Button
              label={loadingEarlier ? '正在加载…' : '查看更早消息'}
              variant="text"
              loading={loadingEarlier}
              onPress={onRequestEarlier}
            />
          ) : null}
        </View>
      ) : undefined,
    [hasHeader, header, history, loadingEarlier, onRequestEarlier]
  );
  const listFooter = useMemo(
    () =>
      footer ? <View onLayout={onFooterLayout}>{footer}</View> : undefined,
    [footer, onFooterLayout]
  );
  const listEmpty = useMemo(() => (empty ? <>{empty}</> : undefined), [empty]);
  return (
    <View style={[styles.root, style]} testID={testID}>
      <FlatList
        ref={listRef}
        testID={testID ? `${testID}-list` : undefined}
        style={styles.list}
        data={items}
        keyExtractor={keyExtractor}
        extraData={extraData}
        renderItem={renderRow}
        CellRendererComponent={CellRenderer}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={listEmpty}
        maintainVisibleContentPosition={
          items.length > 0 && anchorMinimumHeight === undefined
            ? MAINTAIN_VISIBLE_POSITION
            : undefined
        }
        keyboardDismissMode={keyboardDismissMode}
        contentContainerStyle={
          anchorMinimumHeight
            ? [contentContainerStyle, { minHeight: anchorMinimumHeight }]
            : contentContainerStyle
        }
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onLayout={onLayout}
        onContentSizeChange={onContentSizeChange}
        onScroll={onScroll}
        onScrollBeginDrag={onUserScrollBegin}
        onMomentumScrollBegin={onMomentumScrollBegin}
        onScrollEndDrag={onScrollEndDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollToIndexFailed={onScrollToIndexFailed}
      />
      {showScrollToEnd && items.length > 0 && !atEnd ? (
        <MessageListEndButton
          busy={scrollToEndBusy}
          onPress={() => scrollToEnd()}
        />
      ) : null}
    </View>
  );
}
