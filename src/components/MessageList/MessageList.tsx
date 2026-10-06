import { useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import type { RefAttributes } from 'react';
import { FlatList, View } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import {
  Button,
  IconButton,
  Spinner,
  useThemedStyles,
} from '@unif/react-native-design';
import { DEFAULT_END_THRESHOLD } from './constants';
import { createStyles } from './styles';
import { useWebPrependAnchor } from './webPrependAnchor';
import { useMessageListScroll } from './useMessageListScroll';
import { MessageListRow } from './MessageListRow';
import type { MessageListHandle, MessageListProps } from './types';

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
  const keys = useMemo(() => items.map(keyExtractor), [items, keyExtractor]);
  const { getRowNativeID, preservingPrependRef, cancelPrependPreservation } =
    useWebPrependAnchor({ listRef, itemsIdentity: items, keys });
  const {
    atEnd,
    scrollToEnd,
    onLayout,
    onContentSizeChange,
    onScroll,
    onUserScrollBegin,
    onScrollEndDrag,
    onMomentumScrollEnd,
  } = useMessageListScroll({
    listRef,
    keys,
    initialPosition,
    followOutput,
    endThreshold,
    onAtEndChange,
    preservingPrependRef,
    cancelPrependPreservation,
  });
  useImperativeHandle(ref, () => ({ scrollToEnd }), [scrollToEnd]);

  const renderRow = useCallback(
    ({ item, index }: ListRenderItemInfo<T>) => (
      <MessageListRow
        item={item}
        index={index}
        previous={renderSeparator ? items[index - 1] : undefined}
        nativeID={getRowNativeID(keys[index]!)}
        renderItem={renderItem}
        renderSeparator={renderSeparator}
        extraData={extraData}
      />
    ),
    [extraData, getRowNativeID, items, keys, renderItem, renderSeparator]
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
    () => (footer ? <View>{footer}</View> : undefined),
    [footer]
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
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={listEmpty}
        maintainVisibleContentPosition={MAINTAIN_VISIBLE_POSITION}
        keyboardDismissMode={keyboardDismissMode}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onLayout={onLayout}
        onContentSizeChange={onContentSizeChange}
        onScroll={onScroll}
        onScrollBeginDrag={onUserScrollBegin}
        onMomentumScrollBegin={onUserScrollBegin}
        onScrollEndDrag={onScrollEndDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
      />
      {showScrollToEnd && items.length > 0 && !atEnd ? (
        <View style={styles.returnToEnd} pointerEvents="box-none">
          {scrollToEndBusy ? (
            <View style={styles.returnProgress} pointerEvents="none">
              <Spinner size={44} thickness={2} />
            </View>
          ) : null}
          <IconButton
            icon="arrow-down"
            accessibilityLabel={
              scrollToEndBusy ? '回到最新消息，正在处理' : '回到最新消息'
            }
            variant="ghost"
            size="md"
            surfaceSize={36}
            iconSize={18}
            style={styles.returnButton}
            onPress={() => scrollToEnd()}
          />
        </View>
      ) : null}
    </View>
  );
}
