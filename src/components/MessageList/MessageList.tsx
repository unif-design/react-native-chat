import { useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import type { RefAttributes } from 'react';
import { FlatList, View } from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Button } from '@unif/react-native-design';
import { DEFAULT_END_THRESHOLD } from './constants';
import { styles } from './styles';
import { useWebPrependAnchor } from './webPrependAnchor';
import type {
  ListMeasurements,
  MessageListHandle,
  MessageListProps,
  MessageListScrollOptions,
} from './types';

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
  onAtEndChange,
  hasEarlier = false,
  loadingEarlier = false,
  onRequestEarlier,
  keyboardDismissMode = 'on-drag',
  style,
  testID,
  ref,
}: MessageListProps<T> & RefAttributes<MessageListHandle>) {
  const listRef = useRef<FlatList<T>>(null);
  const measurements = useRef<ListMeasurements>({
    viewport: 0,
    content: 0,
    offset: 0,
    hasContentSize: false,
  });
  const initial = useRef(initialPosition);
  const initialized = useRef(false);
  const previousKeys = useRef<readonly string[]>([]);
  const prependPending = useRef(false);
  const pendingScroll = useRef<MessageListScrollOptions | undefined>(undefined);
  const userScrolling = useRef(false);
  const atEndRef = useRef<boolean | undefined>(undefined);
  const [atEnd, setAtEnd] = useState(true);
  const threshold = Number.isFinite(endThreshold)
    ? Math.max(0, endThreshold)
    : DEFAULT_END_THRESHOLD;
  const keys = items.map(keyExtractor);
  const { getRowNativeID, preservingPrependRef, cancelPrependPreservation } =
    useWebPrependAnchor({ listRef, itemsIdentity: items, keys });

  useLayoutEffect(() => {
    const previous = previousKeys.current;
    const added = keys.length - previous.length;
    const onlyPrepended =
      previous.length > 0 &&
      added > 0 &&
      previous.every((key, index) => keys[index + added] === key);
    const changed =
      keys.length !== previous.length ||
      keys.some((key, index) => key !== previous[index]);
    if (changed) prependPending.current = onlyPrepended;
    previousKeys.current = keys;
  });

  function ready() {
    const current = measurements.current;
    return current.viewport > 0 && current.hasContentSize;
  }

  function publishPosition() {
    if (!ready()) return;
    const { viewport, content, offset } = measurements.current;
    const next = content - viewport - Math.max(0, offset) <= threshold;
    if (next !== atEndRef.current) {
      atEndRef.current = next;
      setAtEnd(next);
      onAtEndChange?.(next);
    }
  }

  function scrollToEnd(options: MessageListScrollOptions = {}) {
    cancelPrependPreservation();
    const request = { animated: options.animated ?? true };
    if (!ready()) {
      pendingScroll.current = request;
      return;
    }
    pendingScroll.current = undefined;
    listRef.current?.scrollToOffset({
      offset: Math.max(
        0,
        measurements.current.content - measurements.current.viewport
      ),
      animated: request.animated,
    });
    if (measurements.current.content <= measurements.current.viewport)
      publishPosition();
  }

  useImperativeHandle(ref, () => ({ scrollToEnd }));

  function reconcileLayout(contentChanged: boolean) {
    if (!ready()) return;
    const request = pendingScroll.current;
    if (items.length > 0 && !initialized.current) {
      initialized.current = true;
      if (request || initial.current === 'end') {
        scrollToEnd(request ?? { animated: false });
        return;
      }
      publishPosition();
      return;
    }
    if (request) {
      scrollToEnd(request);
      return;
    }
    const prepended = prependPending.current;
    if (contentChanged) prependPending.current = false;
    const shouldFollow =
      initialized.current &&
      followOutput === 'whenAtEnd' &&
      !userScrolling.current &&
      !prepended &&
      !preservingPrependRef.current &&
      atEndRef.current;
    if (shouldFollow) scrollToEnd({ animated: false });
    else publishPosition();
  }

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const movedUp = contentOffset.y < measurements.current.offset;
    const resizingAtEnd =
      atEndRef.current &&
      !movedUp &&
      !userScrolling.current &&
      followOutput === 'whenAtEnd' &&
      (measurements.current.content !== contentSize.height ||
        measurements.current.viewport !== layoutMeasurement.height);
    measurements.current = {
      offset: contentOffset.y,
      content: contentSize.height,
      viewport: layoutMeasurement.height,
      hasContentSize: true,
    };
    if (!resizingAtEnd) publishPosition();
  }

  const history = hasEarlier && onRequestEarlier;
  const hasHeader = Boolean(header || history);
  return (
    <View style={[styles.root, style]} testID={testID}>
      <FlatList
        ref={listRef}
        testID={testID ? `${testID}-list` : undefined}
        style={styles.list}
        data={items}
        keyExtractor={keyExtractor}
        extraData={extraData}
        renderItem={({ item, index }) => (
          <View nativeID={getRowNativeID(keyExtractor(item))}>
            {index > 0 && renderSeparator
              ? renderSeparator(items[index - 1]!, item)
              : null}
            {renderItem(item, index)}
          </View>
        )}
        ListHeaderComponent={
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
          ) : undefined
        }
        ListFooterComponent={footer ? <View>{footer}</View> : undefined}
        ListEmptyComponent={empty ? <View>{empty}</View> : undefined}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        keyboardDismissMode={keyboardDismissMode}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onLayout={({ nativeEvent: { layout } }) => {
          measurements.current.viewport = layout.height;
          reconcileLayout(false);
        }}
        onContentSizeChange={(_width, height) => {
          measurements.current.content = height;
          measurements.current.hasContentSize = true;
          reconcileLayout(true);
        }}
        onScroll={onScroll}
        onScrollBeginDrag={() => {
          userScrolling.current = true;
        }}
        onMomentumScrollBegin={() => {
          userScrolling.current = true;
        }}
        onScrollEndDrag={(event) => {
          onScroll(event);
          if (!event.nativeEvent.velocity?.y) {
            userScrolling.current = false;
            publishPosition();
          }
        }}
        onMomentumScrollEnd={(event) => {
          onScroll(event);
          userScrolling.current = false;
          publishPosition();
        }}
      />
      {showScrollToEnd && items.length > 0 && !atEnd ? (
        <Button
          label="回到最新消息"
          variant="secondary"
          style={styles.returnToEnd}
          onPress={() => scrollToEnd()}
        />
      ) : null}
    </View>
  );
}
