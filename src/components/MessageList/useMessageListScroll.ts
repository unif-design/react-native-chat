import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type {
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { DEFAULT_END_THRESHOLD } from './constants';
import type {
  ListMeasurements,
  MessageListProps,
  MessageListScrollOptions,
} from './types';

interface MessageListScrollInput<T> extends Pick<
  MessageListProps<T>,
  'initialPosition' | 'followOutput' | 'endThreshold' | 'onAtEndChange'
> {
  listRef: RefObject<FlatList<T> | null>;
  keys: readonly string[];
  preservingPrependRef: RefObject<boolean>;
  cancelPrependPreservation(): void;
}

export function useMessageListScroll<T>({
  listRef,
  keys,
  initialPosition,
  followOutput,
  endThreshold = DEFAULT_END_THRESHOLD,
  onAtEndChange,
  preservingPrependRef,
  cancelPrependPreservation,
}: MessageListScrollInput<T>) {
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
  }, [keys]);

  const ready = useCallback(() => {
    const current = measurements.current;
    return current.viewport > 0 && current.hasContentSize;
  }, []);

  const publishPosition = useCallback(() => {
    if (!ready()) return;
    const { viewport, content, offset } = measurements.current;
    const next = content - viewport - Math.max(0, offset) <= threshold;
    if (next !== atEndRef.current) {
      atEndRef.current = next;
      setAtEnd(next);
      onAtEndChange?.(next);
    }
  }, [onAtEndChange, ready, threshold]);

  const scrollToEnd = useCallback(
    (options: MessageListScrollOptions = {}) => {
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
    },
    [cancelPrependPreservation, listRef, publishPosition, ready]
  );

  const itemCount = keys.length;
  const reconcileLayout = useCallback(
    (contentChanged: boolean) => {
      if (!ready()) return;
      const request = pendingScroll.current;
      if (itemCount > 0 && !initialized.current) {
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
    },
    [
      followOutput,
      itemCount,
      preservingPrependRef,
      publishPosition,
      ready,
      scrollToEnd,
    ]
  );

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent;
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
    },
    [followOutput, publishPosition]
  );

  const onLayout = useCallback(
    ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
      measurements.current.viewport = layout.height;
      reconcileLayout(false);
    },
    [reconcileLayout]
  );
  const onContentSizeChange = useCallback(
    (_width: number, height: number) => {
      measurements.current.content = height;
      measurements.current.hasContentSize = true;
      reconcileLayout(true);
    },
    [reconcileLayout]
  );
  const onUserScrollBegin = useCallback(() => {
    userScrolling.current = true;
  }, []);
  const onScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      onScroll(event);
      if (!event.nativeEvent.velocity?.y) {
        userScrolling.current = false;
        publishPosition();
      }
    },
    [onScroll, publishPosition]
  );
  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      onScroll(event);
      userScrolling.current = false;
      publishPosition();
    },
    [onScroll, publishPosition]
  );

  return {
    atEnd,
    scrollToEnd,
    onLayout,
    onContentSizeChange,
    onScroll,
    onUserScrollBegin,
    onScrollEndDrag,
    onMomentumScrollEnd,
  };
}
